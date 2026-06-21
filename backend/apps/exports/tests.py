from datetime import timedelta
import json
from unittest.mock import patch
from zipfile import ZipFile

from django.contrib.auth import get_user_model
from django.test import SimpleTestCase, TestCase
from django.utils import timezone
from rest_framework.exceptions import ValidationError
from rest_framework.test import APIClient

from apps.datasets.services import (
    create_dataset,
    create_dataset_api_key,
    create_dataset_version,
    revoke_dataset_api_key,
)
from apps.projects.services import create_project

from .archives import build_export_archive
from .services import (
    build_coco_export_from_snapshot,
    build_visual_genome_export_from_snapshot,
    build_yolo_export_from_snapshot,
)


User = get_user_model()


class DatasetExportAuthenticationTests(TestCase):
    def setUp(self):
        self.admin = User.objects.create_user(
            username="export-admin",
            email="export-admin@example.com",
            password="test-password-123",
        )
        self.project = create_project(
            owner=self.admin,
            name="Export project",
        )
        self.dataset = create_dataset(
            project=self.project,
            created_by=self.admin,
            name="Export dataset",
        )
        self.api_key, self.raw_api_key = create_dataset_api_key(
            dataset=self.dataset,
            created_by=self.admin,
            name="Export integration",
        )
        self.first_version = create_dataset_version(
            dataset=self.dataset,
            created_by=self.admin,
            version_tag="v1",
        )
        self.client = APIClient()
        archive_upload_patcher = patch(
            "apps.exports.views.upload_export_archive",
            return_value="http://storage.example/export.zip",
        )
        self.mock_upload_export_archive = archive_upload_patcher.start()
        self.addCleanup(archive_upload_patcher.stop)

    @property
    def endpoint(self):
        return f"/api/v1/datasets/{self.dataset.id}/export"

    def test_dataset_api_key_can_export_without_a_user_token(self):
        response = self.client.get(
            self.endpoint,
            {"format": "coco"},
            HTTP_X_API_KEY=self.raw_api_key,
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["dataset_id"], str(self.dataset.id))
        self.assertEqual(response.data["format"], "coco")
        self.assertEqual(
            response.data["download_url"],
            "http://storage.example/export.zip",
        )

    def test_bearer_authenticated_user_can_still_export(self):
        self.client.force_authenticate(user=self.admin)

        response = self.client.get(self.endpoint, {"format": "coco"})

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["version_tag"], "v1")

    def test_bearer_export_without_version_uses_latest_snapshot(self):
        self.dataset.name = "Name captured by v2"
        self.dataset.save(update_fields=["name", "updated_at"])
        create_dataset_version(
            dataset=self.dataset,
            created_by=self.admin,
            version_tag="v2",
        )
        self.dataset.name = "Unversioned live name"
        self.dataset.save(update_fields=["name", "updated_at"])
        self.client.force_authenticate(user=self.admin)

        response = self.client.get(self.endpoint, {"format": "coco"})

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["version_tag"], "v2")
        self.assertIn("Name captured by v2", response.data["data"]["info"]["description"])

    def test_bearer_export_can_select_an_explicit_version(self):
        create_dataset_version(
            dataset=self.dataset,
            created_by=self.admin,
            version_tag="v2",
        )
        self.client.force_authenticate(user=self.admin)

        response = self.client.get(
            self.endpoint,
            {"format": "coco", "version": "v1"},
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["version_tag"], "v1")

    def test_missing_credentials_are_rejected(self):
        response = self.client.get(self.endpoint, {"format": "coco"})

        self.assertEqual(response.status_code, 401)

    def test_invalid_api_key_is_rejected(self):
        response = self.client.get(
            self.endpoint,
            {"format": "coco"},
            HTTP_X_API_KEY="cdat_not-a-real-key",
        )

        self.assertEqual(response.status_code, 401)

    def test_revoked_api_key_is_forbidden(self):
        revoke_dataset_api_key(api_key=self.api_key)

        response = self.client.get(
            self.endpoint,
            {"format": "coco"},
            HTTP_X_API_KEY=self.raw_api_key,
        )

        self.assertEqual(response.status_code, 403)

    def test_expired_api_key_is_forbidden(self):
        self.api_key.expires_at = timezone.now() - timedelta(seconds=1)
        self.api_key.save(update_fields=["expires_at"])

        response = self.client.get(
            self.endpoint,
            {"format": "coco"},
            HTTP_X_API_KEY=self.raw_api_key,
        )

        self.assertEqual(response.status_code, 403)

    def test_api_key_cannot_export_a_different_dataset(self):
        other_dataset = create_dataset(
            project=self.project,
            created_by=self.admin,
            name="Other dataset",
        )

        response = self.client.get(
            f"/api/v1/datasets/{other_dataset.id}/export",
            {"format": "coco"},
            HTTP_X_API_KEY=self.raw_api_key,
        )

        self.assertEqual(response.status_code, 401)

    def test_api_key_export_ignores_version_selection(self):
        response = self.client.get(
            self.endpoint,
            {"format": "coco", "version": "not-a-real-version"},
            HTTP_X_API_KEY=self.raw_api_key,
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["version_tag"], "v1")

    def test_api_key_can_be_restricted_to_a_version(self):
        create_dataset_version(
            dataset=self.dataset,
            created_by=self.admin,
            version_tag="v2",
        )
        _, raw_key = create_dataset_api_key(
            dataset=self.dataset,
            created_by=self.admin,
            name="v1 integration",
            target_version="v1",
        )

        response = self.client.get(
            self.endpoint,
            {"format": "coco"},
            HTTP_X_API_KEY=raw_key,
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["version_tag"], "v1")

    def test_admin_can_create_expiring_version_scoped_key(self):
        self.client.force_authenticate(user=self.admin)

        response = self.client.post(
            f"/api/v1/datasets/{self.dataset.id}/api-keys/",
            {
                "name": "Training pipeline",
                "ttl_days": 30,
                "target_version": "v1",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data["target_version"], "v1")
        self.assertIsNotNone(response.data["expires_at"])
        self.assertIn("raw_key", response.data)

    def test_api_key_cannot_target_a_missing_version(self):
        self.client.force_authenticate(user=self.admin)

        response = self.client.post(
            f"/api/v1/datasets/{self.dataset.id}/api-keys/",
            {
                "name": "Bad target",
                "target_version": "missing",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 400)

    def test_legacy_trailing_slash_route_remains_available(self):
        response = self.client.get(
            f"{self.endpoint}/",
            {"format": "coco"},
            HTTP_X_API_KEY=self.raw_api_key,
        )

        self.assertEqual(response.status_code, 200)


class ExportArchiveTests(TestCase):
    def test_coco_archive_contains_json_annotation_file(self):
        export_data = {"format": "coco", "images": [], "annotations": []}

        archive = build_export_archive(
            export_data=export_data,
            export_format="coco",
        )
        self.addCleanup(archive.close)

        with ZipFile(archive) as zip_file:
            self.assertEqual(
                zip_file.namelist(),
                ["annotations/instances.json"],
            )
            stored_data = json.loads(
                zip_file.read("annotations/instances.json")
            )

        self.assertEqual(stored_data, export_data)

    def test_yolo_archive_contains_classes_and_safe_label_paths(self):
        export_data = {
            "format": "yolo",
            "classes": [{"name": "cat"}, {"name": "dog"}],
            "files": [
                {
                    "image_id": "image-1",
                    "label_filename": "../../unsafe.txt",
                    "content": "0 0.5 0.5 1 1",
                }
            ],
        }

        archive = build_export_archive(
            export_data=export_data,
            export_format="yolo",
        )
        self.addCleanup(archive.close)

        with ZipFile(archive) as zip_file:
            self.assertEqual(
                set(zip_file.namelist()),
                {"classes.txt", "labels/unsafe.txt"},
            )
            self.assertEqual(zip_file.read("classes.txt"), b"cat\ndog")


class SnapshotVisualGenomeExportTests(TestCase):
    def test_excluded_classes_and_predicates_are_not_exported(self):
        snapshot = {
            "taxonomy": {
                "classes": [
                    {"id": "included-class", "include_in_export": True},
                    {"id": "excluded-class", "include_in_export": False},
                ],
                "predicates": [
                    {"id": "included-predicate", "include_in_export": True},
                    {"id": "excluded-predicate", "include_in_export": False},
                ],
            },
            "assets": [
                {
                    "asset_id": "image-1",
                    "filename": "image.jpg",
                    "width": 100,
                    "height": 100,
                    "objects": [
                        {
                            "id": "object-1",
                            "class_id": "included-class",
                            "class_name": "cat",
                            "type": "bbox",
                            "coordinates": [0, 0, 10, 10],
                        },
                        {
                            "id": "object-2",
                            "class_id": "excluded-class",
                            "class_name": "secret",
                            "type": "bbox",
                            "coordinates": [20, 20, 10, 10],
                        },
                    ],
                    "relationships": [
                        {
                            "id": "relationship-1",
                            "subject_id": "object-1",
                            "object_id": "object-1",
                            "predicate_id": "included-predicate",
                            "predicate": "near",
                        },
                        {
                            "id": "relationship-2",
                            "subject_id": "object-1",
                            "object_id": "object-1",
                            "predicate_id": "excluded-predicate",
                            "predicate": "hidden",
                        },
                        {
                            "id": "relationship-3",
                            "subject_id": "object-1",
                            "object_id": "object-2",
                            "predicate_id": "included-predicate",
                            "predicate": "near",
                        },
                    ],
                }
            ],
        }

        result = build_visual_genome_export_from_snapshot(snapshot=snapshot)

        self.assertEqual(
            [item["object_id"] for item in result["images"][0]["objects"]],
            ["object-1"],
        )
        self.assertEqual(
            [
                item["relationship_id"]
                for item in result["images"][0]["relationships"]
            ],
            ["relationship-1"],
        )


class SnapshotGeometryValidationTests(SimpleTestCase):
    def test_yolo_rejects_assets_without_dimensions(self):
        snapshot = {
            "taxonomy": {"classes": []},
            "assets": [
                {
                    "asset_id": "image-1",
                    "filename": "image.jpg",
                    "width": None,
                    "height": None,
                    "objects": [],
                }
            ],
        }

        with self.assertRaisesMessage(
            ValidationError,
            "Image width and height must be positive",
        ):
            build_yolo_export_from_snapshot(snapshot=snapshot)

    def test_coco_rejects_out_of_bounds_geometry(self):
        snapshot = {
            "taxonomy": {
                "classes": [
                    {
                        "id": "class-1",
                        "name": "cat",
                        "index": 0,
                        "include_in_export": True,
                    }
                ]
            },
            "assets": [
                {
                    "asset_id": "image-1",
                    "filename": "image.jpg",
                    "width": 100,
                    "height": 100,
                    "objects": [
                        {
                            "id": "object-1",
                            "class_id": "class-1",
                            "class_name": "cat",
                            "type": "bbox",
                            "coordinates": [90, 90, 20, 20],
                        }
                    ],
                }
            ],
        }

        with self.assertRaisesMessage(
            ValidationError,
            "bbox coordinates must stay within the image bounds",
        ):
            build_coco_export_from_snapshot(snapshot=snapshot)

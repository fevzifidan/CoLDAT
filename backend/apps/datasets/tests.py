from django.contrib.auth import get_user_model
from django.test import TestCase

from apps.annotations.models import AnnotationObject
from apps.assets.models import Asset
from apps.projects.services import create_project
from apps.tasks.models import Task, TaskImage
from apps.tasks.services import task_has_annotations
from apps.taxonomy.models import ProjectClass

from .services import (
    create_dataset,
    create_dataset_version,
    restore_dataset_version,
)


User = get_user_model()


class DatasetVersionRestoreTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="version-admin",
            email="version-admin@example.com",
            password="test-password-123",
        )
        self.project = create_project(
            owner=self.user,
            name="Versioned project",
        )
        self.dataset = create_dataset(
            project=self.project,
            created_by=self.user,
            name="Versioned dataset",
        )
        self.project_class = ProjectClass.objects.create(
            project=self.project,
            name="Cat",
            color="#ff0000",
            index=0,
        )
        self.asset = Asset.objects.create(
            dataset=self.dataset,
            filename="cat.jpg",
            mime_type="image/jpeg",
            width=100,
            height=100,
            storage_key="datasets/versioned/assets/cat.jpg",
            uploaded_by=self.user,
            status=Asset.UploadStatus.UPLOADED,
        )
        self.task = Task.objects.create(
            dataset=self.dataset,
            assignee=self.user,
            created_by=self.user,
            name="Annotate cats",
        )
        TaskImage.objects.create(task=self.task, image=self.asset)

    def test_replace_restore_removes_task_annotations_not_in_snapshot(self):
        version_without_annotations = create_dataset_version(
            dataset=self.dataset,
            created_by=self.user,
            version_tag="before-annotations",
        )

        AnnotationObject.objects.create(
            image=self.asset,
            annotation_class=self.project_class,
            geometry_type=AnnotationObject.GeometryType.BBOX,
            coordinates=[10, 10, 30, 30],
            created_by=self.user,
            updated_by=self.user,
        )
        create_dataset_version(
            dataset=self.dataset,
            created_by=self.user,
            version_tag="after-annotations",
        )

        self.assertTrue(task_has_annotations(task=self.task))

        restored_version = restore_dataset_version(
            source_version=version_without_annotations,
            created_by=self.user,
            mode="replace",
        )

        self.assertEqual(restored_version.snapshot, version_without_annotations.snapshot)
        self.assertFalse(task_has_annotations(task=self.task))
        self.assertFalse(AnnotationObject.objects.filter(image=self.asset).exists())
        self.assertTrue(TaskImage.objects.filter(task=self.task, image=self.asset).exists())

    def test_create_new_restore_copies_source_snapshot_not_current_state(self):
        version_without_annotations = create_dataset_version(
            dataset=self.dataset,
            created_by=self.user,
            version_tag="before-annotations",
        )

        AnnotationObject.objects.create(
            image=self.asset,
            annotation_class=self.project_class,
            geometry_type=AnnotationObject.GeometryType.BBOX,
            coordinates=[10, 10, 30, 30],
            created_by=self.user,
            updated_by=self.user,
        )

        restored_version = restore_dataset_version(
            source_version=version_without_annotations,
            created_by=self.user,
            mode="create_new",
        )

        self.assertEqual(restored_version.snapshot, version_without_annotations.snapshot)
        self.assertTrue(task_has_annotations(task=self.task))

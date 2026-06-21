from datetime import timedelta

from django.contrib.auth import get_user_model
from django.test import TestCase
from django.utils import timezone
from django.utils.dateparse import parse_datetime
from rest_framework.test import APIClient

from apps.annotations.models import AnnotationObject
from apps.annotations.permissions import CanEditImageAnnotations
from apps.assets.services import create_asset
from apps.datasets.services import create_dataset
from apps.projects.models import ProjectMembership
from apps.projects.services import create_project
from apps.taxonomy.models import ProjectClass

from .models import Task, TaskImage


User = get_user_model()


class TaskMetadataAPITests(TestCase):
    endpoint = "/api/v1/tasks/"

    def setUp(self):
        self.admin = User.objects.create_user(
            username="task-admin",
            email="task-admin@example.com",
            password="test-password-123",
        )
        self.assignee = User.objects.create_user(
            username="task-annotator",
            email="task-annotator@example.com",
            password="test-password-123",
        )
        self.project = create_project(
            owner=self.admin,
            name="Task project",
        )
        ProjectMembership.objects.create(
            project=self.project,
            user=self.assignee,
        )
        self.dataset = create_dataset(
            project=self.project,
            created_by=self.admin,
            name="Task dataset",
        )
        self.asset = create_asset(
            dataset=self.dataset,
            uploaded_by=self.admin,
            storage_key="tests/tasks/image.png",
            filename="image.png",
            mime_type="image/png",
            width=640,
            height=480,
        )
        self.client = APIClient()
        self.client.force_authenticate(user=self.admin)

    def _create_payload(self, **overrides):
        payload = {
            "dataset_id": str(self.dataset.id),
            "assignee_username": self.assignee.username,
            "image_ids": [str(self.asset.id)],
        }
        payload.update(overrides)
        return payload

    def test_create_task_accepts_name_description_priority_and_deadline(self):
        deadline = timezone.now() + timedelta(days=3)

        response = self.client.post(
            self.endpoint,
            self._create_payload(
                name="Label storefront images",
                description="Annotate every visible product and shelf.",
                priority=Task.Priority.HIGH,
                role=Task.Role.ANNOTATOR,
                deadline=deadline.isoformat(),
            ),
            format="json",
        )

        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data["name"], "Label storefront images")
        self.assertEqual(
            response.data["description"],
            "Annotate every visible product and shelf.",
        )
        self.assertEqual(response.data["priority"], Task.Priority.HIGH)
        self.assertEqual(response.data["role"], Task.Role.ADMIN)
        self.assertEqual(parse_datetime(response.data["deadline"]), deadline)
        self.assertIsNone(response.data["started_at"])
        self.assertIsNone(response.data["completed_at"])

        task = Task.objects.get(id=response.data["id"])
        self.assertEqual(task.name, "Label storefront images")
        self.assertEqual(task.priority, Task.Priority.HIGH)
        self.assertEqual(task.deadline, deadline)

    def test_create_task_keeps_legacy_note_as_description_alias(self):
        response = self.client.post(
            self.endpoint,
            self._create_payload(note="Legacy task instructions"),
            format="json",
        )

        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data["name"], "Untitled Task")
        self.assertEqual(response.data["description"], "Legacy task instructions")
        self.assertEqual(response.data["priority"], Task.Priority.MEDIUM)
        self.assertEqual(response.data["note"], "")

    def test_rejects_unknown_priority(self):
        response = self.client.post(
            self.endpoint,
            self._create_payload(priority="critical"),
            format="json",
        )

        self.assertEqual(response.status_code, 400)

    def test_rejects_deadline_in_the_past(self):
        response = self.client.post(
            self.endpoint,
            self._create_payload(
                deadline=(timezone.now() - timedelta(minutes=1)).isoformat(),
            ),
            format="json",
        )

        self.assertEqual(response.status_code, 400)

    def test_first_assignee_interaction_records_started_at(self):
        task = self._create_task_model()
        self.client.force_authenticate(user=self.assignee)

        response = self.client.get(f"/api/v1/tasks/{task.id}/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["status"], Task.Status.IN_PROGRESS)
        self.assertIsNotNone(response.data["started_at"])
        task.refresh_from_db()
        self.assertIsNotNone(task.started_at)

    def test_task_role_is_selected_independently_of_dataset_role(self):
        response = self.client.post(
            self.endpoint,
            self._create_payload(role=Task.Role.VIEWER),
            format="json",
        )

        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data["role"], Task.Role.ADMIN)
        task = Task.objects.get(id=response.data["id"])
        self.assertEqual(task.role, Task.Role.VIEWER)

        self.client.force_authenticate(user=self.assignee)
        assignee_response = self.client.get(f"/api/v1/tasks/{task.id}/")
        self.assertEqual(assignee_response.data["role"], Task.Role.VIEWER)

    def test_task_role_controls_annotation_edit_permission(self):
        task = self._create_task_model(role=Task.Role.ANNOTATOR)
        request = type("Request", (), {"user": self.assignee})()
        permission = CanEditImageAnnotations()

        self.assertTrue(
            permission.has_object_permission(request, None, self.asset)
        )

        task.role = Task.Role.VIEWER
        task.save(update_fields=["role"])

        self.assertFalse(
            permission.has_object_permission(request, None, self.asset)
        )

    def test_admin_task_list_response_uses_role_field(self):
        self._create_task_model(role=Task.Role.VIEWER)

        response = self.client.get(
            f"/api/v1/datasets/{self.dataset.id}/tasks/"
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["data"][0]["role"], Task.Role.ADMIN)
        self.assertNotIn("user_role", response.data["data"][0])

    def test_viewer_task_does_not_start_or_allow_status_updates(self):
        task = self._create_task_model(role=Task.Role.VIEWER)
        self.client.force_authenticate(user=self.assignee)

        detail_response = self.client.get(f"/api/v1/tasks/{task.id}/")
        status_response = self.client.patch(
            f"/api/v1/tasks/{task.id}/status/",
            {"status": Task.Status.IN_PROGRESS},
            format="json",
        )

        self.assertEqual(detail_response.status_code, 200)
        self.assertEqual(detail_response.data["status"], Task.Status.ASSIGNED)
        self.assertIsNone(detail_response.data["started_at"])
        self.assertEqual(status_response.status_code, 400)

    def test_reassign_updates_user_and_task_role(self):
        replacement = User.objects.create_user(
            username="replacement-viewer",
            email="replacement-viewer@example.com",
            password="test-password-123",
        )
        ProjectMembership.objects.create(
            project=self.project,
            user=replacement,
        )
        task = self._create_task_model()

        response = self.client.patch(
            f"/api/v1/tasks/{task.id}/assign/",
            {
                "assignee_username": replacement.username,
                "role": Task.Role.VIEWER,
            },
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["assignee_username"], replacement.username)
        self.assertEqual(response.data["role"], Task.Role.ADMIN)
        task.refresh_from_db()
        self.assertEqual(task.assignee, replacement)
        self.assertEqual(task.role, Task.Role.VIEWER)

        self.client.force_authenticate(user=replacement)
        assignee_response = self.client.get(f"/api/v1/tasks/{task.id}/")
        self.assertEqual(assignee_response.data["role"], Task.Role.VIEWER)

    def test_rejects_unknown_task_role(self):
        response = self.client.post(
            self.endpoint,
            self._create_payload(role="reviewer"),
            format="json",
        )

        self.assertEqual(response.status_code, 400)

    def test_completion_records_completed_at_for_future_scoring(self):
        task = self._create_task_model(status=Task.Status.APPROVAL_PENDING)
        project_class = ProjectClass.objects.create(
            project=self.project,
            name="Product",
            color="#FF0000",
            index=0,
        )
        AnnotationObject.objects.create(
            image=self.asset,
            annotation_class=project_class,
            geometry_type=AnnotationObject.GeometryType.BBOX,
            coordinates=[0, 0, 10, 10],
            created_by=self.assignee,
            updated_by=self.assignee,
        )

        response = self.client.patch(
            f"/api/v1/tasks/{task.id}/status/",
            {"status": Task.Status.COMPLETED},
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertIsNotNone(response.data["completed_at"])
        task.refresh_from_db()
        self.assertIsNotNone(task.completed_at)

    def _create_task_model(
        self,
        status=Task.Status.ASSIGNED,
        role=Task.Role.ANNOTATOR,
    ):
        task = Task.objects.create(
            dataset=self.dataset,
            assignee=self.assignee,
            created_by=self.admin,
            role=role,
            name="Lifecycle task",
            description="Lifecycle metadata test",
            priority=Task.Priority.URGENT,
            deadline=timezone.now() + timedelta(days=1),
            status=status,
        )
        TaskImage.objects.create(task=task, image=self.asset)
        return task

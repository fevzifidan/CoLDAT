import uuid

from django.contrib.auth import get_user_model
from django.test import SimpleTestCase, TestCase
from rest_framework.test import APIClient

from apps.common.ids import uuid7

from .models import Project, ProjectMembership
from .services import create_project


User = get_user_model()


class UUIDv7GenerationTests(SimpleTestCase):
    def test_generated_values_are_rfc_uuidv7_and_monotonic(self):
        values = [uuid7() for _ in range(100)]

        self.assertTrue(all(value.version == 7 for value in values))
        self.assertTrue(
            all(value.variant == uuid.RFC_4122 for value in values)
        )
        self.assertEqual(values, sorted(values))
        self.assertEqual(len(values), len(set(values)))


class ProjectUUIDv7PaginationTests(TestCase):
    endpoint = "/api/v1/projects/"

    def setUp(self):
        self.user = User.objects.create_user(
            username="pagination-user",
            email="pagination@example.com",
            password="test-password-123",
        )
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

        for index in range(12):
            create_project(
                owner=self.user,
                name=f"Project {index:02d}",
            )

    def test_pages_use_uuidv7_after_cursor_without_duplicates(self):
        expected_ids = [
            str(project_id)
            for project_id in Project.objects.order_by("-id").values_list(
                "id",
                flat=True,
            )
        ]

        first_response = self.client.get(self.endpoint, {"limit": 5})

        self.assertEqual(first_response.status_code, 200)
        self.assertEqual(
            [item["id"] for item in first_response.data["data"]],
            expected_ids[:5],
        )
        self.assertEqual(
            first_response.data["next_cursor"],
            expected_ids[4],
        )
        self.assertEqual(
            uuid.UUID(first_response.data["next_cursor"]).version,
            7,
        )

        second_response = self.client.get(
            self.endpoint,
            {
                "limit": 5,
                "after": first_response.data["next_cursor"],
            },
        )

        self.assertEqual(second_response.status_code, 200)
        self.assertEqual(
            [item["id"] for item in second_response.data["data"]],
            expected_ids[5:10],
        )
        self.assertEqual(
            second_response.data["next_cursor"],
            expected_ids[9],
        )

        third_response = self.client.get(
            self.endpoint,
            {
                "limit": 5,
                "after": second_response.data["next_cursor"],
            },
        )

        self.assertEqual(third_response.status_code, 200)
        self.assertEqual(
            [item["id"] for item in third_response.data["data"]],
            expected_ids[10:],
        )
        self.assertIsNone(third_response.data["next_cursor"])

    def test_rejects_non_uuidv7_cursor(self):
        response = self.client.get(
            self.endpoint,
            {"after": str(uuid.uuid4())},
        )

        self.assertEqual(response.status_code, 400)

    def test_rejects_limit_outside_supported_range(self):
        response = self.client.get(self.endpoint, {"limit": 101})

        self.assertEqual(response.status_code, 400)


class RolelessProjectMembershipAPITests(TestCase):
    def setUp(self):
        self.owner = User.objects.create_user(
            username="project-owner",
            email="project-owner@example.com",
            password="test-password-123",
        )
        self.member = User.objects.create_user(
            username="project-member",
            email="project-member@example.com",
            password="test-password-123",
        )
        self.project = create_project(
            owner=self.owner,
            name="Roleless project",
        )
        self.endpoint = f"/api/v1/projects/{self.project.id}/members/"
        self.client = APIClient()
        self.client.force_authenticate(user=self.owner)

    def test_owner_adds_member_without_role(self):
        response = self.client.post(
            self.endpoint,
            {"user_id": str(self.member.id)},
            format="json",
        )

        self.assertEqual(response.status_code, 201)
        self.assertNotIn("role", response.data)
        self.assertTrue(
            ProjectMembership.objects.filter(
                project=self.project,
                user=self.member,
            ).exists()
        )

    def test_project_response_uses_role_not_user_role(self):
        response = self.client.get(f"/api/v1/projects/{self.project.id}/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["role"], "admin")
        self.assertNotIn("user_role", response.data)

    def test_project_member_creation_rejects_role(self):
        response = self.client.post(
            self.endpoint,
            {
                "user_id": str(self.member.id),
                "role": "annotator",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertFalse(
            ProjectMembership.objects.filter(
                project=self.project,
                user=self.member,
            ).exists()
        )

    def test_project_membership_role_cannot_be_patched(self):
        membership = ProjectMembership.objects.create(
            project=self.project,
            user=self.member,
        )

        response = self.client.patch(
            f"{self.endpoint}{membership.id}/",
            {"role": "admin"},
            format="json",
        )

        self.assertEqual(response.status_code, 405)

    def test_non_owner_cannot_add_project_members(self):
        ProjectMembership.objects.create(
            project=self.project,
            user=self.member,
        )
        another_user = User.objects.create_user(
            username="another-member",
            email="another-member@example.com",
            password="test-password-123",
        )
        self.client.force_authenticate(user=self.member)

        response = self.client.post(
            self.endpoint,
            {"user_id": str(another_user.id)},
            format="json",
        )

        self.assertEqual(response.status_code, 403)

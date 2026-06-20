from django.conf import settings
from django.db import models

from apps.common.ids import uuid7


class Project(models.Model):
    id = models.UUIDField(
        primary_key=True,
        default=uuid7,
        editable=False,
    )

    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="owned_projects",
    )

    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)

    is_archived = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.name


class ProjectMembership(models.Model):
    class Role(models.TextChoices):
        ADMIN = "admin", "Admin"
        ANNOTATOR = "annotator", "Annotator"
        VIEWER = "viewer", "Viewer"

    id = models.UUIDField(
        primary_key=True,
        default=uuid7,
        editable=False,
    )

    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        related_name="memberships",
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="project_memberships",
    )

    role = models.CharField(
        max_length=20,
        choices=Role.choices,
    )

    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ["project", "user"]
        ordering = ["project", "user"]

    def __str__(self):
        return f"{self.user} - {self.project} ({self.role})"

import uuid

from django.conf import settings
from django.db import models

from apps.projects.models import Project


class Dataset(models.Model):
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
    )

    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        related_name="datasets",
    )

    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="created_datasets",
    )

    is_deleted = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        unique_together = ["project", "name"]

    def __str__(self):
        return f"{self.project.name} / {self.name}"


class DatasetMember(models.Model):
    class Role(models.TextChoices):
        ADMIN = "admin", "Admin"
        ANNOTATOR = "annotator", "Annotator"
        REVIEWER = "reviewer", "Reviewer"
        VIEWER = "viewer", "Viewer"

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
    )

    dataset = models.ForeignKey(
        Dataset,
        on_delete=models.CASCADE,
        related_name="memberships",
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="dataset_memberships",
    )

    role = models.CharField(
        max_length=20,
        choices=Role.choices,
    )

    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ["dataset", "user"]
        ordering = ["dataset", "user"]

    def __str__(self):
        return f"{self.user} - {self.dataset} ({self.role})"
    
class DatasetVersion(models.Model):
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
    )

    dataset = models.ForeignKey(
        Dataset,
        on_delete=models.CASCADE,
        related_name="versions",
    )

    version_tag = models.CharField(max_length=100)

    description = models.TextField(blank=True)

    snapshot = models.JSONField(
        default=dict,
        help_text="Frozen dataset state used for exports and version restore/view.",
    )

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="created_dataset_versions",
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = [["dataset", "version_tag"]]
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.dataset.name} / {self.version_tag}"
from django.conf import settings
from django.db import models

from apps.assets.models import Asset
from apps.common.ids import uuid7
from apps.datasets.models import Dataset


class Task(models.Model):
    class Role(models.TextChoices):
        ADMIN = "admin", "Admin"
        ANNOTATOR = "annotator", "Annotator"
        VIEWER = "viewer", "Viewer"

    class Status(models.TextChoices):
        ASSIGNED = "assigned", "Assigned"
        IN_PROGRESS = "in_progress", "In Progress"
        APPROVAL_PENDING = "approval_pending", "Approval Pending"
        COMPLETED = "completed", "Completed"
        REJECTED = "rejected", "Rejected"

    class Priority(models.TextChoices):
        LOW = "low", "Low"
        MEDIUM = "medium", "Medium"
        HIGH = "high", "High"
        URGENT = "urgent", "Urgent"

    id = models.UUIDField(
        primary_key=True,
        default=uuid7,
        editable=False,
    )

    dataset = models.ForeignKey(
        Dataset,
        on_delete=models.CASCADE,
        related_name="tasks",
    )

    assignee = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="assigned_tasks",
    )

    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.ANNOTATOR,
        db_index=True,
    )

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="created_tasks",
    )

    name = models.CharField(
        max_length=255,
        default="Untitled Task",
    )

    description = models.TextField(blank=True)

    priority = models.CharField(
        max_length=20,
        choices=Priority.choices,
        default=Priority.MEDIUM,
        db_index=True,
    )

    deadline = models.DateTimeField(
        null=True,
        blank=True,
        db_index=True,
    )

    status = models.CharField(
        max_length=30,
        choices=Status.choices,
        default=Status.ASSIGNED,
    )

    note = models.TextField(blank=True)

    started_at = models.DateTimeField(
        null=True,
        blank=True,
        db_index=True,
    )

    completed_at = models.DateTimeField(
        null=True,
        blank=True,
        db_index=True,
    )

    is_deleted = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.name} - {self.assignee}"


class TaskImage(models.Model):
    id = models.UUIDField(
        primary_key=True,
        default=uuid7,
        editable=False,
    )

    task = models.ForeignKey(
        Task,
        on_delete=models.CASCADE,
        related_name="task_images",
    )

    image = models.ForeignKey(
        Asset,
        on_delete=models.CASCADE,
        related_name="task_links",
    )

    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ["task", "image"]

    def __str__(self):
        return f"{self.task_id} - {self.image.filename}"

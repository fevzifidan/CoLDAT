from django.conf import settings
from django.db import models

from apps.assets.models import Asset
from apps.common.ids import uuid7
from apps.datasets.models import Dataset


class Task(models.Model):
    class Status(models.TextChoices):
        ASSIGNED = "assigned", "Assigned"
        IN_PROGRESS = "in_progress", "In Progress"
        APPROVAL_PENDING = "approval_pending", "Approval Pending"
        COMPLETED = "completed", "Completed"
        REJECTED = "rejected", "Rejected"

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

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="created_tasks",
    )

    status = models.CharField(
        max_length=30,
        choices=Status.choices,
        default=Status.ASSIGNED,
    )

    note = models.TextField(blank=True)

    is_deleted = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Task {self.id} - {self.assignee}"


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

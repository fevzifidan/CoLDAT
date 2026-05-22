import uuid

from django.db import models

from apps.projects.models import Project


class ProjectClass(models.Model):
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
    )

    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        related_name="classes",
    )

    name = models.CharField(max_length=255)

    color = models.CharField(
        max_length=20,
        blank=True,
        help_text="Frontend display color, for example #FF0000.",
    )

    index = models.PositiveIntegerField(
        help_text="Class index used for formats like YOLO.",
    )

    is_active = models.BooleanField(default=True)

    include_in_export = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = [
            ["project", "name"],
            ["project", "index"],
        ]
        ordering = ["index", "name"]

    def __str__(self):
        return f"{self.project.name} / {self.name}"


class ProjectPredicate(models.Model):
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
    )

    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        related_name="predicates",
    )

    name = models.CharField(max_length=255)

    is_active = models.BooleanField(default=True)

    include_in_export = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = [["project", "name"]]
        ordering = ["name"]

    def __str__(self):
        return f"{self.project.name} / {self.name}"


class ProjectAttribute(models.Model):
    class AttributeType(models.TextChoices):
        TEXT = "text", "Text"
        NUMBER = "number", "Number"
        BOOLEAN = "boolean", "Boolean"
        SELECT = "select", "Select"

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
    )

    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        related_name="attributes",
    )

    name = models.CharField(max_length=255)

    attribute_type = models.CharField(
        max_length=20,
        choices=AttributeType.choices,
        default=AttributeType.TEXT,
    )

    options = models.JSONField(
        default=list,
        blank=True,
        help_text="Used for select attributes. Example: ['red', 'blue', 'green']",
    )

    is_active = models.BooleanField(default=True)

    include_in_export = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = [["project", "name"]]
        ordering = ["name"]

    def __str__(self):
        return f"{self.project.name} / {self.name}"
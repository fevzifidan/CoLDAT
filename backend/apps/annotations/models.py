from django.conf import settings
from django.db import models

from apps.assets.models import Asset
from apps.common.ids import uuid7
from apps.taxonomy.models import ProjectClass, ProjectPredicate


class AnnotationObject(models.Model):
    class GeometryType(models.TextChoices):
        BBOX = "bbox", "Bounding Box"
        POLYGON = "polygon", "Polygon"
        KEYPOINT = "keypoint", "Keypoint"

    id = models.UUIDField(
        primary_key=True,
        default=uuid7,
        editable=False,
    )

    image = models.ForeignKey(
        Asset,
        on_delete=models.CASCADE,
        related_name="annotation_objects",
    )

    annotation_class = models.ForeignKey(
        ProjectClass,
        on_delete=models.PROTECT,
        related_name="annotation_objects",
    )

    geometry_type = models.CharField(
        max_length=20,
        choices=GeometryType.choices,
    )

    coordinates = models.JSONField(
        help_text="bbox: [x,y,w,h], polygon: [x1,y1,x2,y2,...], keypoint: [x,y,...]",
    )

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="created_annotation_objects",
    )

    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="updated_annotation_objects",
    )

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["created_at"]

    def __str__(self):
        return f"{self.geometry_type} - {self.annotation_class.name}"


class SceneGraphRelationship(models.Model):
    id = models.UUIDField(
        primary_key=True,
        default=uuid7,
        editable=False,
    )

    image = models.ForeignKey(
        Asset,
        on_delete=models.CASCADE,
        related_name="scene_graph_relationships",
    )

    subject = models.ForeignKey(
        AnnotationObject,
        on_delete=models.CASCADE,
        related_name="subject_relationships",
    )

    object = models.ForeignKey(
        AnnotationObject,
        on_delete=models.CASCADE,
        related_name="object_relationships",
    )

    predicate = models.ForeignKey(
        ProjectPredicate,
        on_delete=models.PROTECT,
        related_name="scene_graph_relationships",
    )

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="created_scene_graph_relationships",
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]

    def __str__(self):
        return f"{self.subject_id} -> {self.predicate.name} -> {self.object_id}"

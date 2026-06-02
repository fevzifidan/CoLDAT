from django.shortcuts import get_object_or_404

from apps.assets.models import Asset

from .models import AnnotationObject, SceneGraphRelationship


def get_image_for_annotation_user(*, image_id, user):
    return get_object_or_404(
        Asset,
        id=image_id,
        is_deleted=False,
        status=Asset.UploadStatus.UPLOADED,
        dataset__project__memberships__user=user,
    )


def get_annotation_objects_for_image(*, image):
    return (
        AnnotationObject.objects.filter(image=image)
        .select_related("annotation_class")
        .order_by("created_at")
    )


def get_relationships_for_image(*, image):
    return (
        SceneGraphRelationship.objects.filter(image=image)
        .select_related("subject", "object", "predicate")
        .order_by("created_at")
    )
from django.shortcuts import get_object_or_404

from apps.annotations.models import AnnotationObject, SceneGraphRelationship
from apps.assets.models import Asset
from apps.datasets.models import Dataset
from apps.taxonomy.models import ProjectClass, ProjectPredicate


def get_dataset_for_export_user(*, dataset_id, user):
    return get_object_or_404(
        Dataset,
        id=dataset_id,
        is_deleted=False,
        project__memberships__user=user,
    )


def get_export_images(*, dataset):
    return (
        Asset.objects.filter(
            dataset=dataset,
            is_deleted=False,
            status=Asset.UploadStatus.UPLOADED,
        )
        .order_by("created_at")
    )


def get_export_classes(*, project):
    return (
        ProjectClass.objects.filter(
            project=project,
            include_in_export=True,
        )
        .order_by("index", "name")
    )


def get_export_predicates(*, project):
    return (
        ProjectPredicate.objects.filter(
            project=project,
            include_in_export=True,
        )
        .order_by("name")
    )


def get_export_annotation_objects(*, images):
    return (
        AnnotationObject.objects.filter(
            image__in=images,
            annotation_class__include_in_export=True,
        )
        .select_related("image", "annotation_class")
        .order_by("created_at")
    )


def get_export_relationships(*, images):
    return (
        SceneGraphRelationship.objects.filter(
            image__in=images,
            predicate__include_in_export=True,
            subject__annotation_class__include_in_export=True,
            object__annotation_class__include_in_export=True,
        )
        .select_related(
            "image",
            "subject",
            "subject__annotation_class",
            "object",
            "object__annotation_class",
            "predicate",
        )
        .order_by("created_at")
    )
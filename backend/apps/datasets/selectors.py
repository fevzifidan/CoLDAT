from django.db.models import Count, Q
from django.http import Http404
from django.shortcuts import get_object_or_404

from apps.projects.selectors import get_project_for_user
from .models import Dataset, DatasetMember, DatasetVersion, DatasetAPIKey


def get_project_datasets_for_user(*, project_id, user):
    project = get_project_for_user(project_id=project_id, user=user)

    datasets = Dataset.objects.filter(
        project=project,
        is_deleted=False,
    ).annotate(
        _total_images=Count(
            "assets",
            filter=Q(assets__is_deleted=False),
            distinct=True,
        ),
        _annotated_images=Count(
            "assets",
            filter=Q(assets__is_deleted=False, assets__annotation_objects__isnull=False),
            distinct=True,
        ),
    )

    return project, datasets


def get_datasets_for_user(*, user, search=None):
    datasets = (
        Dataset.objects.filter(
            Q(memberships__user=user)
            | Q(project__owner=user),
            is_deleted=False,
            project__is_archived=False,
        )
        .select_related("project", "created_by")
        .annotate(
            _total_images=Count(
                "assets",
                filter=Q(assets__is_deleted=False),
                distinct=True,
            ),
            _annotated_images=Count(
                "assets",
                filter=Q(assets__is_deleted=False, assets__annotation_objects__isnull=False),
                distinct=True,
            ),
        )
        .distinct()
        .order_by("-created_at")
    )

    if search:
        datasets = datasets.filter(name__icontains=search)
    return datasets


def get_dataset_for_user(*, dataset_id, user):
    datasets = Dataset.objects.filter(
        Q(memberships__user=user)
        | Q(project__owner=user),
        is_deleted=False,
        project__is_archived=False,
    ).annotate(
        _total_images=Count(
            "assets",
            filter=Q(assets__is_deleted=False),
            distinct=True,
        ),
        _annotated_images=Count(
            "assets",
            filter=Q(assets__is_deleted=False, assets__annotation_objects__isnull=False),
            distinct=True,
        ),
    ).distinct()
    return get_object_or_404(
        datasets,
        id=dataset_id,
    )


def get_dataset_members(*, dataset):
    return (
        DatasetMember.objects.filter(dataset=dataset)
        .select_related("user")
        .order_by("user__username")
    )


def user_is_project_admin(*, project, user) -> bool:
    return project.owner_id == user.id


def get_dataset_member_by_id(*, dataset, member_id):
    return get_object_or_404(
        DatasetMember,
        id=member_id,
        dataset=dataset,
    )
def get_dataset_versions_for_user(*, dataset_id, user):
    dataset = get_dataset_for_user(
        dataset_id=dataset_id,
        user=user,
    )

    versions = (
        DatasetVersion.objects.filter(dataset=dataset)
        .select_related("dataset", "created_by")
        .order_by("-created_at")
    )

    return dataset, versions


def get_dataset_version_for_user(*, dataset_id, version_tag, user):
    dataset = get_dataset_for_user(
        dataset_id=dataset_id,
        user=user,
    )

    version = get_object_or_404(
        DatasetVersion.objects.select_related("dataset", "created_by"),
        dataset=dataset,
        version_tag=version_tag,
    )

    return dataset, version


def get_latest_dataset_version_for_user(*, dataset_id, user):
    dataset = get_dataset_for_user(
        dataset_id=dataset_id,
        user=user,
    )

    version = (
        DatasetVersion.objects.select_related("dataset", "created_by")
        .filter(dataset=dataset)
        .order_by("-created_at")
        .first()
    )
    if version is None:
        raise Http404("This dataset does not have an exportable version.")

    return dataset, version

def get_dataset_api_keys_for_user(*, dataset_id, user):
    dataset = get_dataset_for_user(
        dataset_id=dataset_id,
        user=user,
    )

    api_keys = (
        DatasetAPIKey.objects.filter(dataset=dataset)
        .select_related("dataset", "created_by")
        .order_by("-created_at")
    )

    return dataset, api_keys


def get_dataset_api_key_for_user(*, dataset_id, key_id, user):
    dataset = get_dataset_for_user(
        dataset_id=dataset_id,
        user=user,
    )

    api_key = get_object_or_404(
        DatasetAPIKey.objects.select_related("dataset", "created_by"),
        id=key_id,
        dataset=dataset,
    )

    return dataset, api_key


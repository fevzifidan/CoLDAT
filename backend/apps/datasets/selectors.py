from django.db.models import Q
from django.shortcuts import get_object_or_404

from apps.projects.models import ProjectMembership
from apps.projects.selectors import get_project_for_user

from .models import Dataset, DatasetMember, DatasetVersion


def get_project_datasets_for_user(*, project_id, user):
    project = get_project_for_user(project_id=project_id, user=user)

    datasets = Dataset.objects.filter(
        project=project,
        is_deleted=False,
    )

    return project, datasets


def get_datasets_for_user(*, user, search=None):
    datasets = (
        Dataset.objects.filter(
            Q(project__memberships__user=user)
            | Q(memberships__user=user),
            is_deleted=False,
            project__is_archived=False,
        )
        .select_related("project", "created_by")
        .distinct()
        .order_by("-created_at")
    )

    if search:
        datasets = datasets.filter(name__icontains=search)

    return datasets


def get_dataset_for_user(*, dataset_id, user):
    datasets = Dataset.objects.filter(
        Q(project__memberships__user=user)
        | Q(memberships__user=user),
        is_deleted=False,
        project__is_archived=False,
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
    return ProjectMembership.objects.filter(
        project=project,
        user=user,
        role=ProjectMembership.Role.ADMIN,
    ).exists()


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
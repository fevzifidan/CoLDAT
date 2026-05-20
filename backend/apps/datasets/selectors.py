from django.shortcuts import get_object_or_404

from apps.projects.models import ProjectMembership
from apps.projects.selectors import get_project_for_user

from .models import Dataset, DatasetMember


def get_project_datasets_for_user(*, project_id, user):
    project = get_project_for_user(project_id=project_id, user=user)

    datasets = Dataset.objects.filter(
        project=project,
        is_deleted=False,
    )

    return project, datasets


def get_dataset_for_user(*, dataset_id, user):
    return get_object_or_404(
        Dataset,
        id=dataset_id,
        is_deleted=False,
        project__memberships__user=user,
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
from django.contrib.auth import get_user_model
from rest_framework.exceptions import ValidationError

from apps.projects.models import ProjectMembership

from .models import Dataset, DatasetMember


User = get_user_model()


def create_dataset(
    *,
    project,
    created_by,
    name: str,
    description: str = "",
) -> Dataset:
    dataset = Dataset.objects.create(
        project=project,
        created_by=created_by,
        name=name,
        description=description,
    )

    project_memberships = ProjectMembership.objects.filter(project=project)

    dataset_members = [
        DatasetMember(
            dataset=dataset,
            user=membership.user,
            role=membership.role,
        )
        for membership in project_memberships
    ]

    DatasetMember.objects.bulk_create(dataset_members)

    return dataset


def update_dataset(
    *,
    dataset: Dataset,
    name: str | None = None,
    description: str | None = None,
) -> Dataset:
    update_fields = []

    if name is not None:
        dataset.name = name
        update_fields.append("name")

    if description is not None:
        dataset.description = description
        update_fields.append("description")

    if update_fields:
        update_fields.append("updated_at")
        dataset.save(update_fields=update_fields)

    return dataset


def delete_dataset(*, dataset: Dataset):
    dataset.is_deleted = True
    dataset.save(update_fields=["is_deleted", "updated_at"])


def add_or_update_dataset_member(
    *,
    dataset: Dataset,
    username: str,
    role: str,
) -> DatasetMember:
    try:
        user = User.objects.get(username=username)
    except User.DoesNotExist:
        raise ValidationError("User with this username does not exist.")

    membership, created = DatasetMember.objects.get_or_create(
        dataset=dataset,
        user=user,
        defaults={"role": role},
    )

    if not created:
        membership.role = role
        membership.save(update_fields=["role"])

    return membership


def update_dataset_member_role(
    *,
    membership: DatasetMember,
    role: str,
) -> DatasetMember:
    membership.role = role
    membership.save(update_fields=["role"])
    return membership


def remove_dataset_member(*, membership: DatasetMember):
    membership.delete()
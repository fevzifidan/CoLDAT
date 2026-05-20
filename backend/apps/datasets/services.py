from apps.projects.models import ProjectMembership

from .models import Dataset, DatasetMember



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


def delete_dataset(*, dataset: Dataset):
    dataset.is_deleted = True
    dataset.save(update_fields=["is_deleted", "updated_at"])
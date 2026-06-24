from django.contrib.auth import get_user_model
from rest_framework.exceptions import ValidationError
from .models import Project, ProjectMembership


User = get_user_model()


def create_project(*, owner, name: str, description: str = "") -> Project:
    project = Project.objects.create(
        owner=owner,
        name=name,
        description=description,
    )

    ProjectMembership.objects.create(
        project=project,
        user=owner,
    )

    return project


def update_project(*, project: Project, data: dict) -> Project:
    allowed_fields = ["name", "description"]

    for field in allowed_fields:
        if field in data:
            setattr(project, field, data[field])

    project.save(update_fields=allowed_fields + ["updated_at"])

    return project


def archive_project(*, project: Project) -> Project:
    project.is_archived = True
    project.save(update_fields=["is_archived", "updated_at"])

    return project

def add_project_member(*, project: Project, user_id) -> ProjectMembership:
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist as exc:
        raise ValidationError("User does not exist.") from exc

    membership, _ = ProjectMembership.objects.get_or_create(
        project=project,
        user=user,
    )

    return membership

def remove_project_member(*, membership: ProjectMembership):
    if membership.user_id == membership.project.owner_id:
        raise ValidationError("The project owner cannot be removed.")

    # Bu kullanıcının projedeki tüm dataset'lerdeki üyeliklerini de sil
    from apps.datasets.models import DatasetMember

    DatasetMember.objects.filter(
        dataset__project=membership.project,
        user=membership.user,
    ).delete()

    membership.delete()


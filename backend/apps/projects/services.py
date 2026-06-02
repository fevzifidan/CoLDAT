from django.contrib.auth import get_user_model
from rest_framework.exceptions import ValidationError
from typing import Optional

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
        role=ProjectMembership.Role.ADMIN,
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

def add_project_member(*, project: Project, user_id, role: str) -> ProjectMembership:
    user = User.objects.get(id=user_id)

    membership, created = ProjectMembership.objects.get_or_create(
        project=project,
        user=user,
        defaults={"role": role},
    )

    if not created:
        ensure_membership_can_be_changed(
            membership=membership,
            new_role=role,
        )

        membership.role = role
        membership.save(update_fields=["role"])

    return membership

def ensure_membership_can_be_changed(
    *,
    membership: ProjectMembership,
    new_role: Optional[str] = None,
    removing: bool = False,
):
    project = membership.project

    if membership.user_id == project.owner_id:
        raise ValidationError("The project owner cannot be removed or downgraded.")

    if membership.role == ProjectMembership.Role.ADMIN:
        admin_count = ProjectMembership.objects.filter(
            project=project,
            role=ProjectMembership.Role.ADMIN,
        ).count()

        would_stop_being_admin = (
            removing
            or (
                new_role is not None
                and new_role != ProjectMembership.Role.ADMIN
            )
        )

        if admin_count <= 1 and would_stop_being_admin:
            raise ValidationError("A project must have at least one admin.")


def update_project_member_role(
    *,
    membership: ProjectMembership,
    role: str,
) -> ProjectMembership:
    ensure_membership_can_be_changed(
        membership=membership,
        new_role=role,
    )

    membership.role = role
    membership.save(update_fields=["role"])

    return membership


def remove_project_member(*, membership: ProjectMembership):
    ensure_membership_can_be_changed(
        membership=membership,
        removing=True,
    )

    membership.delete()
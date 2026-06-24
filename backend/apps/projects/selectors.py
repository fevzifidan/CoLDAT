from django.db.models import Q
from .models import Project, ProjectMembership
from django.shortcuts import get_object_or_404


def get_projects_for_user(*, user):
    """
    Kullanıcının erişebildiği projeleri döndürür.
    - Proje üyesi olan (ProjectMembership)
    - Proje owner'ı
    Dataset membership TEK BAŞINA projeye erişim hakkı vermez.
    """
    return Project.objects.filter(
        Q(memberships__user=user) | Q(owner=user),
        is_archived=False,
    ).distinct()


def get_project_for_user(*, project_id, user):
    return get_projects_for_user(user=user).get(id=project_id)


def get_user_project_membership(*, project, user):
    return ProjectMembership.objects.filter(
        project=project,
        user=user,
    ).first()

def get_project_memberships(*, project):
    return (
        ProjectMembership.objects.filter(project=project)
        .select_related("user")
        .order_by("user__username")
    )


def get_project_membership_by_id(*, project, membership_id):
    return get_object_or_404(
        ProjectMembership,
        id=membership_id,
        project=project,
    )
from rest_framework.permissions import BasePermission

from apps.projects.models import ProjectMembership


class CanManageTaxonomy(BasePermission):
    def has_object_permission(self, request, view, obj):
        if hasattr(obj, "project"):
            project = obj.project
        else:
            project = obj

        return project.memberships.filter(
            user=request.user,
            role__in=[
                ProjectMembership.Role.ADMIN,
                ProjectMembership.Role.REVIEWER,
            ],
        ).exists()
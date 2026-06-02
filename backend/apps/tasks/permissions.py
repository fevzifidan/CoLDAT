from rest_framework.permissions import BasePermission

from apps.projects.models import ProjectMembership


class CanManageTasks(BasePermission):
    def has_object_permission(self, request, view, obj):
        if hasattr(obj, "dataset"):
            dataset = obj.dataset
        else:
            dataset = obj

        return dataset.project.memberships.filter(
            user=request.user,
            role__in=[
                ProjectMembership.Role.ADMIN,
                ProjectMembership.Role.REVIEWER,
            ],
        ).exists()
from rest_framework.permissions import BasePermission

from apps.projects.models import ProjectMembership


class CanEditImageAnnotations(BasePermission):
    def has_object_permission(self, request, view, obj):
        image = obj

        return image.dataset.project.memberships.filter(
            user=request.user,
            role__in=[
                ProjectMembership.Role.ADMIN,
                ProjectMembership.Role.REVIEWER,
                ProjectMembership.Role.ANNOTATOR,
            ],
        ).exists()
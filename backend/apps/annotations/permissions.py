from rest_framework.permissions import BasePermission

from apps.datasets.models import DatasetMember
from apps.projects.models import ProjectMembership


class CanEditImageAnnotations(BasePermission):
    def has_object_permission(self, request, view, obj):
        image = obj

        has_project_role = image.dataset.project.memberships.filter(
            user=request.user,
            role__in=[
                ProjectMembership.Role.ADMIN,
                ProjectMembership.Role.REVIEWER,
                ProjectMembership.Role.ANNOTATOR,
            ],
        ).exists()

        has_dataset_role = image.dataset.memberships.filter(
            user=request.user,
            role__in=[
                DatasetMember.Role.ADMIN,
                DatasetMember.Role.REVIEWER,
                DatasetMember.Role.ANNOTATOR,
            ],
        ).exists()

        return has_project_role or has_dataset_role
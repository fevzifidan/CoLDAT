from rest_framework.permissions import BasePermission

from apps.datasets.models import DatasetMember
from apps.tasks.models import Task, TaskImage


class CanEditImageAnnotations(BasePermission):
    def has_object_permission(self, request, view, obj):
        image = obj

        is_project_owner = image.dataset.project.owner_id == request.user.id

        has_dataset_role = image.dataset.memberships.filter(
            user=request.user,
            role__in=[
                DatasetMember.Role.ADMIN,
                DatasetMember.Role.ANNOTATOR,
            ],
        ).exists()

        has_editable_task = TaskImage.objects.filter(
            image=image,
            task__assignee=request.user,
            task__role__in=[Task.Role.ADMIN, Task.Role.ANNOTATOR],
            task__is_deleted=False,
        ).exists()

        return is_project_owner or has_dataset_role or has_editable_task

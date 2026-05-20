from rest_framework.permissions import BasePermission

from .selectors import user_is_project_admin


class IsDatasetProjectAdmin(BasePermission):
    def has_object_permission(self, request, view, obj):
        return user_is_project_admin(
            project=obj.project,
            user=request.user,
        )
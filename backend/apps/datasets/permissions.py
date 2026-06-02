from rest_framework.permissions import BasePermission

from apps.projects.models import Project
from .models import Dataset
from .selectors import user_is_project_admin


class IsDatasetProjectAdmin(BasePermission):
    def has_object_permission(self, request, view, obj):
        if isinstance(obj, Project):
            project = obj
        elif isinstance(obj, Dataset):
            project = obj.project
        else:
            return False

        return user_is_project_admin(
            project=project,
            user=request.user,
        )
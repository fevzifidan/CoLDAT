from rest_framework.permissions import BasePermission

from .models import ProjectMembership
from .selectors import get_user_project_membership


class IsProjectAdmin(BasePermission):
    def has_object_permission(self, request, view, obj):
        membership = get_user_project_membership(
            project=obj,
            user=request.user,
        )

        if membership is None:
            return False

        return membership.role == ProjectMembership.Role.ADMIN
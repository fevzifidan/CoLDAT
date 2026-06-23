from rest_framework.permissions import BasePermission

class IsProjectAdmin(BasePermission):
    def has_object_permission(self, request, view, obj):
        return obj.owner_id == request.user.id

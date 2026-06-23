from rest_framework.permissions import BasePermission

class CanManageTaxonomy(BasePermission):
    def has_object_permission(self, request, view, obj):
        if hasattr(obj, "project"):
            project = obj.project
        else:
            project = obj

        return project.owner_id == request.user.id

from rest_framework.permissions import BasePermission

class CanManageTasks(BasePermission):
    def has_object_permission(self, request, view, obj):
        if hasattr(obj, "dataset"):
            dataset = obj.dataset
        else:
            dataset = obj

        return dataset.project.owner_id == request.user.id

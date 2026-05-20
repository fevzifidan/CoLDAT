from rest_framework.permissions import BasePermission

from .selectors import user_can_manage_dataset_assets


class CanManageDatasetAssets(BasePermission):
    def has_object_permission(self, request, view, obj):
        if hasattr(obj, "dataset"):
            dataset = obj.dataset
        else:
            dataset = obj

        return user_can_manage_dataset_assets(
            dataset=dataset,
            user=request.user,
        )
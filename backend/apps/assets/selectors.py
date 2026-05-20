from django.shortcuts import get_object_or_404

from apps.datasets.models import Dataset
from apps.datasets.selectors import get_dataset_for_user

from .models import Asset


def get_dataset_assets_for_user(*, dataset_id, user):
    dataset = get_dataset_for_user(
        dataset_id=dataset_id,
        user=user,
    )

    assets = Asset.objects.filter(
        dataset=dataset,
        is_deleted=False,
    )

    return dataset, assets


def get_asset_for_user(*, asset_id, user):
    return get_object_or_404(
        Asset,
        id=asset_id,
        is_deleted=False,
        dataset__project__memberships__user=user,
    )


def user_can_manage_dataset_assets(*, dataset: Dataset, user) -> bool:
    return dataset.project.memberships.filter(
        user=user,
        role__in=["admin", "reviewer"],
    ).exists()

def get_assets_for_status_update(*, asset_ids, user):
    return Asset.objects.filter(
        id__in=asset_ids,
        uploaded_by=user,
        is_deleted=False,
    )
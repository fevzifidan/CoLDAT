from django.shortcuts import get_object_or_404
from django.db.models import Q

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
        Asset.objects.filter(
            Q(dataset__project__memberships__user=user)
            | Q(dataset__memberships__user=user),
            is_deleted=False,
        ).distinct(),
        id=asset_id,
    )


def user_can_manage_dataset_assets(*, dataset: Dataset, user) -> bool:
        return (
        dataset.project.memberships.filter(
            user=user,
            role__in=["admin"],
        ).exists()
        or dataset.memberships.filter(
            user=user,
            role__in=["admin"],
        ).exists()
    )

def get_assets_for_status_update(*, asset_ids, user):
    return Asset.objects.filter(
        id__in=asset_ids,
        uploaded_by=user,
        is_deleted=False,
    )

def get_dataset_images_for_user(*, dataset_id, user, search=None):
    dataset = get_dataset_for_user(
        dataset_id=dataset_id,
        user=user,
    )

    images = Asset.objects.filter(
        dataset=dataset,
        is_deleted=False,
    ).order_by("-created_at")

    if search:
        images = images.filter(filename__icontains=search)

    return dataset, images

def get_user_uploaded_assets(
    *,
    user,
    status=None,
    search=None,
):
    assets = Asset.objects.filter(
        uploaded_by=user,
        is_deleted=False,
    ).order_by("-created_at")

    if status:
        assets = assets.filter(status=status)

    if search:
        assets = assets.filter(filename__icontains=search)

    return assets
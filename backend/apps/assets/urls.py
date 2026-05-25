from django.urls import path

from .views import (
    AssetBulkStatusUpdateView,
    AssetDetailView,
    AssetRetryUploadView,
    AssetUploadURLCreateView,
)
from apps.assets.views import DatasetImageListView


urlpatterns = [
    path(
        "upload-urls/<uuid:dataset_id>/",
        AssetUploadURLCreateView.as_view(),
        name="asset-upload-urls",
    ),
    path(
        "<uuid:dataset_id>/images/",
        DatasetImageListView.as_view(),
        name="dataset-images",
    ),
    path(
        "bulk-update-status/",
        AssetBulkStatusUpdateView.as_view(),
        name="asset-bulk-update-status",
    ),
    path(
        "<uuid:asset_id>/retry-upload/",
        AssetRetryUploadView.as_view(),
        name="asset-retry-upload",
    ),
    path(
        "<uuid:asset_id>/",
        AssetDetailView.as_view(),
        name="asset-detail",
    ),
]
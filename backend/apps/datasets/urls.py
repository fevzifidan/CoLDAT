from django.urls import path

from apps.assets.views import (
    DatasetAssetListCreateView,
    DatasetImageListView,
)
from apps.tasks.views import DatasetTaskListView

from .views import (
    DatasetDetailView,
    DatasetListView,
    DatasetMemberDetailView,
    DatasetMemberListCreateView,
    DatasetVersionDetailView,
    DatasetVersionListCreateView,
)


urlpatterns = [
    path(
        "",
        DatasetListView.as_view(),
        name="dataset-list",
    ),
    path(
        "<uuid:dataset_id>/",
        DatasetDetailView.as_view(),
        name="dataset-detail",
    ),
    path(
        "<uuid:dataset_id>/members/",
        DatasetMemberListCreateView.as_view(),
        name="dataset-members",
    ),
    path(
        "<uuid:dataset_id>/members/<uuid:member_id>/",
        DatasetMemberDetailView.as_view(),
        name="dataset-member-detail",
    ),
    path(
        "<uuid:dataset_id>/tasks/",
        DatasetTaskListView.as_view(),
        name="dataset-tasks",
    ),
    path(
        "<uuid:dataset_id>/assets/",
        DatasetAssetListCreateView.as_view(),
        name="dataset-asset-list-create",
    ),
    path(
        "<uuid:dataset_id>/images/",
        DatasetImageListView.as_view(),
        name="dataset-images",
    ),
    path(
        "<uuid:dataset_id>/versions/",
        DatasetVersionListCreateView.as_view(),
        name="dataset-version-list-create",
    ),
    path(
        "<uuid:dataset_id>/versions/<str:version_tag>/",
        DatasetVersionDetailView.as_view(),
        name="dataset-version-detail",
    ),
]
from django.urls import path
from .views import DatasetDetailView, DatasetMemberListView
from apps.assets.views import (
    DatasetAssetListCreateView,
)
from apps.tasks.views import DatasetTaskListView




urlpatterns = [
    path(
        "<uuid:dataset_id>/",
        DatasetDetailView.as_view(),
        name="dataset-detail",
    ),
    path(
        "<uuid:dataset_id>/members/",
        DatasetMemberListView.as_view(),
        name="dataset-members",
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
]
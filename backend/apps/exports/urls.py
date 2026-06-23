from django.urls import path

from .views import DatasetExportView


urlpatterns = [
    path(
        "<uuid:dataset_id>/export",
        DatasetExportView.as_view(),
        name="dataset-export",
    ),
    path(
        "<uuid:dataset_id>/export/",
        DatasetExportView.as_view(),
        name="dataset-export-legacy",
    ),
]

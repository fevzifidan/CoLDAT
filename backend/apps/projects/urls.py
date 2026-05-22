from django.urls import path
from apps.datasets.views import ProjectDatasetListCreateView

from .views import (
    ProjectDetailView,
    ProjectListCreateView,
    ProjectMemberDetailView,
    ProjectMemberListCreateView,
)
from apps.tasks.views import ProjectTaskListView


urlpatterns = [
    path("", ProjectListCreateView.as_view(), name="project-list-create"),
    path("<uuid:project_id>/", ProjectDetailView.as_view(), name="project-detail"),

    path(
        "<uuid:project_id>/datasets/",
        ProjectDatasetListCreateView.as_view(),
        name="project-dataset-list-create",
    ),

    path(
        "<uuid:project_id>/members/",
        ProjectMemberListCreateView.as_view(),
        name="project-member-list-create",
    ),
    path(
        "<uuid:project_id>/members/<uuid:membership_id>/",
        ProjectMemberDetailView.as_view(),
        name="project-member-detail",
    ),
    path(
    "<uuid:project_id>/tasks/",
    ProjectTaskListView.as_view(),
    name="project-tasks",
),
]
# apps/projects/urls.py
from django.urls import path
from apps.datasets.views import ProjectDatasetListCreateView
from apps.tasks.views import ProjectTaskListView
from .views import (
    ProjectDetailView,
    ProjectListCreateView,
    ProjectMemberDetailView,
    ProjectMemberListCreateView,
)

urlpatterns = [
    # GET/POST /api/v1/projects/
    path("", ProjectListCreateView.as_view(), name="project-list-create"),
    
    # GET/PUT/PATCH/DELETE /api/v1/projects/<uuid>/
    path("<uuid:project_id>/", ProjectDetailView.as_view(), name="project-detail"),

    # GET/POST /api/v1/projects/<uuid>/datasets/
    path(
        "<uuid:project_id>/datasets/",
        ProjectDatasetListCreateView.as_view(),
        name="project-dataset-list-create",
    ),

    # GET/POST /api/v1/projects/<uuid>/members/
    path(
        "<uuid:project_id>/members/",
        ProjectMemberListCreateView.as_view(),
        name="project-member-list-create",
    ),
    
    # GET/PUT/PATCH/DELETE /api/v1/projects/<uuid>/members/<uuid>/
    path(
        "<uuid:project_id>/members/<uuid:membership_id>/",
        ProjectMemberDetailView.as_view(),
        name="project-member-detail",
    ),
    
    # GET /api/v1/projects/<uuid>/tasks/
    path(
        "<uuid:project_id>/tasks/",
        ProjectTaskListView.as_view(),
        name="project-tasks",
    ),
]
from django.urls import path

from .views import (
    TaskAssignView,
    TaskDetailView,
    TaskImageListView,
    TaskListCreateView,
    TaskStatusUpdateView,
)


urlpatterns = [
    path("", TaskListCreateView.as_view(), name="task-list-create"),
    path("<uuid:task_id>/", TaskDetailView.as_view(), name="task-detail"),
    path("<uuid:task_id>/status/", TaskStatusUpdateView.as_view(), name="task-status"),
    path("<uuid:task_id>/assign/", TaskAssignView.as_view(), name="task-assign"),
    path("<uuid:task_id>/images/", TaskImageListView.as_view(), name="task-images"),
]
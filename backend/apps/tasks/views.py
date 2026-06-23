from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from datetime import timedelta

from django.utils import timezone
from django.conf import settings

from apps.datasets.selectors import get_dataset_for_user
from apps.common.pagination import UUIDv7PaginatedAPIViewMixin

from .permissions import CanManageTasks
from .selectors import (
    get_dataset_tasks_for_user,
    get_project_tasks_for_user,
    get_task_for_user,
    get_task_images_for_user,
    get_tasks_assigned_to_user,
    get_annotator_assignments_for_dataset,
)
from .serializers import (
    TaskAssignSerializer,
    TaskCreateSerializer,
    TaskImageSerializer,
    AnnotatorAssignmentSerializer,
    DatasetAnnotatorAssignmentsQuerySerializer,
    TaskSerializer,
    TaskStatusUpdateSerializer,
    TaskImageAddSerializer,
    TaskListQuerySerializer,
)
from .services import (
    assign_task,
    create_task,
    delete_task,
    update_task_status,
    add_images_to_task,
    mark_task_in_progress_on_first_interaction,
)


class TaskListCreateView(UUIDv7PaginatedAPIViewMixin, APIView):
    def get(self, request):
        query_serializer = TaskListQuerySerializer(
            data=request.query_params
        )
        query_serializer.is_valid(raise_exception=True)

        tasks = get_tasks_assigned_to_user(
            user=request.user,
            status=query_serializer.validated_data.get("status"),
        )
        page = self.paginate_queryset(tasks)

        return self.get_paginated_response(
            TaskSerializer(
                page,
                many=True,
                context={"request": request},
            ).data
        )

    def post(self, request):
        serializer = TaskCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        dataset = get_dataset_for_user(
            dataset_id=serializer.validated_data["dataset_id"],
            user=request.user,
        )

        self.check_object_permissions(request, dataset)

        task = create_task(
            dataset=dataset,
            created_by=request.user,
            assignee_username=serializer.validated_data["assignee_username"],
            role=serializer.validated_data["role"],
            image_ids=serializer.validated_data["image_ids"],
            name=serializer.validated_data["name"],
            description=serializer.validated_data["description"],
            priority=serializer.validated_data["priority"],
            deadline=serializer.validated_data.get("deadline"),
        )

        return Response(
            TaskSerializer(task, context={"request": request}).data,
            status=status.HTTP_201_CREATED,
        )

    def get_permissions(self):
        if self.request.method == "POST":
            return [CanManageTasks()]

        return super().get_permissions()


class TaskDetailView(APIView):
    def get(self, request, task_id):
        task = get_task_for_user(
            task_id=task_id,
            user=request.user,
        )

        task = mark_task_in_progress_on_first_interaction(
            task=task,
            user=request.user,
        )

        return Response(
            TaskSerializer(task, context={"request": request}).data,
            status=status.HTTP_200_OK,
        )

    def delete(self, request, task_id):
        task = get_task_for_user(
            task_id=task_id,
            user=request.user,
        )

        self.check_object_permissions(request, task)

        delete_task(task=task)

        return Response(status=status.HTTP_204_NO_CONTENT)

    def get_permissions(self):
        if self.request.method == "DELETE":
            return [CanManageTasks()]

        return super().get_permissions()


class TaskStatusUpdateView(APIView):
    def patch(self, request, task_id):
        task = get_task_for_user(
            task_id=task_id,
            user=request.user,
        )

        serializer = TaskStatusUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        task = update_task_status(
            task=task,
            user=request.user,
            status=serializer.validated_data["status"],
            note=serializer.validated_data.get("note"),
        )

        return Response(
            TaskSerializer(task, context={"request": request}).data,
            status=status.HTTP_200_OK,
        )

class TaskAssignView(APIView):
    def patch(self, request, task_id):
        task = get_task_for_user(
            task_id=task_id,
            user=request.user,
        )

        self.check_object_permissions(request, task)

        serializer = TaskAssignSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        task = assign_task(
            task=task,
            assignee_username=serializer.validated_data["assignee_username"],
            role=serializer.validated_data["role"],
        )

        return Response(
            TaskSerializer(task, context={"request": request}).data,
            status=status.HTTP_200_OK,
        )

    def get_permissions(self):
        return [CanManageTasks()]


class TaskImageListView(UUIDv7PaginatedAPIViewMixin, APIView):
    def get(self, request, task_id):
        task, task_images = get_task_images_for_user(
            task_id=task_id,
            user=request.user,
        )

        task = mark_task_in_progress_on_first_interaction(
            task=task,
            user=request.user,
        )
        page = self.paginate_queryset(task_images)

        read_url_expiry_at = timezone.now() + timedelta(
            seconds=settings.ASSET_READ_URL_EXPIRES_IN_SECONDS
        )

        return self.get_paginated_response(
            TaskImageSerializer(
                page,
                many=True,
                context={
                    "read_url_expiry_at": read_url_expiry_at,
                },
            ).data
        )

    def post(self, request, task_id):
        task = get_task_for_user(
            task_id=task_id,
            user=request.user,
        )

        self.check_object_permissions(request, task)

        serializer = TaskImageAddSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        add_images_to_task(
            task=task,
            image_ids=serializer.validated_data["image_ids"],
        )

        task, task_images = get_task_images_for_user(
            task_id=task_id,
            user=request.user,
        )

        read_url_expiry_at = timezone.now() + timedelta(
            seconds=settings.ASSET_READ_URL_EXPIRES_IN_SECONDS
        )

        return Response(
            {
                "data": TaskImageSerializer(
                    task_images,
                    many=True,
                    context={
                        "read_url_expiry_at": read_url_expiry_at,
                    },
                ).data,
                "next_cursor": None,
            },
            status=status.HTTP_200_OK,
        )

    def get_permissions(self):
        if self.request.method == "POST":
            return [CanManageTasks()]

        return super().get_permissions()
    

class DatasetTaskListView(UUIDv7PaginatedAPIViewMixin, APIView):
    def get(self, request, dataset_id):
        query_serializer = TaskListQuerySerializer(
            data=request.query_params
        )
        query_serializer.is_valid(raise_exception=True)

        dataset, tasks = get_dataset_tasks_for_user(
            dataset_id=dataset_id,
            user=request.user,
            status=query_serializer.validated_data.get("status"),
            assignee_username=query_serializer.validated_data.get("assignee_username"),
        )
        page = self.paginate_queryset(tasks)

        return self.get_paginated_response(
            TaskSerializer(
                page,
                many=True,
                context={"request": request},
            ).data
        )

    def get_permissions(self):
        if self.request.method == "POST":
            return [CanManageTasks()]

        return super().get_permissions()


class ProjectTaskListView(UUIDv7PaginatedAPIViewMixin, APIView):
    def get(self, request, project_id):
        query_serializer = TaskListQuerySerializer(
            data=request.query_params
        )
        query_serializer.is_valid(raise_exception=True)

        project, tasks = get_project_tasks_for_user(
            project_id=project_id,
            user=request.user,
            status=query_serializer.validated_data.get("status"),
        )
        page = self.paginate_queryset(tasks)

        return self.get_paginated_response(
            TaskSerializer(
                page,
                many=True,
                context={"request": request},
            ).data
        )

class DatasetAnnotatorAssignmentsView(APIView):
    def get(self, request, dataset_id):
        dataset = get_dataset_for_user(
            dataset_id=dataset_id,
            user=request.user,
        )

        assignments = get_annotator_assignments_for_dataset(dataset=dataset)

        return Response(
            {
                "data": AnnotatorAssignmentSerializer(assignments, many=True).data,
                "next_cursor": None,
            },
            status=status.HTTP_200_OK,
        )

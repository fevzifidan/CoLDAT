from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.datasets.selectors import get_dataset_for_user

from .permissions import CanManageTasks
from .selectors import (
    get_dataset_tasks_for_user,
    get_project_tasks_for_user,
    get_task_for_user,
    get_task_images_for_user,
    get_tasks_assigned_to_user,
)
from .serializers import (
    TaskAssignSerializer,
    TaskCreateSerializer,
    TaskImageSerializer,
    TaskSerializer,
    TaskStatusUpdateSerializer,
)
from .services import (
    assign_task,
    create_task,
    delete_task,
    update_task_status,
)


class TaskListCreateView(APIView):
    def get(self, request):
        tasks = get_tasks_assigned_to_user(user=request.user)

        return Response(
            {
                "data": TaskSerializer(tasks, many=True).data,
                "next_cursor": None,
            },
            status=status.HTTP_200_OK,
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
            assignee_id=serializer.validated_data["assignee_id"],
            image_ids=serializer.validated_data["image_ids"],
            note=serializer.validated_data.get("note", ""),
        )

        return Response(
            TaskSerializer(task).data,
            status=status.HTTP_201_CREATED,
        )

    def get_permissions(self):
        if self.request.method == "POST":
            return [CanManageTasks()]

        return super().get_permissions()


class TaskDetailView(APIView):
    def delete(self, request, task_id):
        task = get_task_for_user(
            task_id=task_id,
            user=request.user,
        )

        self.check_object_permissions(request, task)

        delete_task(task=task)

        return Response(status=status.HTTP_204_NO_CONTENT)

    def get_permissions(self):
        return [CanManageTasks()]


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
            TaskSerializer(task).data,
            status=status.HTTP_200_OK,
        )

        serializer = TaskStatusUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Assignee can move their own task to in_progress / approval_pending.
        # Admin/reviewer can also approve/reject/complete.
        is_assignee = task.assignee_id == request.user.id

        manager_permission = CanManageTasks()
        is_manager = manager_permission.has_object_permission(request, self, task)

        if not is_assignee and not is_manager:
            return Response(
                {"detail": "You do not have permission to update this task status."},
                status=status.HTTP_403_FORBIDDEN,
            )

        task = update_task_status(
            task=task,
            user=request.user,
            status=serializer.validated_data["status"],
            note=serializer.validated_data.get("note"),
        )

        return Response(
            TaskSerializer(task).data,
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
            assignee_id=serializer.validated_data["assignee_id"],
        )

        return Response(
            TaskSerializer(task).data,
            status=status.HTTP_200_OK,
        )

    def get_permissions(self):
        return [CanManageTasks()]


class TaskImageListView(APIView):
    def get(self, request, task_id):
        task, task_images = get_task_images_for_user(
            task_id=task_id,
            user=request.user,
        )

        return Response(
            {
                "data": TaskImageSerializer(task_images, many=True).data,
                "next_cursor": None,
            },
            status=status.HTTP_200_OK,
        )


class DatasetTaskListView(APIView):
    def get(self, request, dataset_id):
        dataset, tasks = get_dataset_tasks_for_user(
            dataset_id=dataset_id,
            user=request.user,
        )

        return Response(
            {
                "data": TaskSerializer(tasks, many=True).data,
                "next_cursor": None,
            },
            status=status.HTTP_200_OK,
        )


class ProjectTaskListView(APIView):
    def get(self, request, project_id):
        project, tasks = get_project_tasks_for_user(
            project_id=project_id,
            user=request.user,
        )

        return Response(
            {
                "data": TaskSerializer(tasks, many=True).data,
                "next_cursor": None,
            },
            status=status.HTTP_200_OK,
        )
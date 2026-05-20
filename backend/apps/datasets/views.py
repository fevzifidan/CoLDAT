from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from .permissions import IsDatasetProjectAdmin
from .selectors import (
    get_dataset_for_user,
    get_dataset_members,
    get_project_datasets_for_user,
)
from .serializers import (
    DatasetCreateSerializer,
    DatasetMemberSerializer,
    DatasetSerializer,
)
from .services import create_dataset, delete_dataset


class ProjectDatasetListCreateView(APIView):
    def get(self, request, project_id):
        project, datasets = get_project_datasets_for_user(
            project_id=project_id,
            user=request.user,
        )

        return Response(
            {
                "data": DatasetSerializer(datasets, many=True).data,
                "next_cursor": None,
            },
            status=status.HTTP_200_OK,
        )

    def post(self, request, project_id):
        project, _ = get_project_datasets_for_user(
            project_id=project_id,
            user=request.user,
        )

        self.check_object_permissions(request, project)

        serializer = DatasetCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        dataset = create_dataset(
            project=project,
            created_by=request.user,
            name=serializer.validated_data["name"],
            description=serializer.validated_data.get("description", ""),
        )

        return Response(
            DatasetSerializer(dataset).data,
            status=status.HTTP_201_CREATED,
        )

    def get_permissions(self):
        if self.request.method == "POST":
            return [IsDatasetProjectAdmin()]

        return super().get_permissions()


class DatasetDetailView(APIView):
    def delete(self, request, dataset_id):
        dataset = get_dataset_for_user(
            dataset_id=dataset_id,
            user=request.user,
        )

        self.check_object_permissions(request, dataset)

        delete_dataset(dataset=dataset)

        return Response(status=status.HTTP_204_NO_CONTENT)

    def get_permissions(self):
        return [IsDatasetProjectAdmin()]


class DatasetMemberListView(APIView):
    def get(self, request, dataset_id):
        dataset = get_dataset_for_user(
            dataset_id=dataset_id,
            user=request.user,
        )

        members = get_dataset_members(dataset=dataset)

        return Response(
            {
                "data": DatasetMemberSerializer(members, many=True).data,
                "next_cursor": None,
            },
            status=status.HTTP_200_OK,
        )
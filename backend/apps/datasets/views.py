from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from .permissions import IsDatasetProjectAdmin
from .selectors import (
    get_dataset_for_user,
    get_dataset_member_by_id,
    get_dataset_members,
    get_project_datasets_for_user,
)
from .serializers import (
    DatasetCreateSerializer,
    DatasetMemberCreateSerializer,
    DatasetMemberSerializer,
    DatasetMemberUpdateSerializer,
    DatasetSerializer,
)
from .services import (
    add_or_update_dataset_member,
    create_dataset,
    delete_dataset,
    remove_dataset_member,
    update_dataset_member_role,
)


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


class DatasetMemberListCreateView(APIView):
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

    def post(self, request, dataset_id):
        dataset = get_dataset_for_user(
            dataset_id=dataset_id,
            user=request.user,
        )

        self.check_object_permissions(request, dataset)

        serializer = DatasetMemberCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        membership = add_or_update_dataset_member(
            dataset=dataset,
            username=serializer.validated_data["username"],
            role=serializer.validated_data["role"],
        )

        return Response(
            DatasetMemberSerializer(membership).data,
            status=status.HTTP_201_CREATED,
        )

    def get_permissions(self):
        if self.request.method == "POST":
            return [IsDatasetProjectAdmin()]

        return super().get_permissions()
    
class DatasetMemberDetailView(APIView):
    def patch(self, request, dataset_id, member_id):
        dataset = get_dataset_for_user(
            dataset_id=dataset_id,
            user=request.user,
        )

        self.check_object_permissions(request, dataset)

        membership = get_dataset_member_by_id(
            dataset=dataset,
            member_id=member_id,
        )

        serializer = DatasetMemberUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        membership = update_dataset_member_role(
            membership=membership,
            role=serializer.validated_data["role"],
        )

        return Response(
            DatasetMemberSerializer(membership).data,
            status=status.HTTP_200_OK,
        )

    def delete(self, request, dataset_id, member_id):
        dataset = get_dataset_for_user(
            dataset_id=dataset_id,
            user=request.user,
        )

        self.check_object_permissions(request, dataset)

        membership = get_dataset_member_by_id(
            dataset=dataset,
            member_id=member_id,
        )

        remove_dataset_member(membership=membership)

        return Response(status=status.HTTP_204_NO_CONTENT)

    def get_permissions(self):
        return [IsDatasetProjectAdmin()]
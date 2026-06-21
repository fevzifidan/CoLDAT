from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated

from apps.common.pagination import UUIDv7PaginatedAPIViewMixin

from .permissions import IsDatasetProjectAdmin
from .selectors import (
    get_dataset_for_user,
    get_dataset_member_by_id,
    get_dataset_members,
    get_datasets_for_user,
    get_project_datasets_for_user,
    get_dataset_version_for_user,
    get_dataset_versions_for_user,
    get_dataset_api_key_for_user,
    get_dataset_api_keys_for_user,
)
from .serializers import (
    DatasetCreateSerializer,
    DatasetListQuerySerializer,
    DatasetMemberCreateSerializer,
    DatasetMemberSerializer,
    DatasetMemberUpdateSerializer,
    DatasetSerializer,
    DatasetVersionCreateSerializer,
    DatasetVersionListSerializer,
    DatasetVersionSerializer,
    DatasetAPIKeyCreateResponseSerializer,
    DatasetAPIKeyCreateSerializer,
    DatasetAPIKeySerializer,
    DatasetAPIKeyUpdateSerializer,
)
from .services import (
    add_or_update_dataset_member,
    create_dataset,
    create_dataset_version,
    delete_dataset,
    delete_dataset_version,
    remove_dataset_member,
    update_dataset,
    update_dataset_member_role,
    create_dataset_api_key,
    revoke_all_dataset_api_keys,
    revoke_dataset_api_key,
    update_dataset_api_key,
)


class DatasetListView(UUIDv7PaginatedAPIViewMixin, APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        query_serializer = DatasetListQuerySerializer(
            data=request.query_params
        )
        query_serializer.is_valid(raise_exception=True)

        datasets = get_datasets_for_user(
            user=request.user,
            search=query_serializer.validated_data.get("search"),
        )
        page = self.paginate_queryset(datasets)

        return self.get_paginated_response(
            DatasetSerializer(
                page,
                many=True,
                context={"request": request},
            ).data
        )


class ProjectDatasetListCreateView(UUIDv7PaginatedAPIViewMixin, APIView):
    def get(self, request, project_id):
        project, datasets = get_project_datasets_for_user(
            project_id=project_id,
            user=request.user,
        )
        page = self.paginate_queryset(datasets)

        return self.get_paginated_response(
            DatasetSerializer(
                page,
                many=True,
                context={"request": request},
            ).data
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
            DatasetSerializer(dataset, context={"request": request}).data,
            status=status.HTTP_201_CREATED,
        )

    def get_permissions(self):
        if self.request.method == "POST":
            return [IsDatasetProjectAdmin()]

        return super().get_permissions()


class DatasetDetailView(APIView):
    def get(self, request, dataset_id):
        dataset = get_dataset_for_user(
            dataset_id=dataset_id,
            user=request.user,
        )

        return Response(
            DatasetSerializer(dataset, context={"request": request}).data,
            status=status.HTTP_200_OK,
        )

    def patch(self, request, dataset_id):
        dataset = get_dataset_for_user(
            dataset_id=dataset_id,
            user=request.user,
        )

        self.check_object_permissions(request, dataset)

        serializer = DatasetCreateSerializer(
            data=request.data,
            partial=True,
        )
        serializer.is_valid(raise_exception=True)

        dataset = update_dataset(
            dataset=dataset,
            name=serializer.validated_data.get("name"),
            description=serializer.validated_data.get("description"),
        )

        return Response(
            DatasetSerializer(dataset, context={"request": request}).data,
            status=status.HTTP_200_OK,
        )

    def delete(self, request, dataset_id):
        dataset = get_dataset_for_user(
            dataset_id=dataset_id,
            user=request.user,
        )

        self.check_object_permissions(request, dataset)

        delete_dataset(dataset=dataset)

        return Response(status=status.HTTP_204_NO_CONTENT)

    def get_permissions(self):
        if self.request.method in ["PATCH", "DELETE"]:
            return [IsDatasetProjectAdmin()]

        return super().get_permissions()


class DatasetMemberListCreateView(UUIDv7PaginatedAPIViewMixin, APIView):
    def get(self, request, dataset_id):
        dataset = get_dataset_for_user(
            dataset_id=dataset_id,
            user=request.user,
        )

        members = get_dataset_members(dataset=dataset)
        page = self.paginate_queryset(members)

        return self.get_paginated_response(
            DatasetMemberSerializer(page, many=True).data
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
    
class DatasetVersionListCreateView(APIView):
    def get(self, request, dataset_id):
        dataset, versions = get_dataset_versions_for_user(
            dataset_id=dataset_id,
            user=request.user,
        )

        return Response(
            {
                "data": DatasetVersionListSerializer(versions, many=True).data,
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

        serializer = DatasetVersionCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        version = create_dataset_version(
            dataset=dataset,
            created_by=request.user,
            version_tag=serializer.validated_data["version_tag"],
            description=serializer.validated_data.get("description", ""),
        )

        return Response(
            DatasetVersionSerializer(version).data,
            status=status.HTTP_201_CREATED,
        )

    def get_permissions(self):
        if self.request.method == "POST":
            return [IsDatasetProjectAdmin()]

        return super().get_permissions()


class DatasetVersionDetailView(APIView):
    def get(self, request, dataset_id, version_tag):
        dataset, version = get_dataset_version_for_user(
            dataset_id=dataset_id,
            version_tag=version_tag,
            user=request.user,
        )

        return Response(
            DatasetVersionSerializer(version).data,
            status=status.HTTP_200_OK,
        )

    def delete(self, request, dataset_id, version_tag):
        dataset, version = get_dataset_version_for_user(
            dataset_id=dataset_id,
            version_tag=version_tag,
            user=request.user,
        )

        self.check_object_permissions(request, dataset)

        delete_dataset_version(version=version)

        return Response(status=status.HTTP_204_NO_CONTENT)

    def get_permissions(self):
        if self.request.method == "DELETE":
            return [IsDatasetProjectAdmin()]

        return super().get_permissions()
    
class DatasetAPIKeyListCreateView(UUIDv7PaginatedAPIViewMixin, APIView):
    def get(self, request, dataset_id):
        dataset, api_keys = get_dataset_api_keys_for_user(
            dataset_id=dataset_id,
            user=request.user,
        )
        page = self.paginate_queryset(api_keys)

        return self.get_paginated_response(
            DatasetAPIKeySerializer(page, many=True).data
        )

    def post(self, request, dataset_id):
        dataset = get_dataset_for_user(
            dataset_id=dataset_id,
            user=request.user,
        )

        self.check_object_permissions(request, dataset)

        serializer = DatasetAPIKeyCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        api_key, raw_key = create_dataset_api_key(
            dataset=dataset,
            created_by=request.user,
            name=serializer.validated_data["name"],
            ttl_days=serializer.validated_data.get("ttl_days"),
            target_version=serializer.validated_data.get("target_version"),
        )

        data = DatasetAPIKeyCreateResponseSerializer(api_key).data
        data["raw_key"] = raw_key

        return Response(
            data,
            status=status.HTTP_201_CREATED,
        )

    def get_permissions(self):
        if self.request.method == "POST":
            return [IsDatasetProjectAdmin()]

        return super().get_permissions()


class DatasetAPIKeyDetailView(APIView):
    def patch(self, request, dataset_id, key_id):
        dataset, api_key = get_dataset_api_key_for_user(
            dataset_id=dataset_id,
            key_id=key_id,
            user=request.user,
        )

        self.check_object_permissions(request, dataset)

        serializer = DatasetAPIKeyUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        api_key = update_dataset_api_key(
            api_key=api_key,
            data=serializer.validated_data,
        )

        return Response(
            DatasetAPIKeySerializer(api_key).data,
            status=status.HTTP_200_OK,
        )

    def delete(self, request, dataset_id, key_id):
        dataset, api_key = get_dataset_api_key_for_user(
            dataset_id=dataset_id,
            key_id=key_id,
            user=request.user,
        )

        self.check_object_permissions(request, dataset)

        revoke_dataset_api_key(api_key=api_key)

        return Response(status=status.HTTP_204_NO_CONTENT)

    def get_permissions(self):
        return [IsDatasetProjectAdmin()]


class DatasetAPIKeyRevokeAllView(APIView):
    def post(self, request, dataset_id):
        dataset = get_dataset_for_user(
            dataset_id=dataset_id,
            user=request.user,
        )

        self.check_object_permissions(request, dataset)

        revoked_count = revoke_all_dataset_api_keys(dataset=dataset)

        return Response(
            {
                "revoked_count": revoked_count,
            },
            status=status.HTTP_200_OK,
        )

    def get_permissions(self):
        return [IsDatasetProjectAdmin()]


class DatasetAPIKeyRevealView(APIView):
    def get(self, request, dataset_id, key_id):
        dataset, api_key = get_dataset_api_key_for_user(
            dataset_id=dataset_id,
            key_id=key_id,
            user=request.user,
        )

        self.check_object_permissions(request, dataset)

        return Response(
            {
                "id": str(api_key.id),
                "dataset_id": str(dataset.id),
                "name": api_key.name,
                "key_prefix": api_key.key_prefix,
                "is_active": api_key.is_active,
                "target_version": api_key.target_version,
                "expires_at": api_key.expires_at,
                "raw_key": None,
                "message": (
                    "The full API key cannot be revealed after creation. "
                    "Create a new key if you lost the original."
                ),
            },
            status=status.HTTP_200_OK,
        )

    def get_permissions(self):
        return [IsDatasetProjectAdmin()]

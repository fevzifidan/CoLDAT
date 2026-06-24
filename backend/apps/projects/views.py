from django.core.exceptions import PermissionDenied
from django.http import Http404
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.common.pagination import UUIDv7PaginatedAPIViewMixin

from .models import Project
from .permissions import IsProjectAdmin
from .selectors import (
    get_project_for_user,
    get_project_membership_by_id,
    get_project_memberships,
    get_projects_for_user,
)
from .serializers import (
    ProjectCreateSerializer,
    ProjectMembershipCreateSerializer,
    ProjectMembershipSerializer,
    ProjectSerializer,
    ProjectUpdateSerializer,
)
from .services import (
    add_project_member,
    archive_project,
    create_project,
    remove_project_member,
    update_project,
)


class ProjectListCreateView(UUIDv7PaginatedAPIViewMixin, APIView):
    def get(self, request):
        projects = get_projects_for_user(user=request.user)
        page = self.paginate_queryset(projects)

        return self.get_paginated_response(
            ProjectSerializer(
                page,
                many=True,
                context={"request": request},
            ).data
        )

    def post(self, request):
        serializer = ProjectCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        project = create_project(
            owner=request.user,
            name=serializer.validated_data["name"],
            description=serializer.validated_data.get("description", ""),
        )

        return Response(
            ProjectSerializer(project, context={"request": request}).data,
            status=status.HTTP_201_CREATED,
        )


class ProjectDetailView(APIView):
    def get_project(self, project_id):
        try:
            return Project.objects.get(id=project_id, is_archived=False)
        except Project.DoesNotExist:
            raise Http404("Project not found.")

    def get(self, request, project_id):
        project = self.get_project(project_id)

        if not project.memberships.filter(user=request.user).exists():
            raise PermissionDenied(
                "You do not have permission to view this project."
            )

        return Response(
            ProjectSerializer(project, context={"request": request}).data,
            status=status.HTTP_200_OK,
        )

    def patch(self, request, project_id):
        project = self.get_project(project_id)

        self.check_object_permissions(request, project)

        serializer = ProjectUpdateSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)

        project = update_project(
            project=project,
            data=serializer.validated_data,
        )

        return Response(
            ProjectSerializer(project, context={"request": request}).data,
            status=status.HTTP_200_OK,
        )

    def delete(self, request, project_id):
        project = self.get_project(project_id)

        self.check_object_permissions(request, project)

        archive_project(project=project)

        return Response(status=status.HTTP_204_NO_CONTENT)

    def get_permissions(self):
        if self.request.method in ["PATCH", "DELETE"]:
            return [IsProjectAdmin()]

        return super().get_permissions()
    
    
class ProjectMemberListCreateView(APIView):
    def get(self, request, project_id):
        project = get_project_for_user(
            project_id=project_id,
            user=request.user,
        )

        memberships = get_project_memberships(project=project)

        # exclude_dataset_members query parametresi: belirtilen dataset'in mevcut
        # üyelerini sonuçtan hariç tutar (AddDatasetMembersPage için)
        exclude_dataset_id = request.query_params.get("exclude_dataset_members")
        if exclude_dataset_id:
            from apps.datasets.models import DatasetMember

            existing_user_ids = DatasetMember.objects.filter(
                dataset_id=exclude_dataset_id,
            ).values_list("user_id", flat=True)
            memberships = memberships.exclude(user_id__in=existing_user_ids)

        return Response(
            ProjectMembershipSerializer(memberships, many=True).data,
            status=status.HTTP_200_OK,
        )

    def post(self, request, project_id):
        project = get_project_for_user(
            project_id=project_id,
            user=request.user,
        )

        self.check_object_permissions(request, project)

        serializer = ProjectMembershipCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        membership = add_project_member(
            project=project,
            user_id=serializer.validated_data["user_id"],
        )

        return Response(
            ProjectMembershipSerializer(membership).data,
            status=status.HTTP_201_CREATED,
        )

    def get_permissions(self):
        if self.request.method == "POST":
            return [IsProjectAdmin()]

        return super().get_permissions()


class ProjectMemberDetailView(APIView):
    def delete(self, request, project_id, membership_id):
        project = get_project_for_user(
            project_id=project_id,
            user=request.user,
        )

        self.check_object_permissions(request, project)

        membership = get_project_membership_by_id(
            project=project,
            membership_id=membership_id,
        )

        remove_project_member(membership=membership)

        return Response(status=status.HTTP_204_NO_CONTENT)

    def get_permissions(self):
        return [IsProjectAdmin()]


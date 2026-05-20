from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

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
    ProjectMembershipUpdateSerializer,
    ProjectSerializer,
    ProjectUpdateSerializer,
)
from .services import (
    add_project_member,
    archive_project,
    create_project,
    remove_project_member,
    update_project,
    update_project_member_role,
)


class ProjectListCreateView(APIView):
    def get(self, request):
        projects = get_projects_for_user(user=request.user)

        return Response(
            ProjectSerializer(projects, many=True).data,
            status=status.HTTP_200_OK,
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
            ProjectSerializer(project).data,
            status=status.HTTP_201_CREATED,
        )


class ProjectDetailView(APIView):
    def get_project(self, request, project_id):
        return get_object_or_404(
            Project,
            id=project_id,
            memberships__user=request.user,
            is_archived=False,
        )

    def get(self, request, project_id):
        project = self.get_project(request, project_id)

        return Response(
            ProjectSerializer(project).data,
            status=status.HTTP_200_OK,
        )

    def patch(self, request, project_id):
        project = self.get_project(request, project_id)

        self.check_object_permissions(request, project)

        serializer = ProjectUpdateSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)

        project = update_project(
            project=project,
            data=serializer.validated_data,
        )

        return Response(
            ProjectSerializer(project).data,
            status=status.HTTP_200_OK,
        )

    def delete(self, request, project_id):
        project = self.get_project(request, project_id)

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
            role=serializer.validated_data["role"],
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
    def patch(self, request, project_id, membership_id):
        project = get_project_for_user(
            project_id=project_id,
            user=request.user,
        )

        self.check_object_permissions(request, project)

        membership = get_project_membership_by_id(
            project=project,
            membership_id=membership_id,
        )

        serializer = ProjectMembershipUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        membership = update_project_member_role(
            membership=membership,
            role=serializer.validated_data["role"],
        )

        return Response(
            ProjectMembershipSerializer(membership).data,
            status=status.HTTP_200_OK,
        )

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
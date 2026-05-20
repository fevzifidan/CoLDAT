from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.projects.selectors import get_project_for_user

from .permissions import CanManageTaxonomy
from .selectors import get_project_taxonomy_for_user
from .serializers import (
    ProjectAttributeSerializer,
    ProjectClassSerializer,
    ProjectPredicateSerializer,
    ProjectTaxonomyUpdateSerializer,
)
from .services import bulk_update_project_taxonomy


class ProjectTaxonomyView(APIView):
    def get(self, request, project_id):
        project, classes, predicates, attributes = get_project_taxonomy_for_user(
            project_id=project_id,
            user=request.user,
        )

        return Response(
            {
                "classes": ProjectClassSerializer(classes, many=True).data,
                "predicates": ProjectPredicateSerializer(predicates, many=True).data,
                "attributes": ProjectAttributeSerializer(attributes, many=True).data,
            },
            status=status.HTTP_200_OK,
        )

    def put(self, request, project_id):
        project = get_project_for_user(
            project_id=project_id,
            user=request.user,
        )

        self.check_object_permissions(request, project)

        serializer = ProjectTaxonomyUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        classes, predicates, attributes = bulk_update_project_taxonomy(
            project=project,
            data=serializer.validated_data,
        )

        return Response(
            {
                "classes": ProjectClassSerializer(classes, many=True).data,
                "predicates": ProjectPredicateSerializer(predicates, many=True).data,
                "attributes": ProjectAttributeSerializer(attributes, many=True).data,
            },
            status=status.HTTP_200_OK,
        )

    def get_permissions(self):
        if self.request.method == "PUT":
            return [CanManageTaxonomy()]

        return super().get_permissions()
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.projects.selectors import get_project_for_user

from .permissions import CanManageTaxonomy
from .selectors import (
    get_project_attribute_for_user,
    get_project_class_for_user,
    get_project_predicate_for_user,
    get_project_taxonomy_for_user,
)
from .serializers import (
    ProjectAttributeCreateUpdateSerializer,
    ProjectAttributeSerializer,
    ProjectClassCreateUpdateSerializer,
    ProjectClassSerializer,
    ProjectPredicateCreateUpdateSerializer,
    ProjectPredicateSerializer,
    ProjectTaxonomyDeleteSerializer,
    ProjectTaxonomyUpdateSerializer,
    ProjectTaxonomyQuerySerializer,
)
from .services import (
    bulk_update_project_taxonomy,
    delete_project_attribute,
    delete_project_class,
    delete_project_predicate,
    update_project_attribute,
    update_project_class,
    update_project_predicate,
)


class ProjectTaxonomyView(APIView):
    def get(self, request, project_id):
        query_serializer = ProjectTaxonomyQuerySerializer(
            data=request.query_params
        )
        query_serializer.is_valid(raise_exception=True)

        project, classes, predicates, attributes = get_project_taxonomy_for_user(
            project_id=project_id,
            user=request.user,
            status=query_serializer.validated_data["status"],
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

    def delete(self, request, project_id):
        project = get_project_for_user(
            project_id=project_id,
            user=request.user,
        )

        self.check_object_permissions(request, project)

        serializer = ProjectTaxonomyDeleteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        item_type = serializer.validated_data["type"]
        target_id = serializer.validated_data["target_id"]

        if item_type == "class":
            project_class = get_project_class_for_user(
                class_id=target_id,
                user=request.user,
            )

            if project_class.project_id != project.id:
                from rest_framework.exceptions import ValidationError
                raise ValidationError("Class does not belong to this project.")

            delete_project_class(project_class=project_class)

        elif item_type == "predicate":
            predicate = get_project_predicate_for_user(
                predicate_id=target_id,
                user=request.user,
            )

            if predicate.project_id != project.id:
                from rest_framework.exceptions import ValidationError
                raise ValidationError("Predicate does not belong to this project.")

            delete_project_predicate(predicate=predicate)

        elif item_type == "attribute":
            attribute = get_project_attribute_for_user(
                attribute_id=target_id,
                user=request.user,
            )

            if attribute.project_id != project.id:
                from rest_framework.exceptions import ValidationError
                raise ValidationError("Attribute does not belong to this project.")

            delete_project_attribute(attribute=attribute)

        return Response(status=status.HTTP_204_NO_CONTENT)

    def get_permissions(self):
        if self.request.method in ["PUT", "DELETE"]:
            return [CanManageTaxonomy()]

        return super().get_permissions()
    
class ProjectTaxonomyClassDetailView(APIView):
    def patch(self, request, project_id, class_id):
        project = get_project_for_user(
            project_id=project_id,
            user=request.user,
        )

        self.check_object_permissions(request, project)

        project_class = get_project_class_for_user(
            class_id=class_id,
            user=request.user,
        )

        if project_class.project_id != project.id:
            from rest_framework.exceptions import ValidationError
            raise ValidationError("Class does not belong to this project.")

        serializer = ProjectClassCreateUpdateSerializer(
            data=request.data,
            partial=True,
        )
        serializer.is_valid(raise_exception=True)

        project_class = update_project_class(
            project_class=project_class,
            data=serializer.validated_data,
        )

        return Response(
            ProjectClassSerializer(project_class).data,
            status=status.HTTP_200_OK,
        )

    def get_permissions(self):
        return [CanManageTaxonomy()]


class ProjectTaxonomyPredicateDetailView(APIView):
    def patch(self, request, project_id, predicate_id):
        project = get_project_for_user(
            project_id=project_id,
            user=request.user,
        )

        self.check_object_permissions(request, project)

        predicate = get_project_predicate_for_user(
            predicate_id=predicate_id,
            user=request.user,
        )

        if predicate.project_id != project.id:
            from rest_framework.exceptions import ValidationError
            raise ValidationError("Predicate does not belong to this project.")

        serializer = ProjectPredicateCreateUpdateSerializer(
            data=request.data,
            partial=True,
        )
        serializer.is_valid(raise_exception=True)

        predicate = update_project_predicate(
            predicate=predicate,
            data=serializer.validated_data,
        )

        return Response(
            ProjectPredicateSerializer(predicate).data,
            status=status.HTTP_200_OK,
        )

    def get_permissions(self):
        return [CanManageTaxonomy()]


class ProjectTaxonomyAttributeDetailView(APIView):
    def patch(self, request, project_id, attribute_id):
        project = get_project_for_user(
            project_id=project_id,
            user=request.user,
        )

        self.check_object_permissions(request, project)

        attribute = get_project_attribute_for_user(
            attribute_id=attribute_id,
            user=request.user,
        )

        if attribute.project_id != project.id:
            from rest_framework.exceptions import ValidationError
            raise ValidationError("Attribute does not belong to this project.")

        serializer = ProjectAttributeCreateUpdateSerializer(
            data=request.data,
            partial=True,
        )
        serializer.is_valid(raise_exception=True)

        attribute = update_project_attribute(
            attribute=attribute,
            data=serializer.validated_data,
        )

        return Response(
            ProjectAttributeSerializer(attribute).data,
            status=status.HTTP_200_OK,
        )

    def get_permissions(self):
        return [CanManageTaxonomy()]
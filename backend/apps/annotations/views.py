from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from .permissions import CanEditImageAnnotations
from .selectors import (
    get_annotation_objects_for_image,
    get_image_for_annotation_user,
    get_relationships_for_image,
)
from .serializers import (
    AnnotationDataInputSerializer,
    AnnotationObjectOutputSerializer,
    SceneGraphRelationshipOutputSerializer,
)
from .services import clear_image_annotations, replace_image_annotations


class ImageAnnotationView(APIView):
    def get(self, request, image_id):
        image = get_image_for_annotation_user(
            image_id=image_id,
            user=request.user,
        )

        objects = get_annotation_objects_for_image(image=image)
        relationships = get_relationships_for_image(image=image)

        return Response(
            {
                "objects": AnnotationObjectOutputSerializer(objects, many=True).data,
                "relationships": SceneGraphRelationshipOutputSerializer(
                    relationships,
                    many=True,
                ).data,
            },
            status=status.HTTP_200_OK,
        )

    def put(self, request, image_id):
        image = get_image_for_annotation_user(
            image_id=image_id,
            user=request.user,
        )

        self.check_object_permissions(request, image)

        serializer = AnnotationDataInputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        replace_image_annotations(
            image=image,
            data=serializer.validated_data,
            user=request.user,
        )

        objects = get_annotation_objects_for_image(image=image)
        relationships = get_relationships_for_image(image=image)

        return Response(
            {
                "objects": AnnotationObjectOutputSerializer(objects, many=True).data,
                "relationships": SceneGraphRelationshipOutputSerializer(
                    relationships,
                    many=True,
                ).data,
            },
            status=status.HTTP_200_OK,
        )

    def delete(self, request, image_id):
        image = get_image_for_annotation_user(
            image_id=image_id,
            user=request.user,
        )

        self.check_object_permissions(request, image)

        clear_image_annotations(image=image)

        return Response(status=status.HTTP_204_NO_CONTENT)

    def get_permissions(self):
        if self.request.method in ["PUT", "DELETE"]:
            return [CanEditImageAnnotations()]

        return super().get_permissions()
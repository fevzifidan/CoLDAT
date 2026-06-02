from rest_framework import serializers

from apps.taxonomy.models import ProjectClass, ProjectPredicate

from .models import AnnotationObject, SceneGraphRelationship


class AnnotationObjectInputSerializer(serializers.Serializer):
    id = serializers.UUIDField()
    class_id = serializers.UUIDField()
    type = serializers.ChoiceField(
        choices=AnnotationObject.GeometryType.choices,
    )
    coordinates = serializers.ListField(
        child=serializers.FloatField(),
        allow_empty=False,
    )


class SceneGraphRelationshipInputSerializer(serializers.Serializer):
    subject_id = serializers.UUIDField()
    object_id = serializers.UUIDField()
    predicate = serializers.CharField(max_length=255)


class AnnotationDataInputSerializer(serializers.Serializer):
    objects = AnnotationObjectInputSerializer(many=True, required=False)
    relationships = SceneGraphRelationshipInputSerializer(many=True, required=False)


class AnnotationObjectOutputSerializer(serializers.ModelSerializer):
    class_id = serializers.UUIDField(source="annotation_class.id", read_only=True)
    type = serializers.CharField(source="geometry_type", read_only=True)

    class Meta:
        model = AnnotationObject
        fields = [
            "id",
            "class_id",
            "type",
            "coordinates",
        ]


class SceneGraphRelationshipOutputSerializer(serializers.ModelSerializer):
    subject_id = serializers.UUIDField(source="subject.id", read_only=True)
    object_id = serializers.UUIDField(source="object.id", read_only=True)
    predicate = serializers.CharField(source="predicate.name", read_only=True)

    class Meta:
        model = SceneGraphRelationship
        fields = [
            "subject_id",
            "object_id",
            "predicate",
        ]


class AnnotationDataOutputSerializer(serializers.Serializer):
    objects = AnnotationObjectOutputSerializer(many=True)
    relationships = SceneGraphRelationshipOutputSerializer(many=True)
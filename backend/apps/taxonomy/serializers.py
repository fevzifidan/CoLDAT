from rest_framework import serializers

from .models import ProjectAttribute, ProjectClass, ProjectPredicate


class ProjectClassSerializer(serializers.ModelSerializer):
    project_id = serializers.UUIDField(source="project.id", read_only=True)

    class Meta:
        model = ProjectClass
        fields = [
            "id",
            "project_id",
            "name",
            "color",
            "index",
            "is_active",
            "include_in_export",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "project_id",
            "created_at",
            "updated_at",
        ]


class ProjectClassCreateUpdateSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=255)
    color = serializers.CharField(max_length=20, required=False, allow_blank=True)
    index = serializers.IntegerField(min_value=0)
    is_active = serializers.BooleanField(required=False)
    include_in_export = serializers.BooleanField(required=False)


class ProjectPredicateSerializer(serializers.ModelSerializer):
    project_id = serializers.UUIDField(source="project.id", read_only=True)

    class Meta:
        model = ProjectPredicate
        fields = [
            "id",
            "project_id",
            "name",
            "is_active",
            "include_in_export",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "project_id",
            "created_at",
            "updated_at",
        ]


class ProjectPredicateCreateUpdateSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=255)
    is_active = serializers.BooleanField(required=False)
    include_in_export = serializers.BooleanField(required=False)


class ProjectAttributeSerializer(serializers.ModelSerializer):
    project_id = serializers.UUIDField(source="project.id", read_only=True)

    class Meta:
        model = ProjectAttribute
        fields = [
            "id",
            "project_id",
            "name",
            "attribute_type",
            "options",
            "is_active",
            "include_in_export",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "project_id",
            "created_at",
            "updated_at",
        ]


class ProjectAttributeCreateUpdateSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=255)
    attribute_type = serializers.ChoiceField(
        choices=ProjectAttribute.AttributeType.choices
    )
    options = serializers.ListField(
        child=serializers.CharField(),
        required=False,
        allow_empty=True,
    )
    is_active = serializers.BooleanField(required=False)
    include_in_export = serializers.BooleanField(required=False)

class TaxonomyBaseBulkItemSerializer(serializers.Serializer):
    id = serializers.UUIDField(required=False)
    name = serializers.CharField(max_length=255)
    is_active = serializers.BooleanField(required=False)
    include_in_export = serializers.BooleanField(required=False)


class ClassBulkItemSerializer(TaxonomyBaseBulkItemSerializer):
    index = serializers.IntegerField(min_value=0, required=False)
    color = serializers.CharField(max_length=20, required=False, allow_blank=True)


class AttributeBulkItemSerializer(TaxonomyBaseBulkItemSerializer):
    attribute_type = serializers.ChoiceField(
        choices=ProjectAttribute.AttributeType.choices,
        required=False,
    )
    options = serializers.ListField(
        child=serializers.CharField(),
        required=False,
        allow_empty=True,
    )


class ProjectTaxonomySerializer(serializers.Serializer):
    classes = ProjectClassSerializer(many=True)
    predicates = ProjectPredicateSerializer(many=True)
    attributes = ProjectAttributeSerializer(many=True)


class ProjectTaxonomyUpdateSerializer(serializers.Serializer):
    classes = ClassBulkItemSerializer(many=True, required=False)
    predicates = TaxonomyBaseBulkItemSerializer(many=True, required=False)
    attributes = AttributeBulkItemSerializer(many=True, required=False)

class ProjectTaxonomyDeleteSerializer(serializers.Serializer):
    type = serializers.ChoiceField(
        choices=[
            "class",
            "predicate",
            "attribute",
        ]
    )
    target_id = serializers.UUIDField()

class ProjectTaxonomyQuerySerializer(serializers.Serializer):
    status = serializers.ChoiceField(
        choices=[
            "active",
            "inactive",
            "all",
        ],
        required=False,
        default="all",
    )
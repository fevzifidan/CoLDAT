from rest_framework import serializers

from .models import Dataset, DatasetAPIKey, DatasetMember, DatasetVersion


class DatasetSerializer(serializers.ModelSerializer):
    project_id = serializers.UUIDField(source="project.id", read_only=True)
    created_by_id = serializers.UUIDField(source="created_by.id", read_only=True)
    created_by_username = serializers.CharField(
        source="created_by.username",
        read_only=True,
    )
    role = serializers.SerializerMethodField()

    current_version = serializers.SerializerMethodField()
    total_images = serializers.IntegerField(source="_total_images", read_only=True)
    annotated_images = serializers.IntegerField(source="_annotated_images", read_only=True)

    class Meta:
        model = Dataset
        fields = [
            "id",
            "project_id",
            "name",
            "description",
            "created_by_id",
            "created_by_username",
            "role",
            "current_version",
            "total_images",
            "annotated_images",
            "is_deleted",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "project_id",
            "created_by_id",
            "created_by_username",
            "role",
            "current_version",
            "total_images",
            "annotated_images",
            "is_deleted",
            "created_at",
            "updated_at",
        ]

    def get_role(self, obj):
        request = self.context.get("request")

        if not request or not request.user or not request.user.is_authenticated:
            return None

        dataset_membership = DatasetMember.objects.filter(
            dataset=obj,
            user=request.user,
        ).first()

        if dataset_membership:
            return dataset_membership.role

        if obj.project.owner_id == request.user.id:
            return "admin"

        return None

    def get_current_version(self, obj):
        latest_version = obj.versions.order_by("-created_at").first()
        return latest_version.version_tag if latest_version else None

class DatasetCreateSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=255)
    description = serializers.CharField(required=False, allow_blank=True)
    initial_version_note = serializers.CharField(required=False, allow_blank=True)


class DatasetMemberSerializer(serializers.ModelSerializer):
    user_id = serializers.UUIDField(source="user.id", read_only=True)
    username = serializers.CharField(source="user.username", read_only=True)
    email = serializers.EmailField(source="user.email", read_only=True)
    first_name = serializers.CharField(source="user.first_name", read_only=True)
    last_name = serializers.CharField(source="user.last_name", read_only=True)

    class Meta:
        model = DatasetMember
        fields = [
            "id",
            "user_id",
            "username",
            "email",
            "first_name",
            "last_name",
            "role",
            "joined_at",
        ]
        read_only_fields = [
            "id",
            "user_id",
            "username",
            "email",
            "first_name",
            "last_name",
            "joined_at",
        ]

class DatasetMemberCreateSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    role = serializers.ChoiceField(choices=DatasetMember.Role.choices)


class DatasetMemberUpdateSerializer(serializers.Serializer):
    role = serializers.ChoiceField(choices=DatasetMember.Role.choices)

class DatasetListQuerySerializer(serializers.Serializer):
    search = serializers.CharField(
        required=False,
        allow_blank=False,
    )

class DatasetVersionSerializer(serializers.ModelSerializer):
    dataset_id = serializers.UUIDField(source="dataset.id", read_only=True)
    created_by_id = serializers.UUIDField(source="created_by.id", read_only=True)
    created_by_username = serializers.CharField(
        source="created_by.username",
        read_only=True,
    )

    class Meta:
        model = DatasetVersion
        fields = [
            "id",
            "dataset_id",
            "version_tag",
            "description",
            "snapshot",
            "created_by_id",
            "created_by_username",
            "created_at",
        ]


class DatasetVersionListSerializer(serializers.ModelSerializer):
    dataset_id = serializers.UUIDField(source="dataset.id", read_only=True)
    created_by_id = serializers.UUIDField(source="created_by.id", read_only=True)
    created_by_username = serializers.CharField(
        source="created_by.username",
        read_only=True,
    )

    class Meta:
        model = DatasetVersion
        fields = [
            "id",
            "dataset_id",
            "version_tag",
            "description",
            "created_by_id",
            "created_by_username",
            "created_at",
        ]


class DatasetVersionCreateSerializer(serializers.Serializer):
    version_tag = serializers.CharField(max_length=100)
    description = serializers.CharField(
        required=False,
        allow_blank=True,
    )


class DatasetVersionRestoreSerializer(serializers.Serializer):
    mode = serializers.ChoiceField(
        choices=["create_new", "replace"],
        default="create_new",
    )


class DatasetAPIKeySerializer(serializers.ModelSerializer):
    dataset_id = serializers.UUIDField(source="dataset.id", read_only=True)
    created_by_id = serializers.UUIDField(source="created_by.id", read_only=True)
    created_by_username = serializers.CharField(
        source="created_by.username",
        read_only=True,
    )

    class Meta:
        model = DatasetAPIKey
        fields = [
            "id",
            "dataset_id",
            "name",
            "key_prefix",
            "is_active",
            "target_version",
            "expires_at",
            "created_by_id",
            "created_by_username",
            "created_at",
            "revoked_at",
        ]


class DatasetAPIKeyCreateSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=255)
    ttl_days = serializers.IntegerField(
        required=False,
        min_value=1,
        max_value=3650,
    )
    target_version = serializers.CharField(
        required=False,
        allow_blank=False,
        max_length=100,
    )


class DatasetAPIKeyCreateResponseSerializer(DatasetAPIKeySerializer):
    raw_key = serializers.CharField(read_only=True)

    class Meta(DatasetAPIKeySerializer.Meta):
        fields = DatasetAPIKeySerializer.Meta.fields + [
            "raw_key",
        ]


class DatasetAPIKeyUpdateSerializer(serializers.Serializer):
    name = serializers.CharField(
        max_length=255,
        required=False,
    )
    is_active = serializers.BooleanField(
        required=False,
    )
    ttl_days = serializers.IntegerField(
        required=False,
        min_value=1,
        max_value=3650,
    )

    def validate(self, attrs):
        if not attrs:
            raise serializers.ValidationError(
                "At least one field must be provided."
            )

        return attrs

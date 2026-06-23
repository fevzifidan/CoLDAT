from rest_framework import serializers
from django.conf import settings
from django.utils import timezone

from apps.assets.storage import create_presigned_download_url
from apps.assets.models import Asset
from apps.datasets.models import DatasetMember
from .models import Task, TaskImage


class TaskImageSerializer(serializers.ModelSerializer):
    image_id = serializers.UUIDField(source="image.id", read_only=True)
    asset_id = serializers.UUIDField(source="image.id", read_only=True)
    filename = serializers.CharField(source="image.filename", read_only=True)
    mime_type = serializers.CharField(source="image.mime_type", read_only=True)
    width = serializers.IntegerField(source="image.width", read_only=True)
    height = serializers.IntegerField(source="image.height", read_only=True)
    status = serializers.SerializerMethodField()
    embedding_status = serializers.SerializerMethodField()
    asset_url = serializers.SerializerMethodField()
    asset_url_expiry_at = serializers.SerializerMethodField()
    sam_embedding_url = serializers.SerializerMethodField()
    sam_embedding_url_expiry_at = serializers.SerializerMethodField()

    class Meta:
        model = TaskImage
        fields = [
            "id",
            "image_id",
            "asset_id",
            "filename",
            "mime_type",
            "width",
            "height",
            "status",
            "embedding_status",
            "asset_url",
            "asset_url_expiry_at",
            "sam_embedding_url",
            "sam_embedding_url_expiry_at",
            "added_at",
        ]

    def get_status(self, obj):
        return obj.image.status.upper()

    def get_embedding_status(self, obj):
        if obj.image.embedding_status == Asset.EmbeddingStatus.NOT_REQUESTED:
            return None
        return obj.image.embedding_status.upper()

    def get_asset_url(self, obj):
        if obj.image.status != Asset.UploadStatus.UPLOADED:
            return None
        return create_presigned_download_url(
            storage_key=obj.image.storage_key,
            expires_in=settings.ASSET_READ_URL_EXPIRES_IN_SECONDS,
        )

    def get_asset_url_expiry_at(self, obj):
        if obj.image.status != Asset.UploadStatus.UPLOADED:
            return None
        return self.context["read_url_expiry_at"]

    def get_sam_embedding_url(self, obj):
        if obj.image.embedding_status != Asset.EmbeddingStatus.UPLOADED:
            return None
        if not obj.image.embedding_storage_key:
            return None
        return create_presigned_download_url(
            storage_key=obj.image.embedding_storage_key,
            expires_in=settings.ASSET_READ_URL_EXPIRES_IN_SECONDS,
        )

    def get_sam_embedding_url_expiry_at(self, obj):
        if obj.image.embedding_status != Asset.EmbeddingStatus.UPLOADED:
            return None
        return self.context["read_url_expiry_at"]


class TaskSerializer(serializers.ModelSerializer):
    dataset_id = serializers.UUIDField(source="dataset.id", read_only=True)
    project_id = serializers.UUIDField(source="dataset.project.id", read_only=True)

    assignee_id = serializers.UUIDField(source="assignee.id", read_only=True)
    assignee_username = serializers.CharField(source="assignee.username", read_only=True)

    created_by_id = serializers.UUIDField(source="created_by.id", read_only=True)
    created_by_username = serializers.CharField(source="created_by.username", read_only=True)

    image_count = serializers.SerializerMethodField()
    role = serializers.SerializerMethodField()

    class Meta:
        model = Task
        fields = [
            "id",
            "dataset_id",
            "project_id",
            "assignee_id",
            "assignee_username",
            "role",
            "created_by_id",
            "created_by_username",
            "name",
            "description",
            "priority",
            "deadline",
            "status",
            "note",
            "started_at",
            "completed_at",
            "image_count",
            "created_at",
            "updated_at",
        ]

    def get_image_count(self, obj):
        return obj.task_images.count()

    def get_role(self, obj):
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return obj.role

        if obj.dataset.project.owner_id == request.user.id:
            return Task.Role.ADMIN

        if obj.assignee_id == request.user.id:
            return obj.role

        dataset_role = DatasetMember.objects.filter(
            dataset=obj.dataset,
            user=request.user,
        ).values_list("role", flat=True).first()

        return dataset_role


class TaskCreateSerializer(serializers.Serializer):
    dataset_id = serializers.UUIDField()
    assignee_username = serializers.CharField(max_length=150)
    role = serializers.ChoiceField(
        choices=Task.Role.choices,
        required=False,
        default=Task.Role.ANNOTATOR,
    )
    image_ids = serializers.ListField(
        child=serializers.UUIDField(),
        allow_empty=False,
    )
    name = serializers.CharField(
        max_length=255,
        required=False,
        default="Untitled Task",
        allow_blank=False,
    )
    description = serializers.CharField(
        required=False,
        default="",
        allow_blank=True,
    )
    priority = serializers.ChoiceField(
        choices=Task.Priority.choices,
        required=False,
        default=Task.Priority.MEDIUM,
    )
    deadline = serializers.DateTimeField(
        required=False,
        allow_null=True,
    )
    note = serializers.CharField(
        required=False,
        allow_blank=True,
        write_only=True,
        help_text="Deprecated create alias for description.",
    )

    def validate_deadline(self, value):
        if value is not None and value <= timezone.now():
            raise serializers.ValidationError(
                "Deadline must be in the future."
            )

        return value

    def validate(self, attrs):
        legacy_note = attrs.pop("note", None)

        if legacy_note is not None and not attrs.get("description"):
            attrs["description"] = legacy_note

        return attrs

class TaskImageAddSerializer(serializers.Serializer):
    image_ids = serializers.ListField(
        child=serializers.UUIDField(),
        allow_empty=False,
    )

    def validate_image_ids(self, value):
        unique_ids = list(dict.fromkeys(value))

        if len(unique_ids) > 100:
            raise serializers.ValidationError(
                "Maximum 100 images can be added at once."
            )

        return unique_ids
class TaskStatusUpdateSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=Task.Status.choices)
    note = serializers.CharField(required=False, allow_blank=True)


class TaskAssignSerializer(serializers.Serializer):
    assignee_username = serializers.CharField(max_length=150)
    role = serializers.ChoiceField(choices=Task.Role.choices)

class TaskListQuerySerializer(serializers.Serializer):
    status = serializers.ChoiceField(
        choices=Task.Status.choices,
        required=False,
    )

    assignee_username = serializers.CharField(
        max_length=150,
        required=False,
        allow_blank=False,
    )

class DatasetAnnotatorAssignmentsQuerySerializer(serializers.Serializer):
    limit = serializers.IntegerField(
        default=100, min_value=1, max_value=1000, required=False,
    )
    after = serializers.UUIDField(required=False)


class AnnotatorAssignmentSerializer(serializers.Serializer):
    asset_id = serializers.UUIDField()
    assignee_username = serializers.CharField()

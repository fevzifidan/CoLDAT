from rest_framework import serializers

from .models import Task, TaskImage


class TaskImageSerializer(serializers.ModelSerializer):
    image_id = serializers.UUIDField(source="image.id", read_only=True)
    filename = serializers.CharField(source="image.filename", read_only=True)
    mime_type = serializers.CharField(source="image.mime_type", read_only=True)
    width = serializers.IntegerField(source="image.width", read_only=True)
    height = serializers.IntegerField(source="image.height", read_only=True)
    status = serializers.CharField(source="image.status", read_only=True)

    class Meta:
        model = TaskImage
        fields = [
            "id",
            "image_id",
            "filename",
            "mime_type",
            "width",
            "height",
            "status",
            "added_at",
        ]


class TaskSerializer(serializers.ModelSerializer):
    dataset_id = serializers.UUIDField(source="dataset.id", read_only=True)
    project_id = serializers.UUIDField(source="dataset.project.id", read_only=True)

    assignee_id = serializers.UUIDField(source="assignee.id", read_only=True)
    assignee_username = serializers.CharField(source="assignee.username", read_only=True)

    created_by_id = serializers.UUIDField(source="created_by.id", read_only=True)
    created_by_username = serializers.CharField(source="created_by.username", read_only=True)

    image_count = serializers.SerializerMethodField()

    class Meta:
        model = Task
        fields = [
            "id",
            "dataset_id",
            "project_id",
            "assignee_id",
            "assignee_username",
            "created_by_id",
            "created_by_username",
            "status",
            "note",
            "image_count",
            "created_at",
            "updated_at",
        ]

    def get_image_count(self, obj):
        return obj.task_images.count()


class TaskCreateSerializer(serializers.Serializer):
    dataset_id = serializers.UUIDField()
    assignee_username = serializers.CharField(max_length=150)
    image_ids = serializers.ListField(
        child=serializers.UUIDField(),
        allow_empty=False,
    )
    note = serializers.CharField(required=False, allow_blank=True)

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
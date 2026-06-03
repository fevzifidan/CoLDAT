from rest_framework import serializers

from .models import Dataset, DatasetMember
from apps.projects.models import ProjectMembership


class DatasetSerializer(serializers.ModelSerializer):
    project_id = serializers.UUIDField(source="project.id", read_only=True)
    created_by_id = serializers.UUIDField(source="created_by.id", read_only=True)
    created_by_username = serializers.CharField(
        source="created_by.username",
        read_only=True,
    )
    role = serializers.SerializerMethodField()

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
            "is_deleted",
            "created_at",
            "updated_at",
        ]

    def get_role(self, obj):
        request = self.context.get("request")
        if not request or not request.user or not request.user.is_authenticated:
            return None
        # Önce dataset'in kendi membership'ine bak
        membership = DatasetMember.objects.filter(
            dataset=obj,
            user=request.user,
        ).first()
        if membership:
            return membership.role
        # Yoksa proje membership'ine bak (proje admin'i = dataset admin'i)
        project_membership = ProjectMembership.objects.filter(
            project=obj.project,
            user=request.user,
        ).first()
        return project_membership.role if project_membership else None


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
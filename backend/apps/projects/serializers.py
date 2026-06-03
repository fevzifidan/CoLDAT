from rest_framework import serializers

from .models import Project, ProjectMembership


class ProjectSerializer(serializers.ModelSerializer):
    owner_id = serializers.UUIDField(source="owner.id", read_only=True)
    owner_username = serializers.CharField(source="owner.username", read_only=True)
    user_role = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = [
            "id",
            "owner_id",
            "owner_username",
            "name",
            "description",
            "user_role",
            "is_archived",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "owner_id",
            "owner_username",
            "user_role",
            "is_archived",
            "created_at",
            "updated_at",
        ]

def get_user_role(self, obj):
        request = self.context.get("request")
        if not request or not request.user or not request.user.is_authenticated:
            return None
        membership = ProjectMembership.objects.filter(
            project=obj,
            user=request.user,
        ).first()
        return membership.role if membership else None

class ProjectCreateSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=255)
    description = serializers.CharField(required=False, allow_blank=True)


class ProjectUpdateSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=255, required=False)
    description = serializers.CharField(required=False, allow_blank=True)

class ProjectMembershipSerializer(serializers.ModelSerializer):
    user_id = serializers.UUIDField(source="user.id", read_only=True)
    username = serializers.CharField(source="user.username", read_only=True)
    email = serializers.EmailField(source="user.email", read_only=True)
    first_name = serializers.CharField(source="user.first_name", read_only=True)
    last_name = serializers.CharField(source="user.last_name", read_only=True)

    class Meta:
        model = ProjectMembership
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


class ProjectMembershipCreateSerializer(serializers.Serializer):
    user_id = serializers.UUIDField()
    role = serializers.ChoiceField(choices=ProjectMembership.Role.choices)


class ProjectMembershipUpdateSerializer(serializers.Serializer):
    role = serializers.ChoiceField(choices=ProjectMembership.Role.choices)
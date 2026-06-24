from rest_framework import serializers

from .models import Project, ProjectMembership


class ProjectSerializer(serializers.ModelSerializer):
    owner_id = serializers.UUIDField(source="owner.id", read_only=True)
    owner_username = serializers.CharField(source="owner.username", read_only=True)
    role = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = [
            "id",
            "owner_id",
            "owner_username",
            "name",
            "description",
            "role",
            "is_archived",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "owner_id",
            "owner_username",
            "role",
            "is_archived",
            "created_at",
            "updated_at",
        ]

    def get_role(self, obj):
        request = self.context.get("request")

        if not request or not request.user or not request.user.is_authenticated:
            return None

        # Proje sahibi admin rolüne sahiptir
        if obj.owner_id == request.user.id:
            return "admin"

        # Proje üyesi ise member olarak kabul edilir
        is_member = obj.memberships.filter(user=request.user).exists()
        if is_member:
            return "member"

        return None

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

    def validate(self, attrs):
        if "role" in self.initial_data:
            raise serializers.ValidationError(
                {"role": "Project memberships do not have roles."}
            )
        return attrs

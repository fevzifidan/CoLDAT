from rest_framework import serializers

from .models import Asset


class AssetSerializer(serializers.ModelSerializer):
    dataset_id = serializers.UUIDField(source="dataset.id", read_only=True)
    uploaded_by_id = serializers.UUIDField(source="uploaded_by.id", read_only=True)
    uploaded_by_username = serializers.CharField(
        source="uploaded_by.username",
        read_only=True,
    )

    class Meta:
        model = Asset
        fields = [
            "id",
            "dataset_id",
            "storage_key",
            "embedding_storage_key",
            "filename",
            "mime_type",
            "width",
            "height",
            "uploaded_by_id",
            "uploaded_by_username",
            "is_deleted",
            "created_at",
            "updated_at",
            "status",
            "content_sha256",
            "upload_url_valid_until",
            "uploaded_at",
            "verified_at",
            "upload_error_message",
        ]
        read_only_fields = [
            "id",
            "dataset_id",
            "uploaded_by_id",
            "uploaded_by_username",
            "is_deleted",
            "created_at",
            "updated_at",
        ]


class AssetCreateSerializer(serializers.Serializer):
    storage_key = serializers.CharField(max_length=500)
    embedding_storage_key = serializers.CharField(
        max_length=500,
        required=False,
        allow_blank=True,
    )
    filename = serializers.CharField(max_length=255)
    mime_type = serializers.CharField(max_length=100)
    width = serializers.IntegerField(required=False, min_value=1)
    height = serializers.IntegerField(required=False, min_value=1)
    content_sha256 = serializers.CharField(
        max_length=64,
        required=False,
        allow_blank=True,
    )

class S3UploadURLRequestItemSerializer(serializers.Serializer):
    upload_id = serializers.CharField(max_length=255)

    upload_type = serializers.ChoiceField(
        choices=[
            "asset",
            "embedding",
        ]
    )

    asset_id = serializers.UUIDField(required=False)
    filename = serializers.CharField(max_length=255)
    mime_type = serializers.CharField(max_length=100)
    file_sha256 = serializers.CharField(max_length=64)
    width = serializers.IntegerField(required=False, min_value=1)
    height = serializers.IntegerField(required=False, min_value=1)

    def validate_mime_type(self, value):
        allowed_types = [
            "image/jpeg",
            "image/png",
            "image/webp",
            "application/octet-stream",
        ]

        if value not in allowed_types:
            raise serializers.ValidationError("Unsupported file type.")

        return value

    def validate_file_sha256(self, value):
        if len(value) != 64:
            raise serializers.ValidationError("SHA256 hash must be 64 characters.")

        valid_chars = "0123456789abcdefABCDEF"

        if any(char not in valid_chars for char in value):
            raise serializers.ValidationError("SHA256 hash must be hexadecimal.")

        return value.lower()

    def validate(self, attrs):
        upload_type = attrs["upload_type"]

        if upload_type == "asset":
            if "asset_id" in attrs:
                raise serializers.ValidationError(
                    "asset_id should not be provided for asset uploads."
                )

        if upload_type == "embedding":
            if "asset_id" not in attrs:
                raise serializers.ValidationError(
                    "asset_id is required for embedding uploads."
                )

            raise serializers.ValidationError(
                "Embedding upload support is not implemented yet."
            )

        return attrs


class AssetUploadURLCreateSerializer(serializers.Serializer):
    files = S3UploadURLRequestItemSerializer(many=True)

    def validate_files(self, value):
        if not value:
            raise serializers.ValidationError("At least one file is required.")

        upload_ids = [item["upload_id"] for item in value]

        if len(upload_ids) != len(set(upload_ids)):
            raise serializers.ValidationError("Duplicate upload_id values are not allowed.")

        if len(value) > 100:
            raise serializers.ValidationError("Maximum 100 files can be requested at once.")

        return value
    
class AssetStatusUpdateItemSerializer(serializers.Serializer):
    asset_id = serializers.UUIDField()

    upload_type = serializers.ChoiceField(
        choices=[
            "asset",
            "embedding",
        ]
    )

    success = serializers.BooleanField()

    error_message = serializers.CharField(
        required=False,
        allow_blank=True,
    )

    def validate(self, attrs):
        if attrs["upload_type"] == "embedding":
            # This becomes real after we add embedding lifecycle fields.
            raise serializers.ValidationError(
                "Embedding status updates are not implemented yet."
            )

        return attrs

class AssetBulkStatusUpdateSerializer(serializers.Serializer):
    updates = AssetStatusUpdateItemSerializer(many=True)

    def validate_updates(self, value):
        if not value:
            raise serializers.ValidationError("At least one update is required.")

        asset_ids = [item["asset_id"] for item in value]

        if len(asset_ids) != len(set(asset_ids)):
            raise serializers.ValidationError("Duplicate asset_id values are not allowed.")

        return value
    
class AssetRetryUploadSerializer(serializers.Serializer):
    file_sha256 = serializers.CharField(
        max_length=64,
        required=False,
        allow_blank=True,
    )

    def validate_file_sha256(self, value):
        if value == "":
            return value

        if len(value) != 64:
            raise serializers.ValidationError("SHA256 hash must be 64 characters.")

        valid_chars = "0123456789abcdefABCDEF"

        if any(char not in valid_chars for char in value):
            raise serializers.ValidationError("SHA256 hash must be hexadecimal.")

        return value.lower()
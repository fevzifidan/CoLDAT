from rest_framework import serializers
from django.conf import settings

from .storage import create_presigned_download_url
from .models import Asset


class AssetSerializer(serializers.ModelSerializer):
    dataset_id = serializers.UUIDField(source="dataset.id", read_only=True)
    uploaded_by_id = serializers.UUIDField(source="uploaded_by.id", read_only=True)
    uploaded_by_username = serializers.CharField(
        source="uploaded_by.username",
        read_only=True,
    )

    status = serializers.SerializerMethodField()
    embedding_status = serializers.SerializerMethodField()

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
            "embedding_status",
            "embedding_sha256",
            "embedding_upload_url_valid_until",
            "embedding_uploaded_at",
            "embedding_verified_at",
            "embedding_error_message",
        ]
        read_only_fields = [
            "id",
            "dataset_id",
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
            "embedding_status",
            "embedding_sha256",
            "embedding_upload_url_valid_until",
            "embedding_uploaded_at",
            "embedding_verified_at",
            "embedding_error_message",
        ]

    def get_status(self, obj):
        return obj.status.upper()

    def get_embedding_status(self, obj):
        return obj.embedding_status.upper()
    
class ImageSerializer(serializers.ModelSerializer):
    asset_id = serializers.UUIDField(source="id", read_only=True)
    asset_url = serializers.SerializerMethodField()
    asset_url_expiry_at = serializers.SerializerMethodField()
    sam_embedding_url = serializers.SerializerMethodField()
    sam_embedding_url_expiry_at = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()
    embedding_status = serializers.SerializerMethodField()

    class Meta:
        model = Asset
        fields = [
            "asset_id",
            "filename",
            "mime_type",
            "asset_url",
            "asset_url_expiry_at",
            "sam_embedding_url",
            "sam_embedding_url_expiry_at",
            "status",
            "embedding_status",
        ]

    def get_asset_url(self, obj):
        if obj.status != Asset.UploadStatus.UPLOADED:
            return None

        return create_presigned_download_url(
            storage_key=obj.storage_key,
            expires_in=settings.ASSET_READ_URL_EXPIRES_IN_SECONDS,
        )

    def get_asset_url_expiry_at(self, obj):
        if obj.status != Asset.UploadStatus.UPLOADED:
            return None

        return self.context["read_url_expiry_at"]

    def get_sam_embedding_url(self, obj):
        if obj.embedding_status != Asset.EmbeddingStatus.UPLOADED:
            return None

        if not obj.embedding_storage_key:
            return None

        return create_presigned_download_url(
            storage_key=obj.embedding_storage_key,
            expires_in=settings.ASSET_READ_URL_EXPIRES_IN_SECONDS,
        )

    def get_sam_embedding_url_expiry_at(self, obj):
        if obj.embedding_status != Asset.EmbeddingStatus.UPLOADED:
            return None

        return self.context["read_url_expiry_at"]

    def get_status(self, obj):
        return obj.status.upper()

    def get_embedding_status(self, obj):
        if obj.embedding_status == Asset.EmbeddingStatus.NOT_REQUESTED:
            return None

        return obj.embedding_status.upper()
    
class UserAssetListQuerySerializer(serializers.Serializer):
    status = serializers.ChoiceField(
        choices=[
            "PENDING",
            "UPLOADED",
            "FAILED",
            "VERIFICATION_FAILED",
        ],
        required=False,
    )

    search = serializers.CharField(
        required=False,
        allow_blank=False,
    )

    def validate_status(self, value):
        return value.lower()


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
    upload_id = serializers.UUIDField()

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
            
        return attrs


class AssetUploadURLCreateSerializer(serializers.Serializer):
    files = S3UploadURLRequestItemSerializer(many=True)

    def validate_files(self, value):
        if not value:
            raise serializers.ValidationError("At least one file is required.")

        upload_ids = [
            str(item["upload_id"])
            for item in value
        ]

        if len(upload_ids) != len(set(upload_ids)):
            raise serializers.ValidationError(
                "Duplicate upload_id values are not allowed."
            )

        if len(value) > 100:
            raise serializers.ValidationError(
                "Maximum 100 files can be requested at once."
            )

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

class AssetBulkStatusUpdateSerializer(serializers.Serializer):
    updates = AssetStatusUpdateItemSerializer(many=True)

    def validate_updates(self, value):
        if not value:
            raise serializers.ValidationError("At least one update is required.")

        upload_targets = [
            (str(item["asset_id"]), item["upload_type"])
            for item in value
        ]

        if len(upload_targets) != len(set(upload_targets)):
            raise serializers.ValidationError(
                "Duplicate asset_id and upload_type combinations are not allowed."
            )

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
    
class AssetCheckDanglingSerializer(serializers.Serializer):
    asset_ids = serializers.ListField(
        child=serializers.UUIDField(),
        required=False,
        allow_empty=False,
    )


class AssetBulkRefreshURLItemSerializer(serializers.Serializer):
    asset_id = serializers.UUIDField()

    upload_type = serializers.ChoiceField(
        choices=[
            "asset",
            "embedding",
        ]
    )


class AssetBulkRefreshURLSerializer(serializers.Serializer):
    items = AssetBulkRefreshURLItemSerializer(many=True)

    def validate_items(self, value):
        if not value:
            raise serializers.ValidationError("At least one item is required.")

        upload_targets = [
            (str(item["asset_id"]), item["upload_type"])
            for item in value
        ]

        if len(upload_targets) != len(set(upload_targets)):
            raise serializers.ValidationError(
                "Duplicate asset_id and upload_type combinations are not allowed."
            )

        if len(value) > 100:
            raise serializers.ValidationError(
                "Maximum 100 upload URLs can be refreshed at once."
            )

        return value
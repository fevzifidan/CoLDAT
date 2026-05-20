import uuid

from django.conf import settings
from django.db import models
from apps.datasets.models import Dataset


class Asset(models.Model):
    class UploadStatus(models.TextChoices):
        PENDING = "pending", "Pending"
        UPLOADED = "uploaded", "Uploaded"
        FAILED = "failed", "Failed"
        VERIFICATION_FAILED = "verification_failed", "Verification Failed"

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
    )

    dataset = models.ForeignKey(
        Dataset,
        on_delete=models.CASCADE,
        related_name="assets",
    )

    storage_key = models.CharField(
        max_length=500,
        help_text="Path/key of the file in object storage such as MinIO or S3.",
    )

    embedding_storage_key = models.CharField(
        max_length=500,
        blank=True,
        help_text="Optional path/key for MobileSAM embedding file.",
    )

    filename = models.CharField(max_length=255)

    mime_type = models.CharField(max_length=100)

    width = models.PositiveIntegerField(null=True, blank=True)

    height = models.PositiveIntegerField(null=True, blank=True)

    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="uploaded_assets",
    )

    status = models.CharField(
        max_length=30,
        choices=UploadStatus.choices,
        default=UploadStatus.UPLOADED,
    )

    content_sha256 = models.CharField(
        max_length=64,
        blank=True,
        help_text="SHA256 hash of the uploaded file content.",
    )

    upload_url_valid_until = models.DateTimeField(
        null=True,
        blank=True,
        help_text="When the presigned upload URL expires.",
    )

    uploaded_at = models.DateTimeField(
        null=True,
        blank=True,
    )

    verified_at = models.DateTimeField(
        null=True,
        blank=True,
    )

    upload_error_message = models.TextField(blank=True)

    is_deleted = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.filename
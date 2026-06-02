from datetime import timedelta
from typing import Optional

from django.conf import settings
from django.db import transaction
from django.utils import timezone
from rest_framework.exceptions import PermissionDenied, ValidationError

from .models import Asset


def create_asset(
    *,
    dataset,
    uploaded_by,
    storage_key: str,
    filename: str,
    mime_type: str,
    width: Optional[int] = None,
    height: Optional[int] = None,
    embedding_storage_key: str = "",
    content_sha256: str = "",
) -> Asset:
    """
    Manual/dev asset creation.

    This creates an asset as already UPLOADED.
    Do not use this for the normal MinIO direct-upload flow.
    Normal flow should use create_pending_asset_upload().
    """
    asset = Asset.objects.create(
        dataset=dataset,
        uploaded_by=uploaded_by,
        storage_key=storage_key,
        filename=filename,
        mime_type=mime_type,
        width=width,
        height=height,
        embedding_storage_key=embedding_storage_key,
        content_sha256=content_sha256,
        status=Asset.UploadStatus.UPLOADED,
        uploaded_at=timezone.now(),
        verified_at=timezone.now(),
    )

    return asset


def create_pending_asset_upload(
    *,
    dataset,
    uploaded_by,
    storage_key: str,
    filename: str,
    mime_type: str,
    content_sha256: str,
    width: Optional[int] = None,
    height: Optional[int] = None,
    embedding_storage_key: str = "",
) -> Asset:
    expires_at = timezone.now() + timedelta(
        seconds=settings.ASSET_UPLOAD_URL_EXPIRES_IN_SECONDS
    )

    asset = Asset.objects.create(
        dataset=dataset,
        uploaded_by=uploaded_by,
        storage_key=storage_key,
        filename=filename,
        mime_type=mime_type,
        width=width,
        height=height,
        embedding_storage_key=embedding_storage_key,
        content_sha256=content_sha256,
        status=Asset.UploadStatus.PENDING,
        upload_url_valid_until=expires_at,
    )

    return asset


@transaction.atomic
def bulk_update_asset_upload_status(*, assets_by_id: dict, items: list):
    updated_assets = []

    for item in items:
        asset_id = str(item["asset_id"])
        upload_type = item["upload_type"]
        success = item["success"]
        error_message = item.get("error_message", "")

        asset = assets_by_id.get(asset_id)

        if asset is None:
            raise PermissionDenied(
                f"Status update rejected for asset {asset_id}."
            )

        if upload_type == "asset":
            if asset.status != Asset.UploadStatus.PENDING:
                raise PermissionDenied(
                    f"Status update rejected for asset {asset_id}: asset is not pending."
                )

            if success:
                asset.status = Asset.UploadStatus.UPLOADED
                asset.uploaded_at = timezone.now()
                asset.verified_at = timezone.now()
                asset.upload_error_message = ""

                asset.save(
                    update_fields=[
                        "status",
                        "uploaded_at",
                        "verified_at",
                        "upload_error_message",
                        "updated_at",
                    ]
                )
            else:
                asset.status = Asset.UploadStatus.FAILED
                asset.upload_error_message = error_message

                asset.save(
                    update_fields=[
                        "status",
                        "upload_error_message",
                        "updated_at",
                    ]
                )

        elif upload_type == "embedding":
            if asset.embedding_status != Asset.EmbeddingStatus.PENDING:
                raise PermissionDenied(
                    f"Status update rejected for asset {asset_id}: embedding is not pending."
                )

            if success:
                asset.embedding_status = Asset.EmbeddingStatus.UPLOADED
                asset.embedding_uploaded_at = timezone.now()
                asset.embedding_verified_at = timezone.now()
                asset.embedding_error_message = ""

                asset.save(
                    update_fields=[
                        "embedding_status",
                        "embedding_uploaded_at",
                        "embedding_verified_at",
                        "embedding_error_message",
                        "updated_at",
                    ]
                )
            else:
                asset.embedding_status = Asset.EmbeddingStatus.FAILED
                asset.embedding_error_message = error_message

                asset.save(
                    update_fields=[
                        "embedding_status",
                        "embedding_error_message",
                        "updated_at",
                    ]
                )

        else:
            raise ValidationError("Invalid upload_type.")

        updated_assets.append(asset)

    return updated_assets


def delete_asset(*, asset: Asset):
    asset.is_deleted = True
    asset.save(update_fields=["is_deleted", "updated_at"])


def retry_asset_upload(
    *,
    asset: Asset,
    storage_key: str,
    content_sha256: str,
) -> Asset:
    allowed_statuses = [
        Asset.UploadStatus.FAILED,
    ]

    if asset.status not in allowed_statuses:
        raise ValidationError(
            "Only failed assets can be retried."
        )

    if not content_sha256:
        raise ValidationError("content_sha256 is required to retry upload.")

    expires_at = timezone.now() + timedelta(
        seconds=settings.ASSET_UPLOAD_URL_EXPIRES_IN_SECONDS
    )

    asset.storage_key = storage_key
    asset.content_sha256 = content_sha256
    asset.status = Asset.UploadStatus.PENDING
    asset.upload_url_valid_until = expires_at
    asset.uploaded_at = None
    asset.verified_at = None
    asset.upload_error_message = ""

    asset.save(
        update_fields=[
            "storage_key",
            "content_sha256",
            "status",
            "upload_url_valid_until",
            "uploaded_at",
            "verified_at",
            "upload_error_message",
            "updated_at",
        ]
    )

    return asset


def create_pending_embedding_upload(
    *,
    asset: Asset,
    storage_key: str,
    embedding_sha256: str,
) -> Asset:
    if asset.status != Asset.UploadStatus.UPLOADED:
        raise ValidationError(
            "Asset image must be uploaded before uploading embedding."
        )

    expires_at = timezone.now() + timedelta(
        seconds=settings.ASSET_UPLOAD_URL_EXPIRES_IN_SECONDS
    )

    asset.embedding_storage_key = storage_key
    asset.embedding_sha256 = embedding_sha256
    asset.embedding_status = Asset.EmbeddingStatus.PENDING
    asset.embedding_upload_url_valid_until = expires_at
    asset.embedding_uploaded_at = None
    asset.embedding_verified_at = None
    asset.embedding_error_message = ""

    asset.save(
        update_fields=[
            "embedding_storage_key",
            "embedding_sha256",
            "embedding_status",
            "embedding_upload_url_valid_until",
            "embedding_uploaded_at",
            "embedding_verified_at",
            "embedding_error_message",
            "updated_at",
        ]
    )

    return asset
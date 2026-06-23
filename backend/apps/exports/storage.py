import uuid

from django.conf import settings
from django.utils.text import slugify

from apps.assets.storage import (
    create_presigned_download_url,
    ensure_bucket_exists,
    get_internal_minio_client,
)


def upload_export_archive(
    *,
    archive,
    dataset_id,
    version_tag: str,
    export_format: str,
) -> str:
    ensure_bucket_exists()

    safe_version = slugify(version_tag) or "version"
    storage_key = (
        f"datasets/{dataset_id}/exports/{safe_version}/"
        f"{export_format}-{uuid.uuid4()}.zip"
    )

    archive.seek(0)
    get_internal_minio_client().upload_fileobj(
        archive,
        settings.MINIO_BUCKET_NAME,
        storage_key,
        ExtraArgs={
            "ContentType": "application/zip",
            "ContentDisposition": (
                f'attachment; filename="{export_format}-{safe_version}.zip"'
            ),
        },
    )

    return create_presigned_download_url(
        storage_key=storage_key,
        expires_in=settings.EXPORT_DOWNLOAD_URL_EXPIRES_IN_SECONDS,
    )

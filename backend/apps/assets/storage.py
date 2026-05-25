import base64
import uuid

import boto3
from botocore.client import Config
from botocore.exceptions import ClientError
from django.conf import settings


def _create_s3_client(*, endpoint_url: str):
    return boto3.client(
        "s3",
        endpoint_url=endpoint_url,
        aws_access_key_id=settings.MINIO_ACCESS_KEY,
        aws_secret_access_key=settings.MINIO_SECRET_KEY,
        region_name=settings.MINIO_REGION,
        config=Config(
            signature_version="s3v4",
            s3={"addressing_style": "path"},
        ),
    )


def get_internal_minio_client():
    """
    Used by Django when it actively connects to MinIO from inside Docker.
    """
    return _create_s3_client(
        endpoint_url=settings.MINIO_INTERNAL_ENDPOINT,
    )


def get_public_minio_client():
    """
    Used to generate presigned URLs returned to the browser/client.
    The browser needs localhost, not Docker's internal hostname.
    """
    return _create_s3_client(
        endpoint_url=settings.MINIO_ENDPOINT,
    )


def hex_sha256_to_base64(*, hex_digest: str) -> str:
    """
    The API stores SHA256 as a hexadecimal string.
    S3/MinIO checksum headers use the digest encoded as Base64.
    """
    digest_bytes = bytes.fromhex(hex_digest)
    return base64.b64encode(digest_bytes).decode("ascii")


def ensure_bucket_exists():
    """
    The minio-setup service already creates this bucket.
    This remains as a development safety check.
    """
    client = get_internal_minio_client()
    bucket_name = settings.MINIO_BUCKET_NAME

    try:
        client.head_bucket(Bucket=bucket_name)
    except ClientError as exc:
        error_code = exc.response.get("Error", {}).get("Code", "")

        if error_code in {"404", "NoSuchBucket", "NotFound"}:
            client.create_bucket(Bucket=bucket_name)
        else:
            raise


def generate_asset_storage_key(*, dataset_id, filename: str) -> str:
    extension = ""

    if "." in filename:
        extension = "." + filename.rsplit(".", 1)[-1].lower()

    return f"datasets/{dataset_id}/assets/{uuid.uuid4()}{extension}"


def generate_embedding_storage_key(*, asset_id, filename: str) -> str:
    extension = ""

    if "." in filename:
        extension = "." + filename.rsplit(".", 1)[-1].lower()

    return f"assets/{asset_id}/embeddings/{uuid.uuid4()}{extension}"


def create_presigned_upload_url(
    *,
    storage_key: str,
    mime_type: str,
    file_sha256: str,
    expires_in: int,
) -> dict:
    """
    Generate a browser-usable presigned MinIO/S3 PUT URL and return
    the exact headers that must be sent with the file upload.
    """
    ensure_bucket_exists()

    checksum_base64 = hex_sha256_to_base64(
        hex_digest=file_sha256,
    )

    client = get_public_minio_client()

    upload_url = client.generate_presigned_url(
        ClientMethod="put_object",
        Params={
            "Bucket": settings.MINIO_BUCKET_NAME,
            "Key": storage_key,
            "ContentType": mime_type,
            "ChecksumSHA256": checksum_base64,
        },
        ExpiresIn=expires_in,
    )

    return {
        "upload_url": upload_url,
        "headers": {
            "Content-Type": mime_type,
            "x-amz-checksum-sha256": checksum_base64,
        },
    }

def create_presigned_download_url(
    *,
    storage_key: str,
    expires_in: int,
) -> str:
    client = get_public_minio_client()

    return client.generate_presigned_url(
        ClientMethod="get_object",
        Params={
            "Bucket": settings.MINIO_BUCKET_NAME,
            "Key": storage_key,
        },
        ExpiresIn=expires_in,
    )
import uuid
from urllib.parse import urlparse, urlunparse

import boto3
from botocore.client import Config
from django.conf import settings


def get_minio_client():
    return boto3.client(
        "s3",
        endpoint_url=settings.MINIO_INTERNAL_ENDPOINT,
        aws_access_key_id=settings.MINIO_ACCESS_KEY,
        aws_secret_access_key=settings.MINIO_SECRET_KEY,
        region_name=settings.MINIO_REGION,
        config=Config(signature_version="s3v4"),
    )


def ensure_bucket_exists():
    client = get_minio_client()
    bucket_name = settings.MINIO_BUCKET_NAME

    response = client.list_buckets()
    bucket_names = [bucket["Name"] for bucket in response.get("Buckets", [])]

    if bucket_name not in bucket_names:
        client.create_bucket(Bucket=bucket_name)


def generate_asset_storage_key(*, dataset_id, filename: str) -> str:
    extension = ""

    if "." in filename:
        extension = "." + filename.split(".")[-1].lower()

    return f"datasets/{dataset_id}/assets/{uuid.uuid4()}{extension}"

def generate_embedding_storage_key(*, asset_id, filename: str) -> str:
    extension = ""

    if "." in filename:
        extension = "." + filename.split(".")[-1].lower()

    return f"assets/{asset_id}/embeddings/{uuid.uuid4()}{extension}"


def convert_internal_url_to_public(url: str) -> str:
    internal = urlparse(settings.MINIO_INTERNAL_ENDPOINT)
    public = urlparse(settings.MINIO_ENDPOINT)
    parsed_url = urlparse(url)

    if parsed_url.netloc == internal.netloc:
        parsed_url = parsed_url._replace(
            scheme=public.scheme,
            netloc=public.netloc,
        )

    return urlunparse(parsed_url)


def create_presigned_upload_url(
    *,
    storage_key: str,
    mime_type: str,
    content_sha256: str,
    expires_in: int,
) -> str:
    ensure_bucket_exists()

    client = get_minio_client()

    upload_url = client.generate_presigned_url(
        ClientMethod="put_object",
        Params={
            "Bucket": settings.MINIO_BUCKET_NAME,
            "Key": storage_key,
            "ContentType": mime_type,
            "ChecksumSHA256": content_sha256,
        },
        ExpiresIn=expires_in,
    )

    return convert_internal_url_to_public(upload_url)
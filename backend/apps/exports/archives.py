import json
from pathlib import PurePosixPath
from tempfile import SpooledTemporaryFile
from zipfile import ZIP_DEFLATED, ZipFile

from django.conf import settings

from apps.assets.storage import get_internal_minio_client


def _safe_archive_name(*, filename: str, fallback: str) -> str:
    archive_name = PurePosixPath((filename or "").replace("\\", "/")).name
    return archive_name or fallback


def _write_export_images(*, zip_file: ZipFile, snapshot: dict | None):
    if not snapshot:
        return

    assets = snapshot.get("assets", [])
    if not assets:
        return

    client = get_internal_minio_client()
    used_names = set()

    for asset in assets:
        storage_key = asset.get("storage_key")
        if not storage_key:
            continue

        image_name = _safe_archive_name(
            filename=asset.get("filename", ""),
            fallback=f"{asset.get('asset_id', 'image')}",
        )
        if image_name in used_names:
            image_name = f"{asset.get('asset_id', 'image')}-{image_name}"
        used_names.add(image_name)

        response = client.get_object(
            Bucket=settings.MINIO_BUCKET_NAME,
            Key=storage_key,
        )
        body = response["Body"]
        try:
            with zip_file.open(f"images/{image_name}", mode="w") as image_file:
                for chunk in body.iter_chunks(chunk_size=1024 * 1024):
                    if chunk:
                        image_file.write(chunk)
        finally:
            body.close()


def build_export_archive(
    *,
    export_data: dict,
    export_format: str,
    snapshot: dict | None = None,
):
    archive = SpooledTemporaryFile(max_size=8 * 1024 * 1024, mode="w+b")

    with ZipFile(archive, mode="w", compression=ZIP_DEFLATED) as zip_file:
        if export_format == "coco":
            zip_file.writestr(
                "annotations/instances.json",
                json.dumps(export_data, ensure_ascii=False, indent=2),
            )
        elif export_format == "visual_genome":
            zip_file.writestr(
                "visual_genome.json",
                json.dumps(export_data, ensure_ascii=False, indent=2),
            )
        elif export_format == "yolo":
            class_names = [item["name"] for item in export_data["classes"]]
            zip_file.writestr("classes.txt", "\n".join(class_names))

            used_names = set()
            for label_file in export_data["files"]:
                label_name = PurePosixPath(
                    label_file["label_filename"].replace("\\", "/")
                ).name
                if label_name in used_names:
                    label_name = f"{label_file['image_id']}-{label_name}"
                used_names.add(label_name)

                zip_file.writestr(
                    f"labels/{label_name}",
                    label_file["content"],
                )
        else:
            raise ValueError("Unsupported export format.")

        _write_export_images(zip_file=zip_file, snapshot=snapshot)

    archive.seek(0)
    return archive

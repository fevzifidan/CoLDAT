import json
from pathlib import PurePosixPath
from tempfile import SpooledTemporaryFile
from zipfile import ZIP_DEFLATED, ZipFile


def build_export_archive(*, export_data: dict, export_format: str):
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

    archive.seek(0)
    return archive

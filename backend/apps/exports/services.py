from .converters import (
    bbox_area,
    bbox_to_yolo,
    keypoints_to_bbox,
    object_to_bbox,
    object_to_coco_area,
    object_to_coco_segmentation,
    polygon_to_bbox,
    snapshot_object_to_coco_area,
)
from .selectors import (
    get_export_annotation_objects,
    get_export_classes,
    get_export_images,
    get_export_relationships,
)


def build_coco_export(*, dataset):
    images = list(get_export_images(dataset=dataset))
    classes = list(get_export_classes(project=dataset.project))
    objects = list(get_export_annotation_objects(images=images))

    image_to_export_id = {
        str(image.id): index + 1
        for index, image in enumerate(images)
    }

    # COCO category IDs usually start from 1.
    class_to_category_id = {
        str(project_class.id): index + 1
        for index, project_class in enumerate(classes)
    }

    annotations = []

    for annotation_index, annotation_object in enumerate(objects, start=1):
        class_id = str(annotation_object.annotation_class_id)

        if class_id not in class_to_category_id:
            continue

        image = annotation_object.image
        bbox = object_to_bbox(annotation_object=annotation_object)

        annotations.append(
            {
                "id": annotation_index,
                "image_id": image_to_export_id[str(image.id)],
                "category_id": class_to_category_id[class_id],
                "bbox": bbox,
                "segmentation": object_to_coco_segmentation(
                    annotation_object=annotation_object,
                ),
                "area": object_to_coco_area(
                    annotation_object=annotation_object,
                ),
                "iscrowd": 0,
            }
        )

    return {
        "format": "coco",
        "info": {
            "description": f"CoLDAT COCO export for dataset {dataset.name}",
        },
        "images": [
            {
                "id": image_to_export_id[str(image.id)],
                "file_name": image.filename,
                "width": image.width,
                "height": image.height,
            }
            for image in images
        ],
        "categories": [
            {
                "id": class_to_category_id[str(project_class.id)],
                "name": project_class.name,
                "original_index": project_class.index,
            }
            for project_class in classes
        ],
        "annotations": annotations,
    }


def build_yolo_export(*, dataset):
    images = list(get_export_images(dataset=dataset))
    classes = list(get_export_classes(project=dataset.project))
    objects = list(get_export_annotation_objects(images=images))

    # YOLO indexes must start from 0 and have no gaps.
    class_id_to_yolo_index = {
        str(project_class.id): export_index
        for export_index, project_class in enumerate(classes)
    }

    image_id_to_lines = {
        str(image.id): []
        for image in images
    }

    for annotation_object in objects:
        image = annotation_object.image

        if not image.width or not image.height:
            continue

        class_id = str(annotation_object.annotation_class_id)

        if class_id not in class_id_to_yolo_index:
            continue

        bbox = object_to_bbox(annotation_object=annotation_object)

        yolo_bbox = bbox_to_yolo(
            bbox=bbox,
            image_width=image.width,
            image_height=image.height,
        )

        class_index = class_id_to_yolo_index[class_id]

        line = " ".join(
            [
                str(class_index),
                *[str(round(value, 6)) for value in yolo_bbox],
            ]
        )

        image_id_to_lines[str(image.id)].append(line)

    return {
        "format": "yolo",
        "classes": [
            {
                "id": str(project_class.id),
                "name": project_class.name,
                "original_index": project_class.index,
                "export_index": class_id_to_yolo_index[str(project_class.id)],
            }
            for project_class in classes
        ],
        "files": [
            {
                "image_id": str(image.id),
                "image_filename": image.filename,
                "label_filename": image.filename.rsplit(".", 1)[0] + ".txt",
                "content": "\n".join(image_id_to_lines[str(image.id)]),
            }
            for image in images
        ],
    }


def build_visual_genome_export(*, dataset):
    images = list(get_export_images(dataset=dataset))
    objects = list(get_export_annotation_objects(images=images))
    relationships = list(get_export_relationships(images=images))

    objects_by_image_id = {}

    for annotation_object in objects:
        image_id = str(annotation_object.image_id)
        bbox = object_to_bbox(annotation_object=annotation_object)

        objects_by_image_id.setdefault(image_id, []).append(
            {
                "object_id": str(annotation_object.id),
                "names": [
                    annotation_object.annotation_class.name,
                ],
                "x": bbox[0],
                "y": bbox[1],
                "w": bbox[2],
                "h": bbox[3],
            }
        )

    relationships_by_image_id = {}

    for relationship in relationships:
        image_id = str(relationship.image_id)

        relationships_by_image_id.setdefault(image_id, []).append(
            {
                "relationship_id": str(relationship.id),
                "subject_id": str(relationship.subject_id),
                "object_id": str(relationship.object_id),
                "predicate": relationship.predicate.name,
            }
        )

    return {
        "format": "visual_genome",
        "images": [
            {
                "image_id": str(image.id),
                "filename": image.filename,
                "width": image.width,
                "height": image.height,
                "objects": objects_by_image_id.get(str(image.id), []),
                "relationships": relationships_by_image_id.get(str(image.id), []),
            }
            for image in images
        ],
    }


def build_dataset_export(*, dataset, export_format: str):
    if export_format == "coco":
        return build_coco_export(dataset=dataset)

    if export_format == "yolo":
        return build_yolo_export(dataset=dataset)

    if export_format == "visual_genome":
        return build_visual_genome_export(dataset=dataset)

    raise ValueError("Unsupported export format.")

def snapshot_object_to_bbox(*, snapshot_object):
    geometry_type = snapshot_object.get("type")
    coordinates = snapshot_object.get("coordinates", [])

    if geometry_type == "bbox":
        return coordinates

    if geometry_type == "polygon":
        return polygon_to_bbox(coordinates=coordinates)

    if geometry_type == "keypoint":
        return keypoints_to_bbox(coordinates=coordinates)

    return [0, 0, 0, 0]


def snapshot_object_to_coco_segmentation(*, snapshot_object):
    if snapshot_object.get("type") == "polygon":
        return [snapshot_object.get("coordinates", [])]

    return []


def get_export_snapshot_classes(*, snapshot):
    return [
        item
        for item in snapshot.get("taxonomy", {}).get("classes", [])
        if item.get("include_in_export", True)
    ]


def build_coco_export_from_snapshot(*, snapshot):
    assets = snapshot.get("assets", [])
    classes = get_export_snapshot_classes(snapshot=snapshot)

    image_to_export_id = {
        str(asset["asset_id"]): index + 1
        for index, asset in enumerate(assets)
    }

    class_to_category_id = {
        str(project_class["id"]): index + 1
        for index, project_class in enumerate(classes)
    }

    annotations = []
    annotation_index = 1

    for asset in assets:
        image_id = str(asset["asset_id"])

        for obj in asset.get("objects", []):
            class_id = str(obj["class_id"])

            if class_id not in class_to_category_id:
                continue

            bbox = snapshot_object_to_bbox(snapshot_object=obj)

            annotations.append(
                {
                    "id": annotation_index,
                    "image_id": image_to_export_id[image_id],
                    "category_id": class_to_category_id[class_id],
                    "bbox": bbox,
                    "segmentation": snapshot_object_to_coco_segmentation(
                        snapshot_object=obj,
                    ),
                    "area": snapshot_object_to_coco_area(
                        snapshot_object=obj,
                    ),
                    "iscrowd": 0,
                }
            )

            annotation_index += 1

    return {
        "format": "coco",
        "info": {
            "description": (
                "CoLDAT COCO export for dataset "
                f"{snapshot.get('dataset', {}).get('name', '')}"
            ),
        },
        "images": [
            {
                "id": image_to_export_id[str(asset["asset_id"])],
                "file_name": asset["filename"],
                "width": asset["width"],
                "height": asset["height"],
            }
            for asset in assets
        ],
        "categories": [
            {
                "id": class_to_category_id[str(project_class["id"])],
                "name": project_class["name"],
                "original_index": project_class["index"],
            }
            for project_class in classes
        ],
        "annotations": annotations,
    }


def build_yolo_export_from_snapshot(*, snapshot):
    assets = snapshot.get("assets", [])
    classes = get_export_snapshot_classes(snapshot=snapshot)

    class_id_to_yolo_index = {
        str(project_class["id"]): export_index
        for export_index, project_class in enumerate(classes)
    }

    files = []

    for asset in assets:
        image_id = str(asset["asset_id"])
        image_width = asset.get("width")
        image_height = asset.get("height")

        lines = []

        if image_width and image_height:
            for obj in asset.get("objects", []):
                class_id = str(obj["class_id"])

                if class_id not in class_id_to_yolo_index:
                    continue

                bbox = snapshot_object_to_bbox(snapshot_object=obj)

                yolo_bbox = bbox_to_yolo(
                    bbox=bbox,
                    image_width=image_width,
                    image_height=image_height,
                )

                class_index = class_id_to_yolo_index[class_id]

                lines.append(
                    " ".join(
                        [
                            str(class_index),
                            *[str(round(value, 6)) for value in yolo_bbox],
                        ]
                    )
                )

        files.append(
            {
                "image_id": image_id,
                "image_filename": asset["filename"],
                "label_filename": asset["filename"].rsplit(".", 1)[0] + ".txt",
                "content": "\n".join(lines),
            }
        )

    return {
        "format": "yolo",
        "classes": [
            {
                "id": str(project_class["id"]),
                "name": project_class["name"],
                "original_index": project_class["index"],
                "export_index": class_id_to_yolo_index[str(project_class["id"])],
            }
            for project_class in classes
        ],
        "files": files,
    }


def build_visual_genome_export_from_snapshot(*, snapshot):
    assets = snapshot.get("assets", [])

    return {
        "format": "visual_genome",
        "images": [
            {
                "image_id": str(asset["asset_id"]),
                "filename": asset["filename"],
                "width": asset["width"],
                "height": asset["height"],
                "objects": [
                    {
                        "object_id": str(obj["id"]),
                        "names": [
                            obj["class_name"],
                        ],
                        "x": snapshot_object_to_bbox(snapshot_object=obj)[0],
                        "y": snapshot_object_to_bbox(snapshot_object=obj)[1],
                        "w": snapshot_object_to_bbox(snapshot_object=obj)[2],
                        "h": snapshot_object_to_bbox(snapshot_object=obj)[3],
                    }
                    for obj in asset.get("objects", [])
                ],
                "relationships": [
                    {
                        "relationship_id": str(rel["id"]),
                        "subject_id": str(rel["subject_id"]),
                        "object_id": str(rel["object_id"]),
                        "predicate": rel["predicate"],
                    }
                    for rel in asset.get("relationships", [])
                ],
            }
            for asset in assets
        ],
    }


def build_dataset_export_from_snapshot(*, snapshot, export_format: str):
    if export_format == "coco":
        return build_coco_export_from_snapshot(snapshot=snapshot)

    if export_format == "yolo":
        return build_yolo_export_from_snapshot(snapshot=snapshot)

    if export_format == "visual_genome":
        return build_visual_genome_export_from_snapshot(snapshot=snapshot)

    raise ValueError("Unsupported export format.")
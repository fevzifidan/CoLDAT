from django.db import transaction
from rest_framework.exceptions import ValidationError

from apps.taxonomy.models import ProjectClass, ProjectPredicate

from .models import AnnotationObject, SceneGraphRelationship


def validate_coordinates(*, geometry_type: str, coordinates: list):
    if geometry_type == AnnotationObject.GeometryType.BBOX:
        if len(coordinates) != 4:
            raise ValidationError("bbox coordinates must be [x, y, w, h].")

    elif geometry_type == AnnotationObject.GeometryType.POLYGON:
        if len(coordinates) < 6 or len(coordinates) % 2 != 0:
            raise ValidationError("polygon coordinates must contain even x/y pairs.")

    elif geometry_type == AnnotationObject.GeometryType.KEYPOINT:
        if len(coordinates) < 2 or len(coordinates) % 2 != 0:
            raise ValidationError("keypoint coordinates must contain x/y pairs.")

    else:
        raise ValidationError("Invalid annotation geometry type.")


@transaction.atomic
def replace_image_annotations(*, image, data: dict, user):
    objects_data = data.get("objects", [])
    relationships_data = data.get("relationships", [])

    project = image.dataset.project

    object_ids = [obj["id"] for obj in objects_data]

    if len(object_ids) != len(set(object_ids)):
        raise ValidationError("Duplicate annotation object ids are not allowed.")

    AnnotationObject.objects.filter(image=image).delete()

    created_objects_by_id = {}

    for obj_data in objects_data:
        class_id = obj_data.get("class_id")
        geometry_type = obj_data["type"]
        coordinates = obj_data["coordinates"]

        validate_coordinates(
            geometry_type=geometry_type,
            coordinates=coordinates,
        )

        if class_id is not None:
            annotation_class = ProjectClass.objects.filter(
                id=class_id,
                project=project,
                is_active=True,
            ).first()
        else:
            annotation_class = ProjectClass.objects.filter(
                project=project,
                is_active=True,
            ).order_by("index").first()

        if annotation_class is None:
            raise ValidationError(
                f"Class {class_id} does not exist in this project or is inactive."
            )

        annotation_object = AnnotationObject.objects.create(
            id=obj_data["id"],
            image=image,
            annotation_class=annotation_class,
            geometry_type=geometry_type,
            coordinates=coordinates,
            created_by=user,
            updated_by=user,
        )

        created_objects_by_id[str(annotation_object.id)] = annotation_object

    for rel_data in relationships_data:
        subject_id = str(rel_data["subject_id"])
        object_id = str(rel_data["object_id"])
        predicate_name = rel_data["predicate"]

        subject = created_objects_by_id.get(subject_id)
        target_object = created_objects_by_id.get(object_id)

        if subject is None:
            raise ValidationError(f"Relationship subject_id {subject_id} does not exist.")

        if target_object is None:
            raise ValidationError(f"Relationship object_id {object_id} does not exist.")

        predicate = ProjectPredicate.objects.filter(
            project=project,
            name=predicate_name,
            is_active=True,
        ).first()

        if predicate is None:
            raise ValidationError(
                f"Predicate '{predicate_name}' does not exist in this project or is inactive."
            )

        SceneGraphRelationship.objects.create(
            image=image,
            subject=subject,
            object=target_object,
            predicate=predicate,
            created_by=user,
        )

    return image


@transaction.atomic
def clear_image_annotations(*, image):
    AnnotationObject.objects.filter(image=image).delete()
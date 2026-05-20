from rest_framework.exceptions import ValidationError

from .models import ProjectAttribute, ProjectClass, ProjectPredicate


def create_project_class(*, project, data: dict) -> ProjectClass:
    if ProjectClass.objects.filter(project=project, name=data["name"]).exists():
        raise ValidationError("A class with this name already exists in this project.")

    if ProjectClass.objects.filter(project=project, index=data["index"]).exists():
        raise ValidationError("A class with this index already exists in this project.")

    return ProjectClass.objects.create(
        project=project,
        name=data["name"],
        color=data.get("color", ""),
        index=data["index"],
        is_active=data.get("is_active", True),
        include_in_export=data.get("include_in_export", True),
    )


def update_project_class(*, project_class: ProjectClass, data: dict) -> ProjectClass:
    if "name" in data:
        exists = ProjectClass.objects.filter(
            project=project_class.project,
            name=data["name"],
        ).exclude(id=project_class.id).exists()

        if exists:
            raise ValidationError("A class with this name already exists in this project.")

    if "index" in data:
        exists = ProjectClass.objects.filter(
            project=project_class.project,
            index=data["index"],
        ).exclude(id=project_class.id).exists()

        if exists:
            raise ValidationError("A class with this index already exists in this project.")

    allowed_fields = [
        "name",
        "color",
        "index",
        "is_active",
        "include_in_export",
    ]

    for field in allowed_fields:
        if field in data:
            setattr(project_class, field, data[field])

    project_class.save(update_fields=allowed_fields + ["updated_at"])
    return project_class


def delete_project_class(*, project_class: ProjectClass):
    project_class.delete()


def create_project_predicate(*, project, data: dict) -> ProjectPredicate:
    if ProjectPredicate.objects.filter(project=project, name=data["name"]).exists():
        raise ValidationError("A predicate with this name already exists in this project.")

    return ProjectPredicate.objects.create(
        project=project,
        name=data["name"],
        is_active=data.get("is_active", True),
        include_in_export=data.get("include_in_export", True),
    )


def update_project_predicate(
    *,
    predicate: ProjectPredicate,
    data: dict,
) -> ProjectPredicate:
    if "name" in data:
        exists = ProjectPredicate.objects.filter(
            project=predicate.project,
            name=data["name"],
        ).exclude(id=predicate.id).exists()

        if exists:
            raise ValidationError("A predicate with this name already exists in this project.")

    allowed_fields = [
        "name",
        "is_active",
        "include_in_export",
    ]

    for field in allowed_fields:
        if field in data:
            setattr(predicate, field, data[field])

    predicate.save(update_fields=allowed_fields + ["updated_at"])
    return predicate


def delete_project_predicate(*, predicate: ProjectPredicate):
    predicate.delete()


def create_project_attribute(*, project, data: dict) -> ProjectAttribute:
    if ProjectAttribute.objects.filter(project=project, name=data["name"]).exists():
        raise ValidationError("An attribute with this name already exists in this project.")

    return ProjectAttribute.objects.create(
        project=project,
        name=data["name"],
        attribute_type=data["attribute_type"],
        options=data.get("options", []),
        is_active=data.get("is_active", True),
        include_in_export=data.get("include_in_export", True),
    )


def update_project_attribute(
    *,
    attribute: ProjectAttribute,
    data: dict,
) -> ProjectAttribute:
    if "name" in data:
        exists = ProjectAttribute.objects.filter(
            project=attribute.project,
            name=data["name"],
        ).exclude(id=attribute.id).exists()

        if exists:
            raise ValidationError("An attribute with this name already exists in this project.")

    allowed_fields = [
        "name",
        "attribute_type",
        "options",
        "is_active",
        "include_in_export",
    ]

    for field in allowed_fields:
        if field in data:
            setattr(attribute, field, data[field])

    attribute.save(update_fields=allowed_fields + ["updated_at"])
    return attribute


def delete_project_attribute(*, attribute: ProjectAttribute):
    attribute.delete()

def bulk_upsert_project_classes(*, project, items: list):
    updated_items = []

    for item in items:
        item_id = item.get("id")

        if item_id:
            project_class = ProjectClass.objects.get(
                id=item_id,
                project=project,
            )
            project_class = update_project_class(
                project_class=project_class,
                data=item,
            )
        else:
            if "index" not in item:
                raise ValidationError("index is required when creating a new class.")

            project_class = create_project_class(
                project=project,
                data=item,
            )

        updated_items.append(project_class)

    return updated_items


def bulk_upsert_project_predicates(*, project, items: list):
    updated_items = []

    for item in items:
        item_id = item.get("id")

        if item_id:
            predicate = ProjectPredicate.objects.get(
                id=item_id,
                project=project,
            )
            predicate = update_project_predicate(
                predicate=predicate,
                data=item,
            )
        else:
            predicate = create_project_predicate(
                project=project,
                data=item,
            )

        updated_items.append(predicate)

    return updated_items


def bulk_upsert_project_attributes(*, project, items: list):
    updated_items = []

    for item in items:
        item_id = item.get("id")

        if item_id:
            attribute = ProjectAttribute.objects.get(
                id=item_id,
                project=project,
            )
            attribute = update_project_attribute(
                attribute=attribute,
                data=item,
            )
        else:
            if "attribute_type" not in item:
                item["attribute_type"] = ProjectAttribute.AttributeType.TEXT

            attribute = create_project_attribute(
                project=project,
                data=item,
            )

        updated_items.append(attribute)

    return updated_items


def bulk_update_project_taxonomy(*, project, data: dict):
    classes = bulk_upsert_project_classes(
        project=project,
        items=data.get("classes", []),
    )

    predicates = bulk_upsert_project_predicates(
        project=project,
        items=data.get("predicates", []),
    )

    attributes = bulk_upsert_project_attributes(
        project=project,
        items=data.get("attributes", []),
    )

    return classes, predicates, attributes
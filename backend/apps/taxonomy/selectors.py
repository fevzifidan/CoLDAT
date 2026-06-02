from django.shortcuts import get_object_or_404

from apps.projects.selectors import get_project_for_user

from .models import ProjectAttribute, ProjectClass, ProjectPredicate


def get_project_taxonomy_for_user(*, project_id, user, status="all"):
    project = get_project_for_user(
        project_id=project_id,
        user=user,
    )

    classes = ProjectClass.objects.filter(project=project)
    predicates = ProjectPredicate.objects.filter(project=project)
    attributes = ProjectAttribute.objects.filter(project=project)

    if status == "active":
        classes = classes.filter(is_active=True)
        predicates = predicates.filter(is_active=True)
        attributes = attributes.filter(is_active=True)

    elif status == "inactive":
        classes = classes.filter(is_active=False)
        predicates = predicates.filter(is_active=False)
        attributes = attributes.filter(is_active=False)

    return project, classes, predicates, attributes


def get_project_classes_for_user(*, project_id, user):
    project = get_project_for_user(
        project_id=project_id,
        user=user,
    )

    return project, ProjectClass.objects.filter(project=project)


def get_project_predicates_for_user(*, project_id, user):
    project = get_project_for_user(
        project_id=project_id,
        user=user,
    )

    return project, ProjectPredicate.objects.filter(project=project)


def get_project_attributes_for_user(*, project_id, user):
    project = get_project_for_user(
        project_id=project_id,
        user=user,
    )

    return project, ProjectAttribute.objects.filter(project=project)


def get_project_class_for_user(*, class_id, user):
    return get_object_or_404(
        ProjectClass,
        id=class_id,
        project__memberships__user=user,
    )


def get_project_predicate_for_user(*, predicate_id, user):
    return get_object_or_404(
        ProjectPredicate,
        id=predicate_id,
        project__memberships__user=user,
    )


def get_project_attribute_for_user(*, attribute_id, user):
    return get_object_or_404(
        ProjectAttribute,
        id=attribute_id,
        project__memberships__user=user,
    )
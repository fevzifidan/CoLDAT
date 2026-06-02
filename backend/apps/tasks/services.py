from typing import Iterable, Optional

from django.contrib.auth import get_user_model
from rest_framework.exceptions import ValidationError

from apps.annotations.models import AnnotationObject
from apps.projects.models import ProjectMembership
from apps.assets.models import Asset
from apps.datasets.models import Dataset
from apps.datasets.models import DatasetMember

from .models import Task, TaskImage


User = get_user_model()


def create_task(
    *,
    dataset: Dataset,
    created_by,
    assignee_id,
    image_ids: Iterable,
    note: str = "",
) -> Task:
    assignee = User.objects.get(id=assignee_id)

    dataset_membership = DatasetMember.objects.filter(
        dataset=dataset,
        user=assignee,
    ).first()

    if dataset_membership is None:
        raise ValidationError("Assignee must be a dataset member.")

    if dataset_membership.role not in [
        DatasetMember.Role.ANNOTATOR,
        DatasetMember.Role.REVIEWER,
        DatasetMember.Role.ADMIN,
    ]:
        raise ValidationError("Assignee does not have a valid dataset role.")

    unique_image_ids = list(set(image_ids))

    if not unique_image_ids:
        raise ValidationError("At least one image_id is required.")

    images = Asset.objects.filter(
        id__in=unique_image_ids,
        dataset=dataset,
        is_deleted=False,
        status=Asset.UploadStatus.UPLOADED,
    )

    if images.count() != len(unique_image_ids):
        raise ValidationError(
            "One or more images do not exist, do not belong to this dataset, or are not uploaded."
        )

    task = Task.objects.create(
        dataset=dataset,
        assignee=assignee,
        created_by=created_by,
        note=note,
        status=Task.Status.ASSIGNED,
    )

    TaskImage.objects.bulk_create(
        [
            TaskImage(task=task, image=image)
            for image in images
        ]
    )

    return task

def add_images_to_task(
    *,
    task: Task,
    image_ids: Iterable,
) -> list[TaskImage]:
    unique_image_ids = list(set(image_ids))

    if not unique_image_ids:
        raise ValidationError("At least one image_id is required.")

    images = Asset.objects.filter(
        id__in=unique_image_ids,
        dataset=task.dataset,
        is_deleted=False,
        status=Asset.UploadStatus.UPLOADED,
    )

    if images.count() != len(unique_image_ids):
        raise ValidationError(
            "One or more images do not exist, do not belong to this task's dataset, or are not uploaded."
        )

    existing_image_ids = set(
        TaskImage.objects.filter(
            task=task,
            image_id__in=unique_image_ids,
        ).values_list("image_id", flat=True)
    )

    new_links = [
        TaskImage(task=task, image=image)
        for image in images
        if image.id not in existing_image_ids
    ]

    created_links = TaskImage.objects.bulk_create(new_links)

    return created_links


def user_can_manage_task(*, task: Task, user) -> bool:
    return task.dataset.project.memberships.filter(
        user=user,
        role__in=[
            ProjectMembership.Role.ADMIN,
            ProjectMembership.Role.REVIEWER,
        ],
    ).exists()


def task_has_images(*, task: Task) -> bool:
    return task.task_images.exists()


def task_images_are_uploaded(*, task: Task) -> bool:
    return not task.task_images.exclude(
        image__status=Asset.UploadStatus.UPLOADED,
    ).exists()


def task_has_annotations(*, task: Task) -> bool:
    image_ids = task.task_images.values_list("image_id", flat=True)

    return AnnotationObject.objects.filter(
        image_id__in=image_ids,
    ).exists()


def update_task_status(
    *,
    task: Task,
    user,
    status: str,
    note: str = None,
) -> Task:
    current_status = task.status
    new_status = status

    is_assignee = task.assignee_id == user.id
    is_manager = user_can_manage_task(task=task, user=user)

    if not task_has_images(task=task):
        raise ValidationError("Task must have at least one image.")

    if not task_images_are_uploaded(task=task):
        raise ValidationError("All task images must be uploaded before status can change.")

    # Assignee flow
    if is_assignee:
        allowed_assignee_transitions = {
            Task.Status.ASSIGNED: [Task.Status.IN_PROGRESS],
            Task.Status.IN_PROGRESS: [Task.Status.APPROVAL_PENDING],
            Task.Status.REJECTED: [Task.Status.IN_PROGRESS],
        }

        allowed_next_statuses = allowed_assignee_transitions.get(current_status, [])

        if new_status not in allowed_next_statuses:
            raise ValidationError(
                f"Assignee cannot change task status from {current_status} to {new_status}."
            )

    # Reviewer/Admin flow
    elif is_manager:
        allowed_manager_transitions = {
            Task.Status.APPROVAL_PENDING: [
                Task.Status.COMPLETED,
                Task.Status.REJECTED,
            ],
            Task.Status.REJECTED: [
                Task.Status.IN_PROGRESS,
            ],
        }

        allowed_next_statuses = allowed_manager_transitions.get(current_status, [])

        if new_status not in allowed_next_statuses:
            raise ValidationError(
                f"Reviewer/Admin cannot change task status from {current_status} to {new_status}."
            )

        if new_status == Task.Status.COMPLETED:
            if not task_has_annotations(task=task):
                raise ValidationError(
                    "Task cannot be completed because none of its images have annotations."
                )

    else:
        raise ValidationError("You do not have permission to update this task status.")

    task.status = new_status

    if note is not None:
        task.note = note

    task.save(update_fields=["status", "note", "updated_at"])

    return task


def assign_task(
    *,
    task: Task,
    assignee_username: str,
) -> Task:
    assignee = User.objects.filter(
        username=assignee_username,
        is_active=True,
    ).first()

    if assignee is None:
        raise ValidationError("Assignee with this username does not exist.")

    dataset_membership = DatasetMember.objects.filter(
        dataset=task.dataset,
        user=assignee,
    ).first()

    if dataset_membership is None:
        raise ValidationError("Assignee must be a dataset member.")

    if dataset_membership.role not in [
        DatasetMember.Role.ANNOTATOR,
        DatasetMember.Role.REVIEWER,
        DatasetMember.Role.ADMIN,
    ]:
        raise ValidationError("Assignee does not have a valid dataset role.")

    task.assignee = assignee
    task.save(update_fields=["assignee", "updated_at"])

    return task


def delete_task(*, task: Task):
    task.is_deleted = True
    task.save(update_fields=["is_deleted", "updated_at"])
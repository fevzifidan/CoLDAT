from typing import Iterable

from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework.exceptions import ValidationError

from apps.annotations.models import AnnotationObject
from apps.assets.models import Asset
from apps.datasets.models import Dataset
from apps.projects.models import ProjectMembership

from .models import Task, TaskImage


User = get_user_model()


def create_task(
    *,
    dataset: Dataset,
    created_by,
    assignee_username: str,
    image_ids: Iterable,
    role: str = Task.Role.ANNOTATOR,
    name: str = "Untitled Task",
    description: str = "",
    priority: str = Task.Priority.MEDIUM,
    deadline=None,
) -> Task:
    assignee = User.objects.filter(
        username=assignee_username,
        is_active=True,
    ).first()

    if assignee is None:
        raise ValidationError("Assignee with this username does not exist.")

    if role not in Task.Role.values:
        raise ValidationError("Invalid task role.")

    is_project_member = ProjectMembership.objects.filter(
        project=dataset.project,
        user=assignee,
    ).exists()

    if not is_project_member:
        raise ValidationError("Assignee must be a project member.")

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
        role=role,
        created_by=created_by,
        name=name,
        description=description,
        priority=priority,
        deadline=deadline,
        status=Task.Status.ASSIGNED,
    )

    TaskImage.objects.bulk_create(
        [
            TaskImage(task=task, image=image)
            for image in images
        ]
    )

    return task

def mark_task_in_progress_on_first_interaction(*, task: Task, user) -> Task:
    if task.assignee_id != user.id:
        return task

    if task.status != Task.Status.ASSIGNED:
        return task

    if task.role == Task.Role.VIEWER:
        return task

    task.status = Task.Status.IN_PROGRESS

    update_fields = ["status", "updated_at"]

    if task.started_at is None:
        task.started_at = timezone.now()
        update_fields.append("started_at")

    task.save(update_fields=update_fields)

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
    return task.dataset.project.owner_id == user.id


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

    if is_assignee and task.role == Task.Role.VIEWER:
        raise ValidationError("Viewer task assignees cannot update task status.")

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

        # Admin flow
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
                f"Admin cannot change task status from {current_status} to {new_status}."
            )

        if new_status == Task.Status.COMPLETED:
            if not task_has_annotations(task=task):
                raise ValidationError(
                    "Task cannot be completed because none of its images have annotations."
                )

    else:
        raise ValidationError("You do not have permission to update this task status.")

    task.status = new_status

    update_fields = ["status", "updated_at"]

    if note is not None:
        task.note = note
        update_fields.append("note")

    if new_status == Task.Status.IN_PROGRESS and task.started_at is None:
        task.started_at = timezone.now()
        update_fields.append("started_at")

    if new_status == Task.Status.COMPLETED and task.completed_at is None:
        task.completed_at = timezone.now()
        update_fields.append("completed_at")

    task.save(update_fields=update_fields)

    return task


def assign_task(
    *,
    task: Task,
    assignee_username: str,
    role: str,
) -> Task:
    assignee = User.objects.filter(
        username=assignee_username,
        is_active=True,
    ).first()

    if assignee is None:
        raise ValidationError("Assignee with this username does not exist.")

    if role not in Task.Role.values:
        raise ValidationError("Invalid task role.")

    is_project_member = ProjectMembership.objects.filter(
        project=task.dataset.project,
        user=assignee,
    ).exists()

    if not is_project_member:
        raise ValidationError("Assignee must be a project member.")

    task.assignee = assignee
    task.role = role
    task.save(update_fields=["assignee", "role", "updated_at"])

    return task


def delete_task(*, task: Task):
    task.is_deleted = True
    task.save(update_fields=["is_deleted", "updated_at"])

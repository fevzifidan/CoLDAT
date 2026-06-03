from django.db.models import Q
from django.shortcuts import get_object_or_404

from apps.datasets.selectors import get_dataset_for_user
from apps.projects.selectors import get_project_for_user

from .models import Task, TaskImage


def get_tasks_assigned_to_user(*, user, status=None):
    tasks = (
        Task.objects.filter(
            assignee=user,
            is_deleted=False,
        )
        .select_related("dataset", "dataset__project", "assignee", "created_by")
        .order_by("-created_at")
    )

    if status:
        tasks = tasks.filter(status=status)

    return tasks


def get_dataset_tasks_for_user(
    *,
    dataset_id,
    user,
    status=None,
    assignee_username=None,
):
    dataset = get_dataset_for_user(
        dataset_id=dataset_id,
        user=user,
    )

    tasks = (
        Task.objects.filter(
            dataset=dataset,
            is_deleted=False,
        )
        .select_related("dataset", "dataset__project", "assignee", "created_by")
        .order_by("-created_at")
    )

    if status:
        tasks = tasks.filter(status=status)

    if assignee_username:
        tasks = tasks.filter(assignee__username__iexact=assignee_username)

    return dataset, tasks


def get_project_tasks_for_user(
    *,
    project_id,
    user,
    status=None,
    assignee_username=None,
):
    project = get_project_for_user(
        project_id=project_id,
        user=user,
    )

    tasks = (
        Task.objects.filter(
            dataset__project=project,
            is_deleted=False,
        )
        .select_related("dataset", "dataset__project", "assignee", "created_by")
        .order_by("-created_at")
    )

    if status:
        tasks = tasks.filter(status=status)

    if assignee_username:
        tasks = tasks.filter(assignee__username__iexact=assignee_username)

    return project, tasks


def get_task_for_user(*, task_id, user):
    return get_object_or_404(
        Task.objects.filter(
            Q(dataset__project__memberships__user=user)
            | Q(dataset__memberships__user=user),
            is_deleted=False,
        )
        .select_related(
            "dataset",
            "dataset__project",
            "assignee",
            "created_by",
        )
        .distinct(),
        id=task_id,
    )


def get_task_images_for_user(*, task_id, user):
    task = get_task_for_user(
        task_id=task_id,
        user=user,
    )

    task_images = (
        TaskImage.objects.filter(task=task)
        .select_related("image")
        .order_by("added_at")
    )

    return task, task_images

def get_annotator_assignments_for_dataset(*, dataset):
    """
    Returns a list of { asset_id, assignee_username } for all
    tasks with status 'assigned' or 'in_progress' in the given dataset.
    Deduplicates by asset_id (first assignment wins).
    """
    tasks = (
        Task.objects.filter(
            dataset=dataset,
            status__in=[Task.Status.ASSIGNED, Task.Status.IN_PROGRESS],
            is_deleted=False,
        )
        .select_related("assignee")
        .prefetch_related("task_images")
        .order_by("-created_at")
    )

    assignments = []
    seen_asset_ids = set()

    for task in tasks:
        username = task.assignee.username if task.assignee else "unknown"
        for task_image in task.task_images.all():
            asset_id = str(task_image.image_id)
            if asset_id not in seen_asset_ids:
                seen_asset_ids.add(asset_id)
                assignments.append({
                    "asset_id": asset_id,
                    "assignee_username": username,
                })

    return assignments
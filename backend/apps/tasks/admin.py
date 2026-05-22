from django.contrib import admin

from .models import Task, TaskImage


class TaskImageInline(admin.TabularInline):
    model = TaskImage
    extra = 0


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "dataset",
        "assignee",
        "status",
        "created_by",
        "created_at",
    )
    search_fields = (
        "id",
        "dataset__name",
        "assignee__username",
        "assignee__email",
    )
    list_filter = (
        "status",
        "created_at",
    )
    inlines = [TaskImageInline]


@admin.register(TaskImage)
class TaskImageAdmin(admin.ModelAdmin):
    list_display = (
        "task",
        "image",
        "added_at",
    )
    search_fields = (
        "task__id",
        "image__filename",
    )
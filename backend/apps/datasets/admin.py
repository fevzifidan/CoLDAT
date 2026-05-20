from django.contrib import admin

from .models import Dataset, DatasetMember


class DatasetMemberInline(admin.TabularInline):
    model = DatasetMember
    extra = 0


@admin.register(Dataset)
class DatasetAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "project",
        "created_by",
        "is_deleted",
        "created_at",
    )
    search_fields = (
        "name",
        "project__name",
        "created_by__username",
        "created_by__email",
    )
    list_filter = (
        "is_deleted",
        "created_at",
    )
    inlines = [DatasetMemberInline]


@admin.register(DatasetMember)
class DatasetMemberAdmin(admin.ModelAdmin):
    list_display = (
        "dataset",
        "user",
        "role",
        "joined_at",
    )
    search_fields = (
        "dataset__name",
        "user__username",
        "user__email",
    )
    list_filter = (
        "role",
        "joined_at",
    )
from django.contrib import admin

from .models import Dataset, DatasetAPIKey, DatasetMember, DatasetVersion


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

@admin.register(DatasetVersion)
class DatasetVersionAdmin(admin.ModelAdmin):
    list_display = (
        "version_tag",
        "dataset",
        "created_by",
        "created_at",
    )
    search_fields = (
        "version_tag",
        "dataset__name",
        "created_by__username",
        "created_by__email",
    )
    list_filter = (
        "created_at",
    )

@admin.register(DatasetAPIKey)
class DatasetAPIKeyAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "dataset",
        "key_prefix",
        "is_active",
        "created_by",
        "created_at",
        "revoked_at",
    )
    search_fields = (
        "name",
        "dataset__name",
        "key_prefix",
        "created_by__username",
        "created_by__email",
    )
    list_filter = (
        "is_active",
        "created_at",
        "revoked_at",
    )
    readonly_fields = (
        "hashed_key",
        "key_prefix",
        "created_at",
        "revoked_at",
    )
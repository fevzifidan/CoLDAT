from django.contrib import admin

from .models import Asset


@admin.register(Asset)
class AssetAdmin(admin.ModelAdmin):
    list_display = (
        "filename",
        "dataset",
        "mime_type",
        "uploaded_by",
        "is_deleted",
        "created_at",
    )

    search_fields = (
        "filename",
        "storage_key",
        "dataset__name",
        "uploaded_by__username",
        "uploaded_by__email",
    )

    list_filter = (
        "status",
        "mime_type",
        "is_deleted",
        "created_at",
    )
from django.contrib import admin

from .models import ProjectAttribute, ProjectClass, ProjectPredicate


@admin.register(ProjectClass)
class ProjectClassAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "project",
        "index",
        "color",
        "is_active",
        "include_in_export",
    )
    search_fields = (
        "name",
        "project__name",
    )
    list_filter = (
        "is_active",
        "include_in_export",
    )


@admin.register(ProjectPredicate)
class ProjectPredicateAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "project",
        "is_active",
        "include_in_export",
    )
    search_fields = (
        "name",
        "project__name",
    )
    list_filter = (
        "is_active",
        "include_in_export",
    )


@admin.register(ProjectAttribute)
class ProjectAttributeAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "project",
        "attribute_type",
        "is_active",
        "include_in_export",
    )
    search_fields = (
        "name",
        "project__name",
    )
    list_filter = (
        "attribute_type",
        "is_active",
        "include_in_export",
    )
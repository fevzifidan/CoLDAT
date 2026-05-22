from django.contrib import admin

from .models import AnnotationObject, SceneGraphRelationship


@admin.register(AnnotationObject)
class AnnotationObjectAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "image",
        "annotation_class",
        "geometry_type",
        "created_by",
        "created_at",
    )
    search_fields = (
        "id",
        "image__filename",
        "annotation_class__name",
    )
    list_filter = (
        "geometry_type",
        "created_at",
    )


@admin.register(SceneGraphRelationship)
class SceneGraphRelationshipAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "image",
        "subject",
        "predicate",
        "object",
        "created_by",
        "created_at",
    )
    search_fields = (
        "id",
        "image__filename",
        "predicate__name",
    )
    list_filter = (
        "created_at",
    )
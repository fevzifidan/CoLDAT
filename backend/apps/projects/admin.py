from django.contrib import admin

from .models import Project, ProjectMembership


class ProjectMembershipInline(admin.TabularInline):
    model = ProjectMembership
    extra = 0


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "owner",
        "is_archived",
        "created_at",
    )
    search_fields = (
        "name",
        "owner__username",
        "owner__email",
    )
    list_filter = (
        "is_archived",
        "created_at",
    )
    inlines = [ProjectMembershipInline]


@admin.register(ProjectMembership)
class ProjectMembershipAdmin(admin.ModelAdmin):
    list_display = (
        "project",
        "user",
        "role",
        "joined_at",
    )
    search_fields = (
        "project__name",
        "user__username",
        "user__email",
    )
    list_filter = (
        "role",
        "joined_at",
    )
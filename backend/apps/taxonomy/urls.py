from django.urls import path

from apps.taxonomy.views import (
    ProjectTaxonomyAttributeDetailView,
    ProjectTaxonomyClassDetailView,
    ProjectTaxonomyPredicateDetailView,
    ProjectTaxonomyView,
)


urlpatterns = [
    path(
        "<uuid:project_id>/taxonomy/",
        ProjectTaxonomyView.as_view(),
        name="project-taxonomy",
    ),
    path(
        "<uuid:project_id>/taxonomy/classes/<uuid:class_id>/",
        ProjectTaxonomyClassDetailView.as_view(),
        name="project-taxonomy-class-detail",
    ),
    path(
        "<uuid:project_id>/taxonomy/predicates/<uuid:predicate_id>/",
        ProjectTaxonomyPredicateDetailView.as_view(),
        name="project-taxonomy-predicate-detail",
    ),
    path(
        "<uuid:project_id>/taxonomy/attributes/<uuid:attribute_id>/",
        ProjectTaxonomyAttributeDetailView.as_view(),
        name="project-taxonomy-attribute-detail",
    ),
]
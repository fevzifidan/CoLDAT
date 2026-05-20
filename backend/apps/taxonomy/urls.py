from django.urls import path
from apps.taxonomy.views import ProjectTaxonomyView

urlpatterns = [
    path(
    "<uuid:project_id>/taxonomy/",
    ProjectTaxonomyView.as_view(),
    name="project-taxonomy",
),
]
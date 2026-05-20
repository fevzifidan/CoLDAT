from django.urls import path

from .views import ImageAnnotationView


urlpatterns = [
    path(
        "<uuid:image_id>/annotations/",
        ImageAnnotationView.as_view(),
        name="image-annotations",
    ),
]
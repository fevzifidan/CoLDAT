from django.urls import path

from apps.assets.views import UserAssetListView

from .views import UserLookupView


urlpatterns = [
    path(
        "lookup/",
        UserLookupView.as_view(),
        name="users-lookup",
    ),
    path(
        "assets/",
        UserAssetListView.as_view(),
        name="user-assets",
    ),
]
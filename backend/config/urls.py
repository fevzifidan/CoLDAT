from django.contrib import admin
from django.urls import include, path
from django.http import JsonResponse

# Backend'den boş bir liste döndüren basit bir fonksiyon
def list_datasets(request):
    return JsonResponse([], safe=False)

urlpatterns = [
    path("admin/", admin.site.urls),

    path("assets/", include("apps.assets.urls")),
    path("datasets/", include("apps.datasets.urls")),
    path("auth/", include("apps.accounts.urls")),
    path("account/", include("apps.accounts.account_urls")),
    path("users/", include("apps.accounts.users_urls")),
    path("projects/", include("apps.projects.urls")),
    path("tasks/", include("apps.tasks.urls")),
    path("images/", include("apps.annotations.urls")),
    path("datasets/", include("apps.exports.urls")),
]

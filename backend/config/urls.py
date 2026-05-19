from django.contrib import admin
from django.urls import include, path
from django.http import JsonResponse

# Backend'den boş bir liste döndüren basit bir fonksiyon
def list_datasets(request):
    return JsonResponse([], safe=False)

urlpatterns = [
    path("admin/", admin.site.urls),

    path("api/v1/auth/", include("apps.accounts.urls")),
    path("api/v1/account/", include("apps.accounts.account_urls")),

    # İŞTE EKSİK OLAN KISIM BURASI:
    path("api/v1/datasets", list_datasets),
    path("api/v1/datasets/", list_datasets),
]
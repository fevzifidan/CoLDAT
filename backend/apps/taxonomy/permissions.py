from rest_framework.permissions import BasePermission

from apps.projects.models import ProjectMembership


class CanManageTaxonomy(BasePermission):
    """
    Taxonomy yönetimi:
    - GET: Proje üyesi olan herkes görebilir (selector zaten kontrol ediyor)
    - PUT/PATCH/DELETE: Sadece proje owner (admin)
    """
    def has_object_permission(self, request, view, obj):
        if hasattr(obj, "project"):
            project = obj.project
        else:
            project = obj

        # Proje owner her durumda yetkilidir
        if project.owner_id == request.user.id:
            return True

        # GET (read-only) için proje üyeleri de erişebilir
        if request.method in ["GET"]:
            return ProjectMembership.objects.filter(
                project=project,
                user=request.user,
            ).exists()

        # PUT/PATCH/DELETE için sadece admin
        return False

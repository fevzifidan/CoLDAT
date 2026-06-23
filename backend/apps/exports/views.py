from django.http import Http404
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.views import APIView

from apps.datasets.models import DatasetAPIKey
from apps.datasets.selectors import (
    get_dataset_version_for_user,
    get_latest_dataset_version_for_user,
)

from .authentication import DatasetAPIKeyAuthentication
from .archives import build_export_archive
from .selectors import get_dataset_version_for_api_key
from .serializers import DatasetExportQuerySerializer
from .services import (
    build_dataset_export_from_snapshot,
)
from .storage import upload_export_archive


class DatasetExportView(APIView):
    authentication_classes = [
        JWTAuthentication,
        DatasetAPIKeyAuthentication,
    ]
    permission_classes = [IsAuthenticated]

    def get(self, request, dataset_id):
        query_serializer = DatasetExportQuerySerializer(
            data=request.query_params
        )
        query_serializer.is_valid(raise_exception=True)

        export_format = query_serializer.validated_data["format"]
        if isinstance(request.auth, DatasetAPIKey):
            # API keys are already bound to the dataset in the URL. Per the API
            # contract, version selection only applies to bearer-token exports.
            dataset = request.auth.dataset
            version = get_dataset_version_for_api_key(api_key=request.auth)
            if version is None:
                raise Http404(
                    "This API key does not have an exportable dataset version."
                )
        else:
            version_tag = query_serializer.validated_data.get("version_tag")
            if version_tag:
                dataset, version = get_dataset_version_for_user(
                    dataset_id=dataset_id,
                    version_tag=version_tag,
                    user=request.user,
                )
            else:
                dataset, version = get_latest_dataset_version_for_user(
                    dataset_id=dataset_id,
                    user=request.user,
                )

        export_data = build_dataset_export_from_snapshot(
            snapshot=version.snapshot,
            export_format=export_format,
        )
        archive = build_export_archive(
            export_data=export_data,
            export_format=export_format,
        )
        try:
            download_url = upload_export_archive(
                archive=archive,
                dataset_id=dataset.id,
                version_tag=version.version_tag,
                export_format=export_format,
            )
        finally:
            archive.close()

        return Response(
            {
                "format": export_format,
                "dataset_id": str(dataset.id),
                "dataset_name": dataset.name,
                "version_tag": version.version_tag,
                "download_url": download_url,
                "data": export_data,
            },
            status=status.HTTP_200_OK,
        )

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.datasets.selectors import get_dataset_version_for_user

from .selectors import get_dataset_for_export_user
from .serializers import DatasetExportQuerySerializer
from .services import (
    build_dataset_export,
    build_dataset_export_from_snapshot,
)


class DatasetExportView(APIView):
    def get(self, request, dataset_id):
        query_serializer = DatasetExportQuerySerializer(
            data=request.query_params
        )
        query_serializer.is_valid(raise_exception=True)

        export_format = query_serializer.validated_data["format"]
        version_tag = query_serializer.validated_data.get("version_tag")

        dataset = get_dataset_for_export_user(
            dataset_id=dataset_id,
            user=request.user,
        )

        if version_tag:
            dataset, version = get_dataset_version_for_user(
                dataset_id=dataset_id,
                version_tag=version_tag,
                user=request.user,
            )

            export_data = build_dataset_export_from_snapshot(
                snapshot=version.snapshot,
                export_format=export_format,
            )

            return Response(
                {
                    "format": export_format,
                    "dataset_id": str(dataset.id),
                    "dataset_name": dataset.name,
                    "version_tag": version.version_tag,
                    "download_url": None,
                    "data": export_data,
                },
                status=status.HTTP_200_OK,
            )

        export_data = build_dataset_export(
            dataset=dataset,
            export_format=export_format,
        )

        return Response(
            {
                "format": export_format,
                "dataset_id": str(dataset.id),
                "dataset_name": dataset.name,
                "version_tag": None,
                "download_url": None,
                "data": export_data,
            },
            status=status.HTTP_200_OK,
        )
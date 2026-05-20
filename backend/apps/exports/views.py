from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from .selectors import get_dataset_for_export_user
from .services import build_dataset_export


class DatasetExportView(APIView):
    def get(self, request, dataset_id):
        export_format = request.query_params.get("format")

        allowed_formats = [
            "coco",
            "yolo",
            "visual_genome",
        ]

        if export_format not in allowed_formats:
            return Response(
                {
                    "detail": "format must be one of: coco, yolo, visual_genome."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        dataset = get_dataset_for_export_user(
            dataset_id=dataset_id,
            user=request.user,
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
                "download_url": None,
                "data": export_data,
            },
            status=status.HTTP_200_OK,
        )
from rest_framework import serializers


class DatasetExportQuerySerializer(serializers.Serializer):
    format = serializers.ChoiceField(
        choices=[
            "coco",
            "yolo",
            "visual_genome",
        ]
    )

    version_tag = serializers.CharField(
        required=False,
        allow_blank=False,
    )
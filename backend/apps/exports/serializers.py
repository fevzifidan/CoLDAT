from rest_framework import serializers


class DatasetExportQuerySerializer(serializers.Serializer):
    format = serializers.ChoiceField(
        choices=[
            "coco",
            "yolo",
            "visual_genome",
        ]
    )

    version = serializers.CharField(
        required=False,
        allow_blank=False,
    )

    # Backward-compatible alias, in case we already tested version_tag before.
    version_tag = serializers.CharField(
        required=False,
        allow_blank=False,
    )

    def validate(self, attrs):
        version = attrs.get("version")
        version_tag = attrs.get("version_tag")

        if version and version_tag and version != version_tag:
            raise serializers.ValidationError(
                "Use either version or version_tag, not both with different values."
            )

        attrs["version_tag"] = version or version_tag

        return attrs
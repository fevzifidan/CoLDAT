from django.shortcuts import render
from django.conf import settings
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from .storage import (
    create_presigned_upload_url,
    generate_asset_storage_key,
    generate_embedding_storage_key,
)

from .permissions import CanManageDatasetAssets
from .selectors import (
    get_asset_for_user,
    get_assets_for_status_update,
    get_dataset_assets_for_user,
)
from .serializers import (
    AssetBulkStatusUpdateSerializer,
    AssetCreateSerializer,
    AssetRetryUploadSerializer,
    AssetSerializer,
    AssetUploadURLCreateSerializer,
)

from .services import (
    bulk_update_asset_upload_status,
    create_asset,
    create_pending_asset_upload,
    create_pending_embedding_upload,
    delete_asset,
    retry_asset_upload,
)


class DatasetAssetListCreateView(APIView):
    def get(self, request, dataset_id):
        dataset, assets = get_dataset_assets_for_user(
            dataset_id=dataset_id,
            user=request.user,
        )

        return Response(
            {
                "data": AssetSerializer(assets, many=True).data,
                "next_cursor": None,
            },
            status=status.HTTP_200_OK,
        )

    def post(self, request, dataset_id):
        dataset, _ = get_dataset_assets_for_user(
            dataset_id=dataset_id,
            user=request.user,
        )

        self.check_object_permissions(request, dataset)

        serializer = AssetCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        asset = create_asset(
            dataset=dataset,
            uploaded_by=request.user,
            storage_key=serializer.validated_data["storage_key"],
            embedding_storage_key=serializer.validated_data.get(
                "embedding_storage_key",
                "",
            ),
            filename=serializer.validated_data["filename"],
            mime_type=serializer.validated_data["mime_type"],
            width=serializer.validated_data.get("width"),
            height=serializer.validated_data.get("height"),
            content_sha256=serializer.validated_data.get("content_sha256", ""),
        )

        return Response(
            AssetSerializer(asset).data,
            status=status.HTTP_201_CREATED,
        )

    def get_permissions(self):
        if self.request.method == "POST":
            return [CanManageDatasetAssets()]

        return super().get_permissions()

class AssetUploadURLCreateView(APIView):
    def post(self, request, dataset_id):
        dataset, _ = get_dataset_assets_for_user(
            dataset_id=dataset_id,
            user=request.user,
        )

        self.check_object_permissions(request, dataset)

        serializer = AssetUploadURLCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        urls = []

        for file_data in serializer.validated_data["files"]:
            upload_type = file_data["upload_type"]
            filename = file_data["filename"]
            mime_type = file_data["mime_type"]
            file_sha256 = file_data["file_sha256"]

            if upload_type == "asset":
                storage_key = generate_asset_storage_key(
                    dataset_id=dataset.id,
                    filename=filename,
                )

                asset = create_pending_asset_upload(
                    dataset=dataset,
                    uploaded_by=request.user,
                    storage_key=storage_key,
                    filename=filename,
                    mime_type=mime_type,
                    content_sha256=file_sha256,
                    width=file_data.get("width"),
                    height=file_data.get("height"),
                )

                upload_url = create_presigned_upload_url(
                    storage_key=storage_key,
                    mime_type=mime_type,
                    content_sha256=file_sha256,
                    expires_in=settings.ASSET_UPLOAD_URL_EXPIRES_IN_SECONDS,
                )

                urls.append(
                    {
                        "upload_id": file_data["upload_id"],
                        "upload_type": upload_type,
                        "asset_id": str(asset.id),
                        "upload_url": upload_url,
                        "storage_key": storage_key,
                        "expiry_at": asset.upload_url_valid_until,
                        "headers": {
                            "Content-Type": mime_type,
                            "x-amz-checksum-sha256": file_sha256,
                        },
                    }
                )

            elif upload_type == "embedding":
                asset = get_asset_for_user(
                    asset_id=file_data["asset_id"],
                    user=request.user,
                )

                if asset.dataset_id != dataset.id:
                    return Response(
                        {"detail": "Embedding asset does not belong to this dataset."},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                storage_key = generate_embedding_storage_key(
                    asset_id=asset.id,
                    filename=filename,
                )

                asset = create_pending_embedding_upload(
                    asset=asset,
                    storage_key=storage_key,
                    embedding_sha256=file_sha256,
                )

                upload_url = create_presigned_upload_url(
                    storage_key=storage_key,
                    mime_type=mime_type,
                    content_sha256=file_sha256,
                    expires_in=settings.ASSET_UPLOAD_URL_EXPIRES_IN_SECONDS,
                )

                urls.append(
                    {
                        "upload_id": file_data["upload_id"],
                        "upload_type": upload_type,
                        "asset_id": str(asset.id),
                        "upload_url": upload_url,
                        "storage_key": storage_key,
                        "expiry_at": asset.embedding_upload_url_valid_until,
                        "headers": {
                            "Content-Type": mime_type,
                            "x-amz-checksum-sha256": file_sha256,
                        },
                    }
                )

        return Response(
            {
                "urls": urls,
            },
            status=status.HTTP_200_OK,
        )

    def get_permissions(self):
        return [CanManageDatasetAssets()]

class AssetDetailView(APIView):
    def get(self, request, asset_id):
        asset = get_asset_for_user(
            asset_id=asset_id,
            user=request.user,
        )

        return Response(
            AssetSerializer(asset).data,
            status=status.HTTP_200_OK,
        )

    def delete(self, request, asset_id):
        asset = get_asset_for_user(
            asset_id=asset_id,
            user=request.user,
        )

        self.check_object_permissions(request, asset)

        delete_asset(asset=asset)

        return Response(status=status.HTTP_204_NO_CONTENT)

    def get_permissions(self):
        if self.request.method == "DELETE":
            return [CanManageDatasetAssets()]

        return super().get_permissions()
    
    
class AssetBulkStatusUpdateView(APIView):
    def post(self, request):
        serializer = AssetBulkStatusUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        items = serializer.validated_data["updates"]
        asset_ids = [item["asset_id"] for item in items]

        assets = get_assets_for_status_update(
            asset_ids=asset_ids,
            user=request.user,
        )

        assets_by_id = {
            str(asset.id): asset
            for asset in assets
        }

        updated_assets = bulk_update_asset_upload_status(
            assets_by_id=assets_by_id,
            items=items,
        )

        return Response(
            {
                "data": AssetSerializer(updated_assets, many=True).data,
            },
            status=status.HTTP_200_OK,
        )
    
class AssetRetryUploadView(APIView):
    def post(self, request, asset_id):
        asset = get_asset_for_user(
            asset_id=asset_id,
            user=request.user,
        )

        self.check_object_permissions(request, asset)

        serializer = AssetRetryUploadSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        content_sha256 = serializer.validated_data.get("file_sha256")

        if not content_sha256:
            content_sha256 = asset.content_sha256

        storage_key = generate_asset_storage_key(
            dataset_id=asset.dataset_id,
            filename=asset.filename,
        )

        asset = retry_asset_upload(
            asset=asset,
            storage_key=storage_key,
            content_sha256=content_sha256,
        )

        upload_url = create_presigned_upload_url(
            storage_key=asset.storage_key,
            mime_type=asset.mime_type,
            content_sha256=asset.content_sha256,
            expires_in=settings.ASSET_UPLOAD_URL_EXPIRES_IN_SECONDS,
        )

        return Response(
            {
                "asset": AssetSerializer(asset).data,
                "upload_url": upload_url,
                "expires_in": settings.ASSET_UPLOAD_URL_EXPIRES_IN_SECONDS,
                "method": "PUT",
                "headers": {
                    "Content-Type": asset.mime_type,
                    "x-amz-checksum-sha256": asset.content_sha256,
                },
            },
            status=status.HTTP_200_OK,
        )

    def get_permissions(self):
        return [CanManageDatasetAssets()]

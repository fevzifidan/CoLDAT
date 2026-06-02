from django.conf import settings
from django.db import transaction
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from datetime import timedelta

from django.utils import timezone

from .storage import (
    create_presigned_upload_url,
    generate_asset_storage_key,
    generate_embedding_storage_key,
    object_exists,
)

from .permissions import CanManageDatasetAssets
from .selectors import (
    get_asset_for_user,
    get_assets_for_status_update,
    get_dataset_assets_for_user,
    get_dataset_images_for_user,
    get_user_uploaded_assets,
)
from .serializers import (
    AssetBulkRefreshURLSerializer,
    AssetBulkStatusUpdateSerializer,
    AssetCheckDanglingSerializer,
    AssetCreateSerializer,
    AssetRetryUploadSerializer,
    AssetSerializer,
    AssetUploadURLCreateSerializer,
    ImageSerializer,
    UserAssetListQuerySerializer,
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
    @transaction.atomic
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

                presigned_upload = create_presigned_upload_url(
                    storage_key=storage_key,
                    mime_type=mime_type,
                    file_sha256=file_sha256,
                    expires_in=settings.ASSET_UPLOAD_URL_EXPIRES_IN_SECONDS,
                )

                urls.append(
                    {
                        "upload_id": file_data["upload_id"],
                        "upload_type": upload_type,
                        "asset_id": str(asset.id),
                        "upload_url": presigned_upload["upload_url"],
                        "storage_key": storage_key,
                        "expiry_at": asset.upload_url_valid_until,
                        "headers": presigned_upload["headers"],
                    }
                )

            elif upload_type == "embedding":
                asset = get_asset_for_user(
                    asset_id=file_data["asset_id"],
                    user=request.user,
                )

                if asset.dataset_id != dataset.id:
                    raise ValidationError(
                        "Embedding asset does not belong to this dataset."
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

                presigned_upload = create_presigned_upload_url(
                    storage_key=storage_key,
                    mime_type=mime_type,
                    file_sha256=file_sha256,
                    expires_in=settings.ASSET_UPLOAD_URL_EXPIRES_IN_SECONDS,
                )

                urls.append(
                    {
                        "upload_id": file_data["upload_id"],
                        "upload_type": upload_type,
                        "asset_id": str(asset.id),
                        "upload_url": presigned_upload["upload_url"],
                        "storage_key": storage_key,
                        "expiry_at": asset.embedding_upload_url_valid_until,
                        "headers": presigned_upload["headers"],
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
    @transaction.atomic
    def post(self, request, asset_id):
        asset = get_asset_for_user(
            asset_id=asset_id,
            user=request.user,
        )

        self.check_object_permissions(request, asset)

        serializer = AssetRetryUploadSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        file_sha256 = serializer.validated_data.get("file_sha256")

        if not file_sha256:
            file_sha256 = asset.content_sha256

        storage_key = generate_asset_storage_key(
            dataset_id=asset.dataset_id,
            filename=asset.filename,
        )

        asset = retry_asset_upload(
            asset=asset,
            storage_key=storage_key,
            content_sha256=file_sha256,
        )

        presigned_upload = create_presigned_upload_url(
            storage_key=asset.storage_key,
            mime_type=asset.mime_type,
            file_sha256=file_sha256,
            expires_in=settings.ASSET_UPLOAD_URL_EXPIRES_IN_SECONDS,
        )

        return Response(
            {
                "asset": AssetSerializer(asset).data,
                "upload_url": presigned_upload["upload_url"],
                "expiry_at": asset.upload_url_valid_until,
                "method": "PUT",
                "headers": presigned_upload["headers"],
            },
            status=status.HTTP_200_OK,
        )

    def get_permissions(self):
        return [CanManageDatasetAssets()]
    
class DatasetImageListView(APIView):
    def get(self, request, dataset_id):
        search = request.query_params.get("search")

        dataset, images = get_dataset_images_for_user(
            dataset_id=dataset_id,
            user=request.user,
            search=search,
        )

        read_url_expiry_at = timezone.now() + timedelta(
            seconds=settings.ASSET_READ_URL_EXPIRES_IN_SECONDS
        )

        return Response(
            {
                "data": ImageSerializer(
                    images,
                    many=True,
                    context={
                        "read_url_expiry_at": read_url_expiry_at,
                    },
                ).data,
                "next_cursor": None,
            },
            status=status.HTTP_200_OK,
        )
class UserAssetListView(APIView):
    def get(self, request):
        query_serializer = UserAssetListQuerySerializer(
            data=request.query_params
        )
        query_serializer.is_valid(raise_exception=True)

        assets = get_user_uploaded_assets(
            user=request.user,
            status=query_serializer.validated_data.get("status"),
            search=query_serializer.validated_data.get("search"),
        )

        return Response(
            {
                "data": AssetSerializer(assets, many=True).data,
                "next_cursor": None,
            },
            status=status.HTTP_200_OK,
        )
    
class AssetCheckDanglingView(APIView):
    def post(self, request):
        serializer = AssetCheckDanglingSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        asset_ids = serializer.validated_data.get("asset_ids")

        assets = get_user_uploaded_assets(
            user=request.user,
        )

        if asset_ids:
            assets = assets.filter(id__in=asset_ids)

        results = []

        for asset in assets:
            asset_missing = False
            embedding_missing = False

            if asset.status == asset.UploadStatus.UPLOADED:
                asset_missing = not object_exists(
                    storage_key=asset.storage_key,
                )

                if asset_missing:
                    asset.status = asset.UploadStatus.VERIFICATION_FAILED
                    asset.upload_error_message = (
                        "Database says asset is uploaded, but object was not found in storage."
                    )
                    asset.save(
                        update_fields=[
                            "status",
                            "upload_error_message",
                            "updated_at",
                        ]
                    )

            if asset.embedding_status == asset.EmbeddingStatus.UPLOADED:
                if not asset.embedding_storage_key:
                    embedding_missing = True
                else:
                    embedding_missing = not object_exists(
                        storage_key=asset.embedding_storage_key,
                    )

                if embedding_missing:
                    asset.embedding_status = asset.EmbeddingStatus.VERIFICATION_FAILED
                    asset.embedding_error_message = (
                        "Database says embedding is uploaded, but object was not found in storage."
                    )
                    asset.save(
                        update_fields=[
                            "embedding_status",
                            "embedding_error_message",
                            "updated_at",
                        ]
                    )

            results.append(
                {
                    "asset_id": str(asset.id),
                    "filename": asset.filename,
                    "asset_exists": not asset_missing,
                    "embedding_exists": None
                    if asset.embedding_status == asset.EmbeddingStatus.NOT_REQUESTED
                    else not embedding_missing,
                    "status": asset.status.upper(),
                    "embedding_status": None
                    if asset.embedding_status == asset.EmbeddingStatus.NOT_REQUESTED
                    else asset.embedding_status.upper(),
                    "upload_error_message": asset.upload_error_message,
                    "embedding_error_message": asset.embedding_error_message,
                }
            )

        return Response(
            {
                "data": results,
            },
            status=status.HTTP_200_OK,
        )
    
class AssetBulkRefreshURLView(APIView):
    def post(self, request):
        serializer = AssetBulkRefreshURLSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        items = serializer.validated_data["items"]
        asset_ids = [
            item["asset_id"]
            for item in items
        ]

        assets = get_assets_for_status_update(
            asset_ids=asset_ids,
            user=request.user,
        )

        assets_by_id = {
            str(asset.id): asset
            for asset in assets
        }

        refreshed_urls = []

        for item in items:
            asset_id = str(item["asset_id"])
            upload_type = item["upload_type"]

            asset = assets_by_id.get(asset_id)

            if asset is None:
                raise PermissionDenied(
                    f"URL refresh rejected for asset {asset_id}."
                )

            if upload_type == "asset":
                if asset.status != asset.UploadStatus.PENDING:
                    raise PermissionDenied(
                        f"URL refresh rejected for asset {asset_id}: asset upload is not pending."
                    )

                if not asset.content_sha256:
                    raise ValidationError(
                        f"Asset {asset_id} does not have content_sha256."
                    )

                expires_at = timezone.now() + timedelta(
                    seconds=settings.ASSET_UPLOAD_URL_EXPIRES_IN_SECONDS
                )

                asset.upload_url_valid_until = expires_at
                asset.save(
                    update_fields=[
                        "upload_url_valid_until",
                        "updated_at",
                    ]
                )

                presigned_upload = create_presigned_upload_url(
                    storage_key=asset.storage_key,
                    mime_type=asset.mime_type,
                    file_sha256=asset.content_sha256,
                    expires_in=settings.ASSET_UPLOAD_URL_EXPIRES_IN_SECONDS,
                )

                refreshed_urls.append(
                    {
                        "asset_id": str(asset.id),
                        "upload_type": "asset",
                        "upload_url": presigned_upload["upload_url"],
                        "storage_key": asset.storage_key,
                        "expiry_at": asset.upload_url_valid_until,
                        "headers": presigned_upload["headers"],
                    }
                )

            elif upload_type == "embedding":
                if asset.embedding_status != asset.EmbeddingStatus.PENDING:
                    raise PermissionDenied(
                        f"URL refresh rejected for asset {asset_id}: embedding upload is not pending."
                    )

                if not asset.embedding_sha256:
                    raise ValidationError(
                        f"Asset {asset_id} does not have embedding_sha256."
                    )

                if not asset.embedding_storage_key:
                    raise ValidationError(
                        f"Asset {asset_id} does not have embedding_storage_key."
                    )

                expires_at = timezone.now() + timedelta(
                    seconds=settings.ASSET_UPLOAD_URL_EXPIRES_IN_SECONDS
                )

                asset.embedding_upload_url_valid_until = expires_at
                asset.save(
                    update_fields=[
                        "embedding_upload_url_valid_until",
                        "updated_at",
                    ]
                )

                presigned_upload = create_presigned_upload_url(
                    storage_key=asset.embedding_storage_key,
                    mime_type="application/octet-stream",
                    file_sha256=asset.embedding_sha256,
                    expires_in=settings.ASSET_UPLOAD_URL_EXPIRES_IN_SECONDS,
                )

                refreshed_urls.append(
                    {
                        "asset_id": str(asset.id),
                        "upload_type": "embedding",
                        "upload_url": presigned_upload["upload_url"],
                        "storage_key": asset.embedding_storage_key,
                        "expiry_at": asset.embedding_upload_url_valid_until,
                        "headers": presigned_upload["headers"],
                    }
                )

        return Response(
            {
                "urls": refreshed_urls,
            },
            status=status.HTTP_200_OK,
        )
import hashlib
import hmac

from django.utils import timezone
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed, PermissionDenied

from apps.datasets.models import DatasetAPIKey


class DatasetAPIKeyPrincipal:
    """Minimal authenticated principal for dataset-scoped API keys."""

    is_authenticated = True
    is_anonymous = False

    def __init__(self, api_key: DatasetAPIKey):
        self.api_key = api_key
        self.pk = api_key.id

    def __str__(self):
        return f"Dataset API key {self.api_key.key_prefix}"


class DatasetAPIKeyAuthentication(BaseAuthentication):
    header_name = "X-API-KEY"

    def authenticate(self, request):
        raw_key = request.META.get("HTTP_X_API_KEY")
        if raw_key is None:
            return None

        raw_key = raw_key.strip()
        if not raw_key:
            raise AuthenticationFailed("Invalid API key.")

        dataset_id = request.parser_context.get("kwargs", {}).get("dataset_id")
        api_key = (
            DatasetAPIKey.objects.select_related("dataset__project")
            .filter(
                dataset_id=dataset_id,
                key_prefix=raw_key[:16],
            )
            .first()
        )

        supplied_hash = hashlib.sha256(raw_key.encode("utf-8")).hexdigest()
        if api_key is None or not hmac.compare_digest(
            supplied_hash,
            api_key.hashed_key,
        ):
            raise AuthenticationFailed("Invalid API key.")

        if not api_key.is_active or api_key.revoked_at is not None:
            raise PermissionDenied("API key is disabled or revoked.")

        if api_key.expires_at and api_key.expires_at <= timezone.now():
            raise PermissionDenied("API key has expired.")

        if api_key.dataset.is_deleted or api_key.dataset.project.is_archived:
            raise PermissionDenied("This dataset is not available for export.")

        return DatasetAPIKeyPrincipal(api_key), api_key

    def authenticate_header(self, request):
        return self.header_name

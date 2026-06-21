from dataclasses import dataclass
from functools import lru_cache
import uuid

import jwt
from django.conf import settings
from django.core.exceptions import ValidationError as DjangoValidationError
from django.core.validators import validate_email
from jwt.exceptions import (
    InvalidTokenError,
    PyJWKClientConnectionError,
    PyJWKClientError,
)
from rest_framework.exceptions import APIException


class MSALAuthenticationFailed(APIException):
    status_code = 401
    default_detail = "Invalid Microsoft token."
    default_code = "msal_authentication_failed"


class MSALServiceUnavailable(APIException):
    status_code = 503
    default_detail = "Microsoft authentication is temporarily unavailable."
    default_code = "msal_unavailable"


@dataclass(frozen=True)
class MicrosoftIdentity:
    object_id: str
    tenant_id: str
    email: str
    first_name: str
    last_name: str


@lru_cache(maxsize=4)
def _get_jwks_client(jwks_url: str):
    return jwt.PyJWKClient(jwks_url, timeout=5)


def validate_msal_token(msal_token: str) -> MicrosoftIdentity:
    client_id = settings.MSAL_CLIENT_ID
    tenant_id = settings.MSAL_TENANT_ID
    issuer = settings.MSAL_ISSUER
    jwks_url = settings.MSAL_JWKS_URL

    if not all([client_id, tenant_id, issuer, jwks_url]):
        raise MSALServiceUnavailable(
            "Microsoft authentication is not configured."
        )

    configured_tenant_id = _configured_tenant_uuid(tenant_id)

    try:
        signing_key = _get_jwks_client(jwks_url).get_signing_key_from_jwt(
            msal_token
        )
        claims = jwt.decode(
            msal_token,
            signing_key.key,
            algorithms=["RS256"],
            audience=client_id,
            issuer=issuer,
            leeway=30,
            options={
                "require": [
                    "aud",
                    "exp",
                    "iat",
                    "iss",
                    "oid",
                    "sub",
                    "tid",
                ]
            },
        )
    except PyJWKClientConnectionError:
        raise MSALServiceUnavailable()
    except (InvalidTokenError, PyJWKClientError):
        raise MSALAuthenticationFailed()

    claim_tenant_id = _canonical_uuid_claim(claims.get("tid"), "tid")
    if claim_tenant_id != configured_tenant_id:
        raise MSALAuthenticationFailed(
            "Microsoft token belongs to another tenant."
        )

    object_id = _canonical_uuid_claim(claims.get("oid"), "oid")
    email = (
        claims.get("email")
        or claims.get("preferred_username")
        or ""
    ).strip().lower()

    try:
        validate_email(email)
    except DjangoValidationError:
        raise MSALAuthenticationFailed(
            "Microsoft token does not contain a valid email address."
        )

    first_name = str(claims.get("given_name") or "").strip()
    last_name = str(claims.get("family_name") or "").strip()

    if not first_name and not last_name:
        display_name_parts = str(claims.get("name") or "").strip().split()

        if display_name_parts:
            first_name = display_name_parts[0]
            last_name = " ".join(display_name_parts[1:])

    return MicrosoftIdentity(
        object_id=object_id,
        tenant_id=claim_tenant_id,
        email=email,
        first_name=first_name[:150],
        last_name=last_name[:150],
    )


def _canonical_uuid_claim(value, claim_name: str) -> str:
    try:
        return str(uuid.UUID(str(value)))
    except (AttributeError, TypeError, ValueError):
        raise MSALAuthenticationFailed(
            f"Microsoft token contains an invalid {claim_name} claim."
        )


def _configured_tenant_uuid(value) -> str:
    try:
        return str(uuid.UUID(str(value)))
    except (AttributeError, TypeError, ValueError):
        raise MSALServiceUnavailable(
            "Microsoft authentication tenant configuration is invalid."
        )

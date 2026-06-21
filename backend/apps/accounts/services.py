import hashlib
import re

from django.contrib.auth import get_user_model
from django.db import transaction

from .msal import MSALAuthenticationFailed, MicrosoftIdentity


User = get_user_model()


def create_user(
    *,
    username: str,
    email: str,
    password: str,
    first_name: str,
    last_name: str,
) -> User:
    user = User.objects.create_user(
        username=username,
        email=email,
        password=password,
        first_name=first_name,
        last_name=last_name,
        auth_provider=User.AuthProvider.EMAIL,
        is_active=True,
    )

    return user


def update_user_account(*, user: User, data: dict) -> User:
    allowed_fields = [
        "username",
        "email",
        "first_name",
        "last_name",
    ]

    update_fields = []

    for field in allowed_fields:
        if field in data:
            setattr(user, field, data[field])
            update_fields.append(field)

    if update_fields:
        user.save(update_fields=update_fields)

    return user


@transaction.atomic
def get_or_create_msal_user(*, identity: MicrosoftIdentity) -> User:
    user = (
        User.objects.select_for_update()
        .filter(
            msal_tenant_id=identity.tenant_id,
            msal_oid=identity.object_id,
        )
        .first()
    )

    if user is not None:
        _ensure_user_is_active(user)
        return user

    user = (
        User.objects.select_for_update()
        .filter(email__iexact=identity.email)
        .first()
    )

    if user is not None:
        _ensure_user_is_active(user)

        if user.msal_oid is not None and (
            user.msal_oid != identity.object_id
            or user.msal_tenant_id != identity.tenant_id
        ):
            raise MSALAuthenticationFailed(
                "This email is linked to another Microsoft identity."
            )

        user.auth_provider = User.AuthProvider.MSAL
        user.msal_oid = identity.object_id
        user.msal_tenant_id = identity.tenant_id

        update_fields = [
            "auth_provider",
            "msal_oid",
            "msal_tenant_id",
            "password",
        ]

        if not user.first_name and identity.first_name:
            user.first_name = identity.first_name
            update_fields.append("first_name")

        if not user.last_name and identity.last_name:
            user.last_name = identity.last_name
            update_fields.append("last_name")

        user.set_unusable_password()
        user.save(update_fields=update_fields)
        return user

    return User.objects.create_user(
        username=_build_msal_username(identity=identity),
        email=identity.email,
        password=None,
        first_name=identity.first_name,
        last_name=identity.last_name,
        auth_provider=User.AuthProvider.MSAL,
        msal_oid=identity.object_id,
        msal_tenant_id=identity.tenant_id,
        is_active=True,
    )


def _ensure_user_is_active(user: User):
    if not user.is_active:
        raise MSALAuthenticationFailed("This account is disabled.")


def _build_msal_username(*, identity: MicrosoftIdentity) -> str:
    email_prefix = identity.email.partition("@")[0]
    base = re.sub(r"[^\w.@+-]", "-", email_prefix).strip("-_")
    base = base or "microsoft-user"
    suffix = hashlib.sha256(
        f"{identity.tenant_id}:{identity.object_id}".encode("utf-8")
    ).hexdigest()[:12]
    base = base[: 150 - len(suffix) - 1]
    candidate = f"{base}-{suffix}"

    if not User.objects.filter(username__iexact=candidate).exists():
        return candidate

    for counter in range(1, 1000):
        counter_suffix = f"-{counter}"
        available_base = candidate[: 150 - len(counter_suffix)]
        fallback = f"{available_base}{counter_suffix}"

        if not User.objects.filter(username__iexact=fallback).exists():
            return fallback

    raise MSALAuthenticationFailed("Could not provision a unique username.")

"""
Application-wide email sending service.
All email sending happens through this module.
Rate limiting and token management are applied at this layer.
"""

from uuid import uuid4

from django.conf import settings

from apps.common.mail_ratelimit import (
    check_rate_limit,
    update_last_sent_time,
    store_token,
    get_current_valid_token,
    get_token_data,
    invalidate_token,
)
from apps.common.mail_i18n import get_localized_template_variables

# ---------------------------------------------------------------------------
# Purpose constants
# ---------------------------------------------------------------------------
PURPOSE_EMAIL_VERIFY = "email_verify"
PURPOSE_PASSWORD_RESET = "password_reset"


class RateLimitExceeded(Exception):
    """Raised when rate limit is exceeded. Used to return 429 in views."""

    def __init__(self, remaining_seconds: int):
        self.remaining_seconds = remaining_seconds
        super().__init__(
            f"Too many requests. Try again in {remaining_seconds} seconds."
        )


def _send_template_email(
    *,
    to: str,
    template_id: str,
    template_variables: dict,
    subject: str = "",
) -> bool:
    """
    Resend template kullanarak email gonderir.
    Resend Python SDK uzerinden dogrudan API'ye istek yapar.
    """
    import logging

    logger = logging.getLogger(__name__)

    try:
        import resend

        resend.api_key = settings.RESEND_API_KEY

        params = {
            "from": settings.DEFAULT_FROM_EMAIL,
            "to": [to],
            "subject": subject,
            "template": {
                "id": template_id,
                "variables": template_variables,
            },
        }

        resend.Emails.send(params)
        return True

    except Exception as exc:
        logger.error(f"Failed to send email via Resend: {exc}", exc_info=True)
        return False


def _send_purpose_email(
    *,
    purpose: str,
    user,
    user_locale: str = "en",
    template_id: str,
    ttl_hours: int,
    url_path: str,
    url_param_name: str,
) -> bool:
    """
    Generic email sending function for purpose-based emails (verification / password reset).

    - Checks rate limit.
    - Stores token in Redis.
    - New token invalidates the previous one.
    - Uses localized Resend template variables (EN/TR).

    Returns:
      - bool: True if email was sent successfully

    Raises:
      - RateLimitExceeded: If an email was sent within the last 10 minutes
    """
    user_id = str(user.id)
    frontend_url = getattr(settings, "FRONTEND_URL", "http://localhost:5174")

    # Rate limit check
    remaining = check_rate_limit(purpose, user_id)
    if remaining is not None:
        raise RateLimitExceeded(remaining)

    # Generate token
    token_uuid = str(uuid4())
    action_url = f"{frontend_url}/{url_path}?token={token_uuid}"

    # Store token in Redis (previous token is automatically overridden -> invalidated)
    store_token(
        purpose=purpose,
        user_id=user_id,
        token_uuid=token_uuid,
        ttl_hours=ttl_hours,
    )

    # Prepare localized template variables
    extra_vars = {
        "first_name": user.first_name or getattr(user, "username", ""),
        url_param_name: action_url,
        "ttl_hours": ttl_hours,
    }
    template_vars = get_localized_template_variables(
        purpose=purpose,
        user_locale=user_locale,
        **extra_vars,
    )

    # Send via Resend template
    success = _send_template_email(
        to=user.email,
        template_id=template_id,
        template_variables=template_vars,
        subject=template_vars.get("subject", ""),
    )

    if success:
        update_last_sent_time(purpose, user_id)

    return success


def send_verification_email(user, user_locale: str = "en") -> bool:
    """
    Send email verification link to the user using a Resend template.
    Delegates to _send_purpose_email with email-verify specific parameters.
    """
    return _send_purpose_email(
        purpose=PURPOSE_EMAIL_VERIFY,
        user=user,
        user_locale=user_locale,
        template_id=settings.RESEND_TEMPLATE_EMAIL_VERIFY,
        ttl_hours=settings.MAIL_VERIFICATION_TOKEN_TTL_HOURS,
        url_path="verify-email",
        url_param_name="verification_url",
    )


def send_password_reset_email(user, user_locale: str = "en") -> bool:
    """
    Send password reset link to the user using a Resend template.
    Delegates to _send_purpose_email with password-reset specific parameters.
    """
    return _send_purpose_email(
        purpose=PURPOSE_PASSWORD_RESET,
        user=user,
        user_locale=user_locale,
        template_id=settings.RESEND_TEMPLATE_PASSWORD_RESET,
        ttl_hours=settings.MAIL_PASSWORD_RESET_TOKEN_TTL_HOURS,
        url_path="reset-password",
        url_param_name="reset_url",
    )


def verify_email_token(token_uuid: str):
    """
    Check email verification token from Redis.
    If token is valid, activate the user.

    Returns:
      - User: activated user object

    Returns None if:
      - Token is invalid/expired
      - Token is stale (newer token exists)
      - User not found
    """
    from django.contrib.auth import get_user_model

    User = get_user_model()

    data = get_token_data(token_uuid)
    if data is None:
        return None

    if data["purpose"] != PURPOSE_EMAIL_VERIFY:
        return None

    # Verify this is the most recent valid token for this user
    current_token = get_current_valid_token(PURPOSE_EMAIL_VERIFY, data["user_id"])
    if current_token != token_uuid:
        return None

    try:
        user = User.objects.get(id=data["user_id"])
    except User.DoesNotExist:
        return None

    # Invalidate token first to prevent replay attacks
    invalidate_token(token_uuid)

    user.is_active = True
    user.save(update_fields=["is_active"])

    return user


def reset_password_with_token(token_uuid: str, new_password: str):
    """
    Reset password using a valid token.

    Returns:
      - User: user whose password was reset

    Returns None if:
      - Token is invalid/expired
      - Token is stale (newer token exists)
      - User not found
    """
    from django.contrib.auth import get_user_model

    User = get_user_model()

    data = get_token_data(token_uuid)
    if data is None:
        return None

    if data["purpose"] != PURPOSE_PASSWORD_RESET:
        return None

    # Verify this is the most recent valid token for this user
    current_token = get_current_valid_token(PURPOSE_PASSWORD_RESET, data["user_id"])
    if current_token != token_uuid:
        return None

    try:
        user = User.objects.get(id=data["user_id"])
    except User.DoesNotExist:
        return None

    # Invalidate token first to prevent replay attacks
    invalidate_token(token_uuid)

    user.set_password(new_password)
    user.save(update_fields=["password"])

    return user

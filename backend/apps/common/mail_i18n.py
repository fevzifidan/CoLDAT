"""
Mail template variable'lari icin key-based localization modulu.

Resend template'lerinde kullanilacak lokalize edilmis degiskenleri
Django gettext altyapisi ile Ingilizce ve Turkce olarak saglar.

Kullanim:
    >>> from apps.common.mail_i18n import get_localized_template_variables
    >>> vars = get_localized_template_variables("email_verify", "tr", verify_url="...")
"""

from django.utils.translation import activate, get_language
from django.utils.translation import gettext as _


def get_localized_template_variables(
    purpose: str,
    user_locale: str = "en",
    **extra_vars,
) -> dict:
    """
    Purpose'a gore lokalize edilmis template degiskenlerini dondurur.

    Args:
        purpose: "email_verify" | "password_reset"
        user_locale: "en" | "tr"
        **extra_vars: verify_url, reset_url, ttl_hours, app_name gibi
                      ek degiskenler (URL gibi lokale ihtiyac duymayan)

    Returns:
        Resend template variable'lari icin dict
    """
    previous_lang = get_language()
    try:
        activate(user_locale)

        # Tum maillerde ortak degiskenler
        base_vars = {
            "app_name": _("mail.app_name"),
            "company_name": _("mail.company_name"),
            "support_email": _("mail.support_email"),
        }

        if purpose == "email_verify":
            specific_vars = {
                "title": _("mail.verify_email.title"),
                "heading": _("mail.verify_email.heading"),
                "body_text": _("mail.verify_email.body_text"),
                "button_text": _("mail.verify_email.button_text"),
                "footer_note": _("mail.verify_email.footer_note").format(
                    hours=extra_vars.get("ttl_hours", 24)
                ),
            }
        elif purpose == "password_reset":
            specific_vars = {
                "title": _("mail.password_reset.title"),
                "heading": _("mail.password_reset.heading"),
                "body_text": _("mail.password_reset.body_text"),
                "button_text": _("mail.password_reset.button_text"),
                "footer_note": _("mail.password_reset.footer_note").format(
                    hours=extra_vars.get("ttl_hours", 1)
                ),
                "ignore_warning": _("mail.password_reset.ignore_warning"),
            }
        else:
            specific_vars = {}

        return {**base_vars, **specific_vars, **extra_vars}

    finally:
        activate(previous_lang)


# ---------------------------------------------------------------------------
# Resend template'lerinde kullanilan variable anahtarlari (dokumantasyon)
# ---------------------------------------------------------------------------
# Email Verification template variables:
#   - {{ app_name }}
#   - {{ company_name }}
#   - {{ support_email }}
#   - {{ title }}
#   - {{ heading }}
#   - {{ body_text }}
#   - {{ button_text }}
#   - {{ footer_note }}
#   - {{ verify_url }}
#
# Password Reset template variables:
#   - {{ app_name }}
#   - {{ company_name }}
#   - {{ support_email }}
#   - {{ title }}
#   - {{ heading }}
#   - {{ body_text }}
#   - {{ button_text }}
#   - {{ footer_note }}
#   - {{ ignore_warning }}
#   - {{ reset_url }}

"""
Mail template variable'lari icin key-based localization modulu.

Resend template'lerinde kullanilacak lokalize edilmis degiskenleri
Django gettext altyapisi ile Ingilizce ve Turkce olarak saglar.

Kullanim:
    >>> from apps.common.mail_i18n import get_localized_template_variables
    >>> vars = get_localized_template_variables("email_verify", "tr",
    ...         verification_url="https://...", first_name="Ahmet", ttl_hours=24)
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

    Resend template variable anahtarlari ile birebir eslesir.

    Args:
        purpose: "email_verify" | "password_reset"
        user_locale: "en" | "tr"
        **extra_vars:
            verification_url / reset_url (zorunlu)
            first_name (opsiyonel - kullanici adi veya bos string)
            ttl_hours (opsiyonel - varsayilan 24/1)
    Returns:
        Resend template variable'lari icin dict
    """
    previous_lang = get_language()
    try:
        activate(user_locale)

        if purpose == "email_verify":
            return {
                "brand_name": _("mail.brand_name"),
                "verify_heading": _("mail.verify_email.heading"),
                "greeting": _("mail.verify_email.greeting"),
                "first_name": extra_vars.get("first_name", ""),
                "intro_message": _("mail.verify_email.intro_text"),
                "cta_instruction": _("mail.verify_email.cta_instruction_text"),
                "cta_label": _("mail.verify_email.cta_label_text"),
                "expiry_notice": _("mail.verify_email.expiry_notice_text").format(
                    hours=extra_vars.get("ttl_hours", 24)
                ),
                "fallback_instruction": _("mail.verify_email.fallback_instruction_text"),
                "verification_url": extra_vars.get("verification_url", ""),
                "security_notice": _("mail.verify_email.security_notice_text"),
                "footer_text": _("mail.footer_text"),
                "subject": _("mail.verify_email.subject"),
            }

        elif purpose == "password_reset":
            return {
                "brand_name": _("mail.brand_name"),
                "reset_heading": _("mail.password_reset.heading"),
                "greeting": _("mail.password_reset.greeting"),
                "first_name": extra_vars.get("first_name", ""),
                "intro_message": _("mail.password_reset.intro_text"),
                "cta_instruction": _("mail.password_reset.cta_instruction_text"),
                "cta_label": _("mail.password_reset.cta_label_text"),
                "expiry_notice": _("mail.password_reset.expiry_notice_text").format(
                    hours=extra_vars.get("ttl_hours", 1)
                ),
                "fallback_instruction": _("mail.password_reset.fallback_instruction_text"),
                "reset_url": extra_vars.get("reset_url", ""),
                "security_notice": _("mail.password_reset.security_notice_text"),
                "footer_text": _("mail.footer_text"),
                "subject": _("mail.password_reset.subject"),
            }
        return {}
    finally:
        activate(previous_lang)


# ---------------------------------------------------------------------------
# Resend template'lerinde kullanilan variable anahtarlari (dokumantasyon)
# ---------------------------------------------------------------------------
# Email Verification template variables:
#   - {{{ brand_name }}}
#   - {{{ verify_heading }}}
#   - {{{ greeting }}}
#   - {{{ first_name }}}
#   - {{{ intro_message }}}
#   - {{{ cta_instruction }}}
#   - {{{ cta_label }}}
#   - {{{ expiry_notice }}}
#   - {{{ fallback_instruction }}}
#   - {{{ verification_url }}}
#   - {{{ security_notice }}}
#   - {{{ footer_text }}}
#
# Password Reset template variables:
#   - {{{ brand_name }}}
#   - {{{ reset_heading }}}
#   - {{{ greeting }}}
#   - {{{ first_name }}}
#   - {{{ intro_message }}}
#   - {{{ cta_instruction }}}
#   - {{{ cta_label }}}
#   - {{{ expiry_notice }}}
#   - {{{ fallback_instruction }}}
#   - {{{ reset_url }}}
#   - {{{ security_notice }}}
#   - {{{ footer_text }}}
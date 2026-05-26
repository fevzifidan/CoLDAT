"""
Redis tabanli rate limiting ve token yonetimi.

Veri modeli (Redis key'leri):
  - mail_rate_limit:{purpose}:{user_id} --> ISO timestamp (son gonderim)
  - mail_token:{purpose}:{user_id}      --> token_uuid (en son gecerli token)
  - mail_token_lookup:{token_uuid}      --> {"user_id": ..., "purpose": ...}
"""

import json
from datetime import datetime, timezone
from typing import Optional

from django.conf import settings
from django.core.cache import cache

# Redis'te kullanilacak key prefix'leri
_RATE_LIMIT_PREFIX = "mail_rate_limit"
_TOKEN_PREFIX = "mail_token"
_TOKEN_LOOKUP_PREFIX = "mail_token_lookup"


def _rate_limit_key(purpose: str, user_id: str) -> str:
    return f"{_RATE_LIMIT_PREFIX}:{purpose}:{user_id}"


def _token_key(purpose: str, user_id: str) -> str:
    return f"{_TOKEN_PREFIX}:{purpose}:{user_id}"


def _token_lookup_key(token_uuid: str) -> str:
    return f"{_TOKEN_LOOKUP_PREFIX}:{token_uuid}"


def check_rate_limit(purpose: str, user_id: str) -> Optional[int]:
    """
    Rate limit kontrolu.

    Returns:
      - None: limit asilmamis, mail gonderilebilir.
      - int: kalan bekleme suresi (saniye), 429 dondurulmeli.
    """
    key = _rate_limit_key(purpose, user_id)
    last_sent_str = cache.get(key)

    if last_sent_str is None:
        return None  # Daha once mail gonderilmemis

    try:
        last_sent = datetime.fromisoformat(last_sent_str)
    except (ValueError, TypeError):
        return None

    now = datetime.now(timezone.utc)
    elapsed = (now - last_sent).total_seconds()
    cooldown = settings.MAIL_RATE_LIMIT_SECONDS  # 600 sn = 10 dk

    if elapsed < cooldown:
        remaining = int(cooldown - elapsed)
        return remaining

    return None


def update_last_sent_time(purpose: str, user_id: str):
    """Son mail gonderim zamanini Redis'e kaydeder.
    TTL olarak MAIL_RATE_LIMIT_SECONDS kullanilir, boylece key otomatik temizlenir."""
    key = _rate_limit_key(purpose, user_id)
    now_iso = datetime.now(timezone.utc).isoformat()
    cache.set(key, now_iso, timeout=settings.MAIL_RATE_LIMIT_SECONDS)


def store_token(
    purpose: str,
    user_id: str,
    token_uuid: str,
    ttl_hours: int,
):
    """
    Token'i Redis'e kaydeder.
    - Ayni {purpose}:{user_id} icin eski token'in uzerine yazar (onceki token gecersiz olur).
    - Token lookup key'i de TTL ile kaydedilir.
    """
    ttl_seconds = ttl_hours * 3600

    # En son gecerli token'i kaydet (onceki otomatik override olur)
    token_key = _token_key(purpose, user_id)
    cache.set(token_key, token_uuid, timeout=ttl_seconds)

    # Token -> user mapping (dogrulama aninda kullanilacak)
    lookup_key = _token_lookup_key(token_uuid)
    lookup_data = json.dumps({"user_id": user_id, "purpose": purpose})
    cache.set(lookup_key, lookup_data, timeout=ttl_seconds)


def get_token_data(token_uuid: str) -> Optional[dict]:
    """
    Token UUID'sinden kullanici ve amac bilgisini alir.

    Returns:
      - dict: {"user_id": str, "purpose": str} veya None (gecersiz/expired token)
    """
    lookup_key = _token_lookup_key(token_uuid)
    raw = cache.get(lookup_key)

    if raw is None:
        return None

    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        return None


def invalidate_token(token_uuid: str):
    """Token'i gecersiz kilar (kullanildiktan sonra)."""
    lookup_key = _token_lookup_key(token_uuid)
    cache.delete(lookup_key)


def get_current_valid_token(purpose: str, user_id: str) -> Optional[str]:
    """
    Kullanici icin en son gecerli (en guncel) token UUID'sini dondurur.
    """
    token_key = _token_key(purpose, user_id)
    return cache.get(token_key)


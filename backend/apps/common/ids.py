import secrets
import threading
import time
import uuid


_RANDOM_BITS = 74
_RANDOM_MASK = (1 << _RANDOM_BITS) - 1
_generation_lock = threading.Lock()
_last_timestamp_ms = -1
_last_random = 0


def uuid7() -> uuid.UUID:
    """Return a process-monotonic UUIDv7 value as defined by RFC 9562."""
    global _last_random, _last_timestamp_ms

    timestamp_ms = time.time_ns() // 1_000_000

    with _generation_lock:
        if timestamp_ms > _last_timestamp_ms:
            random_bits = secrets.randbits(_RANDOM_BITS)
        else:
            timestamp_ms = _last_timestamp_ms
            random_bits = (_last_random + 1) & _RANDOM_MASK

            if random_bits == 0:
                timestamp_ms += 1
                random_bits = secrets.randbits(_RANDOM_BITS)

        _last_timestamp_ms = timestamp_ms
        _last_random = random_bits

    random_a = random_bits >> 62
    random_b = random_bits & ((1 << 62) - 1)

    value = (
        (timestamp_ms & ((1 << 48) - 1)) << 80
        | 0x7 << 76
        | random_a << 64
        | 0b10 << 62
        | random_b
    )

    return uuid.UUID(int=value)

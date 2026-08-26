"""
A minimal in-memory, per-process TTL cache.

Deliberately simple: no Redis, no shared state between processes. This is
enough for a single-instance MVP backend and avoids running extra
infrastructure the assignment doesn't require.

Limitation (documented, not hidden): the cache lives only in this process's
memory. It is empty after every restart and is not shared across multiple
backend instances -- a production deployment with several instances would
need a shared cache (e.g. Redis) to get consistent cache hits.
"""
import time
from typing import Generic, TypeVar

T = TypeVar("T")


class TTLCache(Generic[T]):
    def __init__(self) -> None:
        self._store: dict[str, tuple[float, T]] = {}

    def get(self, key: str) -> T | None:
        entry = self._store.get(key)
        if entry is None:
            return None
        expires_at, value = entry
        if time.monotonic() >= expires_at:
            del self._store[key]
            return None
        return value

    def set(self, key: str, value: T, ttl_seconds: float) -> None:
        self._store[key] = (time.monotonic() + ttl_seconds, value)

# @author: Roy Meoded
# @date: 27.08.2026
# @description: Minimal in-memory rate limiter for unauthenticated endpoints (login, signup).

"""
A minimal in-memory, per-process, fixed-window rate limiter.

Deliberately simple, matching `core/cache.py`'s tradeoff: no Redis, no
shared state between processes. Enough to blunt brute-force login attempts
and signup spam on a single-instance MVP backend; a multi-instance
deployment would need a shared store (e.g. Redis) for this to hold across
instances.

Keyed by client IP -- fine for this MVP's threat model (slowing down a
single attacker), not a defense against a distributed attack.
"""
import time

from fastapi import HTTPException, Request, status


class _FixedWindowLimiter:
    def __init__(self) -> None:
        # key -> (window_start_monotonic, count)
        self._hits: dict[str, tuple[float, int]] = {}

    def check(self, key: str, max_requests: int, window_seconds: float) -> None:
        now = time.monotonic()
        window_start, count = self._hits.get(key, (now, 0))

        if now - window_start >= window_seconds:
            # Window expired -- start a fresh one.
            window_start, count = now, 0

        count += 1
        self._hits[key] = (window_start, count)

        if count > max_requests:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Too many requests. Please try again later.",
            )

    def reset(self) -> None:
        """Test-only escape hatch -- without this, state from one test's
        signups/logins would leak into every later test in the same pytest
        process, since this limiter is a single module-level singleton."""
        self._hits.clear()


_limiter = _FixedWindowLimiter()


def rate_limit(max_requests: int, window_seconds: float):
    """FastAPI dependency factory -- use as
    `Depends(rate_limit(5, 3600))` for 5 requests per hour per client IP."""

    def _dependency(request: Request) -> None:
        client_ip = request.client.host if request.client else "unknown"
        _limiter.check(f"{request.url.path}:{client_ip}", max_requests, window_seconds)

    return _dependency

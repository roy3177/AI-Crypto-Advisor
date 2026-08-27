# @author: Roy Meoded
# @date: 27.08.2026
# @description: HTTP client for fetching market news from CryptoPanic, with a static fallback.

"""
CryptoPanic client -- market news.

The official docs site (cryptopanic.com/developers/api) blocks automated
access, so the exact response field list was cross-checked against
CryptoPanic's own integration guide and community client libraries
(checked 2026-08): requests need an `auth_token` query parameter, and the
base URL includes an account-plan segment shown on your own CryptoPanic
dashboard after signing up -- see `CRYPTOPANIC_API_BASE` in
app/core/config.py if your plan's URL differs from the default guess.

Treated as fully optional: if no API key is configured, the service layer
skips this client entirely and uses the static fallback instead of calling
it at all.
"""
import httpx

from app.clients.errors import (
    ProviderBadResponseError,
    ProviderRateLimitedError,
    ProviderTimeoutError,
    ProviderUnauthorizedError,
    ProviderUnavailableError,
)
from app.core.config import get_settings

settings = get_settings()

_TIMEOUT = httpx.Timeout(connect=3.0, read=5.0, write=5.0, pool=3.0)


class CryptoNewsClient:
    def __init__(self, http_client: httpx.AsyncClient | None = None) -> None:
        self._client = http_client or httpx.AsyncClient(base_url=settings.cryptopanic_api_base, timeout=_TIMEOUT)
        self._owns_client = http_client is None

    async def aclose(self) -> None:
        if self._owns_client:
            await self._client.aclose()

    async def get_posts(self, currencies: list[str] | None = None) -> list[dict]:
        """Returns the raw list of post objects from CryptoPanic's `results` array."""
        if not settings.cryptopanic_api_key:
            raise ProviderUnauthorizedError("CryptoPanic API key is not configured")

        params: dict[str, str] = {"auth_token": settings.cryptopanic_api_key}
        if currencies:
            params["currencies"] = ",".join(currencies)

        try:
            response = await self._client.get("/posts/", params=params)
        except httpx.TimeoutException as exc:
            raise ProviderTimeoutError("CryptoPanic request timed out") from exc
        except httpx.RequestError as exc:
            raise ProviderUnavailableError("CryptoPanic request failed") from exc

        if response.status_code == 401:
            raise ProviderUnauthorizedError("CryptoPanic rejected the API key")
        if response.status_code == 429:
            raise ProviderRateLimitedError("CryptoPanic rate limit exceeded")
        if response.status_code >= 500:
            raise ProviderUnavailableError(f"CryptoPanic server error: {response.status_code}")
        if response.status_code >= 400:
            raise ProviderBadResponseError(f"CryptoPanic rejected the request: {response.status_code}")

        try:
            data = response.json()
        except ValueError as exc:
            raise ProviderBadResponseError("CryptoPanic returned invalid JSON") from exc

        results = data.get("results") if isinstance(data, dict) else None
        if not isinstance(results, list):
            raise ProviderBadResponseError("CryptoPanic returned an unexpected response shape")

        return results

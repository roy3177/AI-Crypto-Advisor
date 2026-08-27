# @author: Roy Meoded
# @date: 27.08.2026
# @description: HTTP client for generating AI insights via OpenRouter, with timeout and safe fallback handling.

"""
OpenRouter client -- text generation for the daily AI insight.

Verified against the current official docs (openrouter.ai/docs, checked
2026-08): OpenAI-compatible `POST /chat/completions`, bearer auth, generated
text at `choices[0].message.content`.

The free-tier model roster genuinely rotates: the original default here
(`openai/gpt-oss-20b:free`) was confirmed free at implementation time but
returned a live 404 the same week, and `GET /api/v1/models` (public, no
key needed) showed it had moved to the paid tier. The default was updated
to `google/gemma-4-31b-it:free` after checking that live list -- `AI_MODEL`
is fully configurable so the next rotation is a config change, not a code
change.
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


class OpenRouterClient:
    def __init__(self, http_client: httpx.AsyncClient | None = None) -> None:
        timeout = httpx.Timeout(
            connect=3.0, read=settings.ai_request_timeout_seconds, write=5.0, pool=3.0
        )
        self._client = http_client or httpx.AsyncClient(base_url=settings.openrouter_api_base, timeout=timeout)
        self._owns_client = http_client is None

    async def aclose(self) -> None:
        if self._owns_client:
            await self._client.aclose()

    async def generate_text(self, system_prompt: str, user_prompt: str) -> str:
        """Sends a single-turn chat completion request and returns the
        generated text content (not yet safety- or length-validated --
        that happens in the insight service)."""
        if not settings.openrouter_api_key:
            raise ProviderUnauthorizedError("OpenRouter API key is not configured")

        payload = {
            "model": settings.ai_model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            "max_tokens": settings.ai_max_output_tokens,
            "temperature": 0.4,
        }
        headers = {"Authorization": f"Bearer {settings.openrouter_api_key}"}

        try:
            response = await self._client.post("/chat/completions", json=payload, headers=headers)
        except httpx.TimeoutException as exc:
            raise ProviderTimeoutError("OpenRouter request timed out") from exc
        except httpx.RequestError as exc:
            raise ProviderUnavailableError("OpenRouter request failed") from exc

        if response.status_code == 401:
            raise ProviderUnauthorizedError("OpenRouter rejected the API key")
        if response.status_code == 429:
            raise ProviderRateLimitedError("OpenRouter rate limit exceeded")
        if response.status_code >= 500:
            raise ProviderUnavailableError(f"OpenRouter server error: {response.status_code}")
        if response.status_code >= 400:
            raise ProviderBadResponseError(f"OpenRouter rejected the request: {response.status_code}")

        try:
            data = response.json()
            content = data["choices"][0]["message"]["content"]
        except (ValueError, KeyError, IndexError, TypeError) as exc:
            raise ProviderBadResponseError("OpenRouter returned an unexpected response shape") from exc

        if not isinstance(content, str):
            raise ProviderBadResponseError("OpenRouter returned non-text content")

        return content

# @author: Roy Meoded
# @date: 27.08.2026
# @description: Centralized application settings loaded from environment variables.

"""
Centralized application configuration.

All values are read from environment variables (typically loaded from a
local `.env` file during development, or injected by the hosting platform
in production). Nothing here should contain a real secret -- only defaults
that are safe to commit.
"""
from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    # General
    environment: str = "development"
    debug: bool = True

    # Database
    database_url: str = "postgresql+psycopg2://postgres:postgres@localhost:5432/crypto_advisor"

    # Auth / JWT
    jwt_secret: str = "changeme-in-env-file"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 60 * 24  # 24 hours

    # CORS - comma-separated list of allowed origins in production
    cors_origins: str = "http://localhost:3000"

    # External providers (all optional so the app can boot without them
    # and fall back gracefully -- see /integrate-crypto-data and
    # /generate-ai-insights).
    coingecko_api_base: str = "https://api.coingecko.com/api/v3"
    coingecko_api_key: str | None = None

    # CryptoPanic's base URL includes an account-plan segment shown on your
    # own dashboard after signing up (e.g. ".../api/free/v2" or
    # ".../api/developer/v2") -- update this if it differs from the default.
    cryptopanic_api_base: str = "https://cryptopanic.com/api/free/v2"
    cryptopanic_api_key: str | None = None

    openrouter_api_key: str | None = None
    openrouter_api_base: str = "https://openrouter.ai/api/v1"
    # Free-tier model availability on OpenRouter rotates -- verify this is
    # still free at https://openrouter.ai/models?max_price=0 periodically.
    # (openai/gpt-oss-20b:free was the default until 2026-08-26, when it was
    # confirmed removed from the free tier via a live 404 and replaced.)
    ai_model: str = "google/gemma-4-31b-it:free"
    ai_request_timeout_seconds: float = 20.0
    ai_max_output_tokens: int = 300

    # In-memory cache TTLs (seconds) for external market data.
    price_cache_ttl_seconds: int = 60
    news_cache_ttl_seconds: int = 300

    @property
    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    """Return a cached Settings instance so the environment is parsed once."""
    return Settings()

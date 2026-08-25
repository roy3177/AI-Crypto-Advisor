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
    cryptopanic_api_key: str | None = None
    openrouter_api_key: str | None = None
    openrouter_api_base: str = "https://openrouter.ai/api/v1"

    @property
    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    """Return a cached Settings instance so the environment is parsed once."""
    return Settings()

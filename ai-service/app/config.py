"""
Totoro AI Service — Configuration
Loads settings from .env file via Pydantic Settings.
"""

from functools import lru_cache
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # ── Gemini API ───────────────────────────────────────────────────
    gemini_api_key: str = "not-set"
    gemini_model: str = "gemini-3-flash-preview"

    # ── Spring Boot Backend ──────────────────────────────────────────
    backend_base_url: str = "http://localhost:8080/api"
    social_service_url: str = ""
    core_service_url: str = ""

    # ── AI Service Server ────────────────────────────────────────────
    ai_service_host: str = "0.0.0.0"
    ai_service_port: int = 8000

    # ── Feature Flags ────────────────────────────────────────────────
    enable_flow2_proactive: bool = False
    use_mock_clients: bool = True

    # ── Internal API Key (shared with Spring Boot for /api/internal/**)
    internal_api_key: str = ""

    # ── CORS ─────────────────────────────────────────────────────────
    cors_origins: list[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "https://se361-totoro-fe.vercel.app",
        "https://se361-totoro-fe.vercel.app/"
    ]

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


@lru_cache
def get_settings() -> Settings:
    """Cached settings singleton."""
    return Settings()

"""Base HTTP client for calling Spring Boot backend APIs."""

import re
import httpx
from app.config import get_settings


def _camel_to_snake(name: str) -> str:
    """Convert camelCase to snake_case."""
    s1 = re.sub(r'(.)([A-Z][a-z]+)', r'\1_\2', name)
    return re.sub(r'([a-z0-9])([A-Z])', r'\1_\2', s1).lower()


def normalize_keys(data):
    """Recursively convert dict keys from camelCase to snake_case."""
    if isinstance(data, dict):
        return {_camel_to_snake(k): normalize_keys(v) for k, v in data.items()}
    if isinstance(data, list):
        return [normalize_keys(item) for item in data]
    return data


class BaseClient:
    """Async HTTP client wrapper for Spring Boot backend."""

    def __init__(self, base_path: str = ""):
        settings = get_settings()
        self.base_url = f"{settings.backend_base_url}{base_path}"
        self.use_mock = settings.use_mock_clients
        self._internal_api_key = settings.internal_api_key

    def _get_client(self, auth_token: str | None = None, internal: bool = False) -> httpx.AsyncClient:
        headers = {"Content-Type": "application/json"}
        if auth_token:
            headers["Authorization"] = f"Bearer {auth_token}"
        if internal and self._internal_api_key:
            headers["X-Internal-Key"] = self._internal_api_key
        return httpx.AsyncClient(
            base_url=self.base_url,
            timeout=10.0,
            headers=headers,
        )

    async def _get(self, path: str, params: dict | None = None, auth_token: str | None = None) -> dict | list:
        async with self._get_client(auth_token) as client:
            response = await client.get(path, params=params)
            response.raise_for_status()
            return response.json()

    async def _post(self, path: str, data: dict | None = None, auth_token: str | None = None, internal: bool = False) -> dict:
        async with self._get_client(auth_token, internal=internal) as client:
            response = await client.post(path, json=data)
            response.raise_for_status()
            return response.json()


class InternalClient(BaseClient):
    """Client for /api/internal/** endpoints (service-to-service, API key auth)."""

    def __init__(self, base_path: str = ""):
        settings = get_settings()
        # Determine specific service base URL to bypass gateway for internal communication
        if base_path.startswith("/saved-listings"):
            base_url = settings.core_service_url or settings.backend_base_url
        elif base_path.startswith("/notifications") or base_path.startswith("/conversations") or base_path.startswith("/matching"):
            base_url = settings.social_service_url or settings.backend_base_url
        else:
            base_url = settings.backend_base_url

        # Remove trailing slash and /api if present
        base_url = base_url.rstrip("/")
        if base_url.endswith("/api"):
            base_url = base_url[:-4]
        base_url = base_url.rstrip("/")

        self.base_url = f"{base_url}/api/internal{base_path}"
        self.use_mock = settings.use_mock_clients
        self._internal_api_key = settings.internal_api_key

    async def _post_internal(self, path: str, data: dict) -> dict:
        return await self._post(path, data=data, internal=True)

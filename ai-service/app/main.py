"""
Totoro AI Service — Main Application
FastAPI server with CORS, routers, and health check.
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.routers import agent_router, webhook_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifecycle: startup and shutdown."""
    settings = get_settings()
    print(f"🌿 Totoro AI Service starting...")
    print(f"   Model: {settings.gemini_model}")
    print(f"   Backend: {settings.backend_base_url}")
    print(f"   Mock clients: {settings.use_mock_clients}")
    print(f"   Flow 2 (Proactive): {'Enabled' if settings.enable_flow2_proactive else 'Disabled'}")
    yield
    print("🌿 Totoro AI Service shutting down...")


app = FastAPI(
    title="Totoro AI Service",
    description="Agentic AI for room search, roommate matching, and smart notifications",
    version="1.0.0",
    lifespan=lifespan,
)

# ── CORS ─────────────────────────────────────────────────────────────
settings = get_settings()
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ──────────────────────────────────────────────────────────
app.include_router(agent_router.router, prefix="/agent", tags=["Agent"])
app.include_router(webhook_router.router, prefix="/agent", tags=["Webhook"])


# ── Health Check ─────────────────────────────────────────────────────

@app.get("/health", tags=["System"])
async def health():
    return {
        "status": "ok",
        "service": "totoro-ai",
        "version": "1.0.0",
        "mock_mode": settings.use_mock_clients,
    }

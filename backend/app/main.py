"""
FastAPI application entry point.

Keeps only app wiring here: settings, middleware, and router registration.
Actual request handling lives in `app/api/routes/*`, and business logic
lives in `app/services/*` -- this file should stay small forever.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import auth, health, insights, market, memes, preferences
from app.core.config import get_settings

settings = get_settings()

app = FastAPI(
    title="Moveo AI Crypto Advisor API",
    debug=settings.debug,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check is intentionally outside the /api prefix (matches the
# convention documented in CLAUDE.md).
app.include_router(health.router)
app.include_router(auth.router, prefix="/api/auth")
app.include_router(preferences.router, prefix="/api/preferences")
app.include_router(market.router, prefix="/api/market")
app.include_router(insights.router, prefix="/api/insights")
app.include_router(memes.router, prefix="/api/memes")

# Future routers (all under /api, added in later phases):
# app.include_router(market.router, prefix="/api/market", tags=["market"])
# app.include_router(insights.router, prefix="/api/insights", tags=["insights"])
# app.include_router(feedback.router, prefix="/api/feedback", tags=["feedback"])
# app.include_router(dashboard.router, prefix="/api/dashboard", tags=["dashboard"])

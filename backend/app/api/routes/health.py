# @author: Roy Meoded
# @date: 27.08.2026
# @description: Public liveness-check endpoint.

"""Liveness check used by the hosting platform and by manual smoke tests."""
from fastapi import APIRouter

router = APIRouter(tags=["health"])


@router.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}

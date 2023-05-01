"""API router assembly. Port of server_node/src/api/index.ts mount table.

Prefixes never drift from this file. Routers with global authorize() in Node
(chat, notification, offer) get their dependency applied at include time here
(when those routers land in Phase 4).
"""

from fastapi import APIRouter

from app.api.v1.account import router as account_router
from app.api.v1.asset import router as asset_router
from app.api.v1.criteria import router as criteria_router
from app.api.v1.match import router as match_router
from app.api.v1.suggestion import router as suggestion_router
from app.api.v1.user import router as user_router

api_router = APIRouter(tags=["api"])
api_router.include_router(account_router)
api_router.include_router(user_router)
api_router.include_router(asset_router)
api_router.include_router(criteria_router)
api_router.include_router(match_router)
api_router.include_router(suggestion_router)


@api_router.get("/_ping", include_in_schema=False)
async def _ping() -> dict[str, bool]:
    return {"ok": True}

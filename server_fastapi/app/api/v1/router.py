"""API router assembly. Port of server_node/src/api/index.ts mount table.

Feature routers land in Phase 2+ tasks; this file keeps the mount table so
prefixes never drift. Routers with global authorize() in Node (chat,
notification, offer) get their dependency applied at include time here.
"""

from fastapi import APIRouter

api_router = APIRouter(tags=["api"])


@api_router.get("/_ping", include_in_schema=False)
async def _ping() -> dict[str, bool]:
    return {"ok": True}

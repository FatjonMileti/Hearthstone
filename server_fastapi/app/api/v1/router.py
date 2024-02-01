"""API router assembly. Port of server_node/src/api/index.ts mount table.

Prefixes never drift from this file. Routers with global authorize() in Node
(chat, notification, offer) declare it at router level in their modules.
"""

from fastapi import APIRouter

from app.api.v1.account import router as account_router
from app.api.v1.admin import router as admin_router
from app.api.v1.asset import router as asset_router
from app.api.v1.chat import router as chat_router
from app.api.v1.criteria import router as criteria_router
from app.api.v1.document import router as document_router
from app.api.v1.docusign import router as docusign_router
from app.api.v1.external_feed import router as external_feed_router
from app.api.v1.file import router as file_router
from app.api.v1.map import router as map_router
from app.api.v1.match import router as match_router
from app.api.v1.notification import router as notification_router
from app.api.v1.offer import router as offer_router
from app.api.v1.suggestion import router as suggestion_router
from app.api.v1.user import router as user_router
from app.api.v1.video import router as video_router

api_router = APIRouter(tags=["api"])
api_router.include_router(account_router)
api_router.include_router(user_router)
api_router.include_router(asset_router)
api_router.include_router(criteria_router)
api_router.include_router(match_router)
api_router.include_router(map_router)
api_router.include_router(chat_router)
api_router.include_router(document_router)
api_router.include_router(docusign_router)
api_router.include_router(notification_router)
api_router.include_router(offer_router)
api_router.include_router(suggestion_router)
api_router.include_router(file_router)
api_router.include_router(admin_router)
api_router.include_router(external_feed_router)
api_router.include_router(video_router)


@api_router.get("/_ping", include_in_schema=False)
async def _ping() -> dict[str, bool]:
    return {"ok": True}

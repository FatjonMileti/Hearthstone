"""Notification router. Port of Notification/notification.controller.ts.

Auth is global (like api/index.ts). PARITY QUIRK: read is GET /:id carrying
{viewed} in the body — FastAPI accepts a body on GET when declared.
"""

from typing import Any

from fastapi import APIRouter, Depends, Request
from fastapi.responses import PlainTextResponse

from app.api.deps import CurrentUser, get_current_user, validate_object_id
from app.services import notification_service

router = APIRouter(
    prefix="/notification",
    tags=["notification"],
    dependencies=[Depends(get_current_user)],
)


def _db(request: Request) -> Any:
    return request.app.state.db


@router.get("/", status_code=200)
async def list_all(request: Request, user: CurrentUser):  # type: ignore[no-untyped-def]
    return await notification_service.list_notifications(_db(request), user["user_id"])


@router.get("/unread", status_code=200)
async def unread(request: Request, user: CurrentUser):  # type: ignore[no-untyped-def]
    return await notification_service.unread_count(_db(request), user["user_id"])


@router.get("/{id}", status_code=200)
async def read(request: Request, id: str, user: CurrentUser, body: dict | None = None):  # type: ignore[no-untyped-def]
    viewed = (body or {}).get("viewed")
    await notification_service.mark_viewed(
        _db(request),
        notification_id=validate_object_id(id),
        user_id=user["user_id"],
        viewed=viewed,
    )
    return PlainTextResponse("", status_code=200)

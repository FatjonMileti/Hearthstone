"""Chat router. Port of Chat/chat.controller.ts route table (order preserved).

Auth is global for this router (like api/index.ts `router.use('/chat', authorize())`).
"""

from typing import Annotated, Any

from fastapi import APIRouter, Depends, Query, Request
from fastapi.responses import PlainTextResponse

from app.api.deps import CurrentUser, Paging, get_current_user, validate_object_id
from app.services import chat_service

router = APIRouter(
    prefix="/chat",
    tags=["chat"],
    dependencies=[Depends(get_current_user)],
)


def _db(request: Request) -> Any:
    return request.app.state.db


def _paging(paging: Paging) -> tuple[int | None, int | None]:
    if paging.pagination_enabled:
        return paging.page, paging.page_size
    return None, None


@router.get("/", status_code=200)
async def list_rooms(
    request: Request,
    user: CurrentUser,
    paging: Paging,
    property: Annotated[str | None, Query()] = None,
):  # type: ignore[no-untyped-def]
    from fastapi import HTTPException

    if property and not _valid_id(property):
        raise HTTPException(status_code=400, detail="Invalid property id")
    page, page_size = _paging(paging)
    return await chat_service.list_rooms(
        _db(request),
        user_id=user["user_id"],
        property_id=property,
        page=page,
        page_size=page_size,
    )


@router.get("/matches/{matchId}", status_code=200)
async def match_room(matchId: str, request: Request, user: CurrentUser):  # type: ignore[no-untyped-def]
    _ = user
    return await chat_service.match_room(_db(request), matchId)


@router.get("/started-conversations", status_code=200)
async def started(request: Request, user: CurrentUser):  # type: ignore[no-untyped-def]
    return await chat_service.started_conversations(_db(request), user["user_id"])


@router.post("/create", status_code=200)
async def create(body: dict, request: Request, user: CurrentUser):  # type: ignore[no-untyped-def]
    _ = user
    return await chat_service.create_room(
        _db(request),
        author=body.get("author"),
        participant=body.get("participant"),
        property=body.get("property"),
    )


@router.put("/read", status_code=200)
async def read(body: dict, request: Request, user: CurrentUser):  # type: ignore[no-untyped-def]
    return await chat_service.read_messages(
        _db(request), room_id=str(body.get("room_id")), user_id=user["user_id"]
    )


@router.get("/room", status_code=200)
async def check_room(
    request: Request,
    user: CurrentUser,
    participant: Annotated[str | None, Query()] = None,
    property: Annotated[str | None, Query()] = None,
):  # type: ignore[no-untyped-def]
    return await chat_service.check_room(
        _db(request),
        me=user["user_id"],
        participant=participant or "",
        property=property,
    )


@router.get("/{id}", status_code=200)
async def messages(id: str, request: Request, user: CurrentUser, paging: Paging):  # type: ignore[no-untyped-def]
    _ = user
    oid = validate_object_id(id)
    page, page_size = _paging(paging)
    return await chat_service.get_messages(
        _db(request), room_id=oid, page=page, page_size=page_size
    )


@router.delete("/{id}", status_code=204)
async def delete(id: str, request: Request, user: CurrentUser):  # type: ignore[no-untyped-def]
    _ = user
    await chat_service.delete_room(_db(request), validate_object_id(id))
    return PlainTextResponse("", status_code=204)


@router.get("/{id}/contract-documents-status", status_code=200)
async def contract_status(id: str, request: Request, user: CurrentUser):  # type: ignore[no-untyped-def]
    return await chat_service.contract_status(
        _db(request), room_id=validate_object_id(id), role=user["role"]
    )


def _valid_id(value: str) -> bool:
    from bson import ObjectId

    return ObjectId.is_valid(value)

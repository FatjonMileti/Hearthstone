"""User router. Port of User/user.controller.ts route table."""

from datetime import datetime
from typing import Annotated, Any

from fastapi import APIRouter, Depends, HTTPException, Query, Request
from fastapi.responses import PlainTextResponse
from pydantic import BaseModel

from app.api.deps import CurrentUser, Paging, validate_object_id
from app.core.config import Settings, get_settings
from app.core.permissions import Action, check_update_user_permission
from app.services import user_service

router = APIRouter(prefix="/user", tags=["user"])


class RegisterBody(BaseModel):
    first_name: str
    last_name: str
    email: str
    password: str


class ForgotBody(BaseModel):
    email: str


class ResetBody(BaseModel):
    token: str
    password: str


def _db(request: Request) -> Any:
    return request.app.state.db


def _parse_bool(value: str | None) -> bool | None:
    if value is None:
        return None
    return value == "true"


def _parse_date(value: str | None) -> datetime | None:
    if not value:
        return None
    try:
        return datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError:
        return None


@router.get("/", status_code=200)
async def list_users(
    request: Request,
    user: CurrentUser,
    paging: Paging,
    search: str | None = None,
    # Node reads snake_case `is_disabled`; apidoc says isDisabled — accept both.
    is_disabled: str | None = Query(default=None),
    isDisabled: str | None = Query(default=None),
    role: str | None = None,
    createdAtSince: str | None = Query(default=None),
    created_atSince: str | None = Query(default=None),
    createdAtUntil: str | None = Query(default=None),
    created_atUntil: str | None = Query(default=None),
):  # type: ignore[no-untyped-def]
    if not _can(user, Action.read, "User"):
        raise HTTPException(status_code=403, detail="forbidden")
    return await user_service.list_users(
        _db(request),
        self_id=validate_object_id(user["user_id"]),
        search=search,
        is_disabled=_parse_bool(is_disabled if is_disabled is not None else isDisabled),
        role=role,
        created_since=_parse_date(createdAtSince or created_atSince),
        created_until=_parse_date(createdAtUntil or created_atUntil),
        page=paging.page if paging.pagination_enabled else None,
        page_size=paging.page_size if paging.pagination_enabled else None,
        sort_field=paging.sort,
        sort_dir=paging.sort_direction,
    )


@router.get("/{id}", status_code=200)
async def get_user(id: str, request: Request, user: CurrentUser):  # type: ignore[no-untyped-def]
    oid = validate_object_id(id)
    check_update_user_permission(user["user_id"], user["role"], id)
    doc = await user_service.get_by_id(_db(request), oid)
    if not doc:
        raise HTTPException(status_code=404, detail="The item does not exist")
    return doc


@router.patch("/{id}", status_code=200)
async def patch_user(id: str, body: dict, request: Request, user: CurrentUser):  # type: ignore[no-untyped-def]
    oid = validate_object_id(id)
    check_update_user_permission(user["user_id"], user["role"], id)
    updated = await user_service.update_user(_db(request), oid, body)
    if not updated:
        raise HTTPException(status_code=404, detail="user_not_found")
    return updated


@router.delete("/", status_code=204)
async def delete_self(request: Request, user: CurrentUser):  # type: ignore[no-untyped-def]
    if not _can(user, Action.delete, "User"):
        raise HTTPException(status_code=403, detail="forbidden")
    # PARITY: DELETE /api/user deletes SELF (no :id) — replicated.
    await user_service.soft_delete_self(_db(request), validate_object_id(user["user_id"]))
    return PlainTextResponse("", status_code=204)


@router.post("/register", status_code=201)
async def register(
    body: RegisterBody, request: Request, settings: Annotated[Settings, Depends(get_settings)]
):  # type: ignore[no-untyped-def]
    return await user_service.create_user(
        _db(request),
        first_name=body.first_name,
        last_name=body.last_name,
        email=body.email,
        password=body.password,
        settings=settings,
    )


@router.post("/forgot-password", status_code=201)
async def forgot_password(
    body: ForgotBody, request: Request, settings: Annotated[Settings, Depends(get_settings)]
):  # type: ignore[no-untyped-def]
    await user_service.send_reset_instructions(
        _db(request), email=body.email, subject="Reset Password", settings=settings
    )
    return PlainTextResponse("ok", status_code=201)


@router.post("/reset-password", status_code=200)
async def reset_password(
    body: ResetBody, request: Request, settings: Annotated[Settings, Depends(get_settings)]
):  # type: ignore[no-untyped-def]
    return await user_service.reset_password(
        _db(request), token=body.token, password=body.password, settings=settings
    )


@router.post("/change-password", status_code=201)
async def change_password(
    request: Request, user: CurrentUser, settings: Annotated[Settings, Depends(get_settings)]
):  # type: ignore[no-untyped-def]
    await user_service.send_reset_instructions(
        _db(request),
        email="",
        subject="Change Password",
        settings=settings,
        for_user_id=validate_object_id(user["user_id"]),
    )
    return PlainTextResponse("ok", status_code=201)


def _can(user: dict, action: Action, subject: str) -> bool:
    from app.core.permissions import can_on_object

    return can_on_object(user["user_id"], user["role"], action, subject, None)

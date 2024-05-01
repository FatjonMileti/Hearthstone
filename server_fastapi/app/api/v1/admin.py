"""Admin router. Port of Agent/admin.controller.ts route table (auth + paging)."""

from typing import Annotated, Any

from fastapi import APIRouter, Query, Request

from app import models
from app.api.deps import CurrentUser, Paging, validate_object_id
from app.services import admin_service

router = APIRouter(prefix="/admin", tags=["admin"])


def _db(request: Request) -> Any:
    return request.app.state.db


def _paging(paging: Paging) -> tuple[int | None, int | None]:
    if paging.pagination_enabled:
        return paging.page, paging.page_size
    return None, None


@router.get("/session", status_code=200)
async def sessions(
    request: Request,
    user: CurrentUser,
    paging: Paging,
    search: Annotated[str | None, Query()] = None,
    action: Annotated[str | None, Query()] = None,
    type_: Annotated[str | None, Query(alias="type")] = None,
):  # type: ignore[no-untyped-def]
    _ = user
    page, page_size = _paging(paging)
    type_filter = type_
    return await admin_service.list_logs(
        _db(request),
        collection=models.LOGIN_LOG,
        search=search,
        action=action,
        type_filter=type_filter,
        page=page,
        page_size=page_size,
    )


@router.get("/property", status_code=200)
async def properties(
    request: Request,
    user: CurrentUser,
    paging: Paging,
    search: Annotated[str | None, Query()] = None,
    action: Annotated[str | None, Query()] = None,
    type_: Annotated[str | None, Query(alias="type")] = None,
):  # type: ignore[no-untyped-def]
    _ = user
    page, page_size = _paging(paging)
    type_filter = type_
    return await admin_service.list_logs(
        _db(request),
        collection=models.PROPERTY_LOG,
        search=search,
        action=action,
        type_filter=type_filter,
        page=page,
        page_size=page_size,
    )


@router.get("/match", status_code=200)
async def matches(
    request: Request,
    user: CurrentUser,
    paging: Paging,
    search: Annotated[str | None, Query()] = None,
    action: Annotated[str | None, Query()] = None,
    type_: Annotated[str | None, Query(alias="type")] = None,
):  # type: ignore[no-untyped-def]
    _ = user
    page, page_size = _paging(paging)
    type_filter = type_
    return await admin_service.list_logs(
        _db(request),
        collection=models.MATCH_LOG,
        search=search,
        action=action,
        type_filter=type_filter,
        page=page,
        page_size=page_size,
    )


@router.get("/property-log/{id}", status_code=200)
async def property_log(id: str, request: Request, user: CurrentUser):  # type: ignore[no-untyped-def]
    _ = user
    return await admin_service.get_log_by_id(
        _db(request),
        collection=models.PROPERTY_LOG,
        log_id=validate_object_id(id),
        not_found_message="Sesion not found.",
        populate_ref=True,
    )


@router.get("/session-log/{id}", status_code=200)
async def session_log(id: str, request: Request, user: CurrentUser):  # type: ignore[no-untyped-def]
    _ = user
    return await admin_service.get_log_by_id(
        _db(request),
        collection=models.LOGIN_LOG,
        log_id=validate_object_id(id),
        not_found_message="Sesion not found.",
    )


@router.get("/match-log/{id}", status_code=200)
async def match_log(id: str, request: Request, user: CurrentUser):  # type: ignore[no-untyped-def]
    _ = user
    return await admin_service.get_log_by_id(
        _db(request),
        collection=models.MATCH_LOG,
        log_id=validate_object_id(id),
        not_found_message="Session not found.",
        extra_user_fields={"email"},
    )

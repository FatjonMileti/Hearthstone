"""Suggestion router. Port of Suggestions/suggestion.controller.ts route table."""

from typing import Annotated, Any

from fastapi import APIRouter, Depends, Query, Request

from app.api.deps import CurrentUser, Paging
from app.core.config import Settings, get_settings
from app.services import suggestion_service

router = APIRouter(prefix="/suggestion", tags=["suggestion"])


def _db(request: Request) -> Any:
    return request.app.state.db


@router.get("/asset", status_code=200)
async def property_suggestions(
    request: Request,
    user: CurrentUser,
    paging: Paging,
    settings: Annotated[Settings, Depends(get_settings)],
    chosen: Annotated[str | None, Query()] = None,
    disliked: Annotated[str | None, Query()] = None,
):  # type: ignore[no-untyped-def]
    return await suggestion_service.get_filtered_properties(
        _db(request),
        user_id=user["user_id"],
        chosen=chosen,
        disliked=disliked,
        page=paging.page if paging.pagination_enabled else None,
        page_size=paging.page_size if paging.pagination_enabled else None,
        api_url=settings.absolute_url.rstrip("/"),
    )


@router.post("/without-account/properties", status_code=200)
async def without_account(
    body: dict,
    request: Request,
    paging: Paging,
    settings: Annotated[Settings, Depends(get_settings)],
    chosen: Annotated[str | None, Query()] = None,
    disliked: Annotated[str | None, Query()] = None,
):  # type: ignore[no-untyped-def]
    _ = chosen, disliked
    return await suggestion_service.get_properties_without_account(
        _db(request),
        criteria=body,
        page=paging.page if paging.pagination_enabled else None,
        page_size=paging.page_size if paging.pagination_enabled else None,
        api_url=settings.absolute_url.rstrip("/"),
    )


@router.get("/tenant", status_code=200)
async def tenant_suggestions(
    request: Request,
    user: CurrentUser,
    paging: Paging,
    settings: Annotated[Settings, Depends(get_settings)],
    propertyId: Annotated[str | None, Query()] = None,
    chosen: Annotated[str | None, Query()] = None,
    disliked: Annotated[str | None, Query()] = None,
):  # type: ignore[no-untyped-def]
    return await suggestion_service.get_filtered_tenants(
        _db(request),
        user_id=user["user_id"],
        property_id=propertyId,
        chosen=chosen,
        disliked=disliked,
        page=paging.page if paging.pagination_enabled else None,
        page_size=paging.page_size if paging.pagination_enabled else None,
        api_url=settings.absolute_url.rstrip("/"),
    )

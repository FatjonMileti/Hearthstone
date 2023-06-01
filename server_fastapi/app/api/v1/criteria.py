"""Criteria router. Port of Criteria/criteria.controller.ts route table."""

from typing import Annotated, Any

from fastapi import APIRouter, Depends, Request

from app.api.deps import CurrentUser, validate_object_id
from app.core.config import Settings, get_settings
from app.services import criteria_service
from app.services.google_maps import from_settings as maps_from_settings

router = APIRouter(prefix="/criteria", tags=["criteria"])


def _db(request: Request) -> Any:
    return request.app.state.db


@router.get("/", status_code=200)
async def get_criteria(user: CurrentUser, request: Request):  # type: ignore[no-untyped-def]
    return await criteria_service.get_by_user_id(_db(request), user["user_id"])


@router.post("/", status_code=201)
async def create_criteria(
    body: dict,
    user: CurrentUser,
    request: Request,
    settings: Annotated[Settings, Depends(get_settings)],
):  # type: ignore[no-untyped-def]
    return await criteria_service.create_criteria(
        _db(request), data=body, user_id=user["user_id"], maps=maps_from_settings(settings)
    )


@router.patch("/", status_code=200)
async def update_criteria(body: dict, user: CurrentUser, request: Request):  # type: ignore[no-untyped-def]
    return await criteria_service.update_criteria(_db(request), data=body, user_id=user["user_id"])


@router.get("/{id}", status_code=200)
async def get_by_id(id: str, user: CurrentUser, request: Request):  # type: ignore[no-untyped-def]
    _ = user
    return await criteria_service.get_by_id(_db(request), validate_object_id(id))

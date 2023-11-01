"""Offer router. Port of Offer/offer.controller.ts route table.

Auth is global (like api/index.ts). PARITY: cancel/refuse/accept return 201.
"""

from typing import Any

from fastapi import APIRouter, Depends, Request

from app.api.deps import CurrentUser, get_current_user, validate_object_id
from app.services import offer_service

router = APIRouter(
    prefix="/offer",
    tags=["offer"],
    dependencies=[Depends(get_current_user)],
)


def _db(request: Request) -> Any:
    return request.app.state.db


@router.post("/", status_code=201)
async def create(body: dict, request: Request, user: CurrentUser):  # type: ignore[no-untyped-def]
    return await offer_service.create_offer(_db(request), data=body, user_id=user["user_id"])


@router.get("/matches/{matchId}/offer", status_code=200)
async def by_match(matchId: str, request: Request, user: CurrentUser):  # type: ignore[no-untyped-def]
    return await offer_service.get_by_match(_db(request), match_id=matchId, user_id=user["user_id"])


@router.patch("/{offerId}/canceled", status_code=201)
async def cancel(offerId: str, request: Request, user: CurrentUser):  # type: ignore[no-untyped-def]
    return await offer_service.cancel_offer(
        _db(request), offer_id=validate_object_id(offerId), user_id=user["user_id"]
    )


@router.delete("/{offerId}", status_code=201)
async def refuse(offerId: str, request: Request, user: CurrentUser):  # type: ignore[no-untyped-def]
    return await offer_service.refuse_offer(
        _db(request), offer_id=validate_object_id(offerId), user_id=user["user_id"]
    )


@router.patch("/{offerId}/accepted", status_code=201)
async def accept(offerId: str, request: Request, user: CurrentUser):  # type: ignore[no-untyped-def]
    return await offer_service.accept_offer(
        _db(request), offer_id=validate_object_id(offerId), user_id=user["user_id"]
    )

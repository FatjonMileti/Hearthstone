"""External partner feed. Port of Get/get-data.controller.ts.

Guarded by the static header `token` (tokenAuthorize.ts): missing/mismatched
token (or unset server token) -> 401. PARITY: findPublishedProperties reads
res.locals.user_id which is UNSET on this router, so match lookups use
created_by None and every item gets chosen False.
"""

import random
from typing import Annotated, Any

from fastapi import APIRouter, Depends, Header, HTTPException, Request

from app import models
from app.core.config import Settings, get_settings
from app.services import property_helpers as helpers
from app.services.mongo_helpers import serialize_doc
from app.services.suggestions import PUBLISHED_STATUSES

router = APIRouter(prefix="/v1", tags=["external-feed"])


def _db(request: Request) -> Any:
    return request.app.state.db


async def _check_token(
    settings: Annotated[Settings, Depends(get_settings)],
    token: Annotated[str | None, Header()] = None,
) -> None:
    if (
        not token
        or not settings.Hearthstone_api_access_token
        or token != settings.Hearthstone_api_access_token
    ):
        raise HTTPException(status_code=401, detail="Unauthorized")


@router.get("/property/get", status_code=200, dependencies=[Depends(_check_token)])
async def published_properties(request: Request):  # type: ignore[no-untyped-def]
    db = _db(request)
    query = {"status_string": {"$in": PUBLISHED_STATUSES}}
    docs = await db[models.PROPERTY].find(query).to_list(length=None)
    # PARITY: res.locals.user_id is unset here -> match on created_by None.
    matches = await db[models.MATCH].find({"created_by": None}).to_list(length=None)
    out = []
    for i, item in enumerate(docs):
        creator = await db[models.USER].find_one({"_id": item.get("created_by")})
        if creator and creator.get("deleted_at"):
            continue
        payload = serialize_doc(item)
        payload["property_images"] = helpers.generate_links_for_one_asset(
            item.get("property_images") or [], ""
        )
        match = next((m for m in matches if str(m.get("property")) == str(item.get("_id"))), None)
        out.append(
            {
                "sugestion_id": i,
                "property": payload,
                "chosen": bool(match.get("chosen")) if match else False,
                "matchId": str(match["_id"]) if match else None,
                # PARITY: Node assigns a RANDOM 30-100 percentage here.
                "percentage": random.randint(30, 100),  # noqa: S311 (display-only, mirrors Node faker)
            }
        )
    return {"docs": out, "totalDocs": len(out)}


@router.get("/user/get", status_code=200, dependencies=[Depends(_check_token)])
async def public_users(request: Request):  # type: ignore[no-untyped-def]
    """Port of getUserPublicData: enabled Tenant/Agent/Landlord + criteria join."""
    db = _db(request)
    users = (
        await db[models.USER]
        .find({"is_disabled": False, "role": {"$in": ["Tenant", "Agent", "Landlord"]}})
        .to_list(length=None)
    )
    out = []
    for user in users:
        criteria = await db[models.CRITERIA].find_one({"created_by": user["_id"]})
        out.append(
            {
                "_id": str(user["_id"]),
                "first_name": user.get("first_name"),
                "last_name": user.get("last_name"),
                "email": user.get("email"),
                # PARITY: Node maps Agent -> 'Landlord', everything else -> 'Client'.
                "user_type": "Landlord" if user.get("role") == "Agent" else "Client",
                "criteria": serialize_doc(criteria) if criteria else None,
            }
        )
    return out

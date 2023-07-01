"""Match router. Port of Match/match.controller.ts route table (order preserved)."""

from typing import Annotated, Any

from fastapi import APIRouter, Depends, HTTPException, Query, Request
from fastapi.responses import PlainTextResponse

from app import models
from app.api.deps import CurrentUser, Paging, validate_object_id
from app.core.config import Settings, get_settings
from app.services import match_service
from app.services.mongo_helpers import to_oid
from app.services.property_service import find_raw as find_property_raw
from app.services.property_service import increment_detail

router = APIRouter(prefix="/match", tags=["match"])


def _db(request: Request) -> Any:
    return request.app.state.db


def _type_for(role: str) -> str:
    # PARITY: Landlord creates USER matches, everyone else PROPERTY matches.
    return "User" if role == "Landlord" else "Property"


@router.get("/", status_code=200)
async def get_all(
    request: Request,
    user: CurrentUser,
    paging: Paging,
    settings: Annotated[Settings, Depends(get_settings)],
    chosen: Annotated[str | None, Query()] = None,
    matchRate: Annotated[str | None, Query()] = None,
    propertyId: Annotated[str | None, Query()] = None,
):  # type: ignore[no-untyped-def]
    query: dict[str, Any] = {}
    if user["role"] in ("Landlord", "Tenant"):
        query["created_by"] = {"$eq": to_oid(user["user_id"])}
        query["type"] = "User" if user["role"] == "Landlord" else "Property"
    if chosen:
        query["chosen"] = chosen == "true"
    if propertyId:
        query["property"] = {"$eq": to_oid(propertyId)}
    response = await match_service.list_matches(
        _db(request),
        query=query,
        page=paging.page if paging.pagination_enabled else None,
        page_size=paging.page_size if paging.pagination_enabled else None,
        me=user["user_id"],
        api_url=settings.absolute_url,
        log_days=settings.log_expiration_days,
        log_query=query,
    )
    if matchRate:
        try:
            threshold = float(matchRate)
        except ValueError:
            threshold = 0
        filtered = [
            d
            for d in response["docs"]
            if isinstance(d.get("property"), dict)
            and float(d["property"].get("percentage", 0)) >= threshold
        ]
        return {"docs": filtered, "totalDocs": len(filtered)}
    return response


@router.get("/property", status_code=200)
async def get_property_matches(
    request: Request,
    user: CurrentUser,
    paging: Paging,
    settings: Annotated[Settings, Depends(get_settings)],
    chosen: Annotated[str | None, Query()] = None,
    propertyId: Annotated[str | None, Query()] = None,
):  # type: ignore[no-untyped-def]
    query: dict[str, Any] = {"created_by": {"$ne": to_oid(user["user_id"])}}
    if chosen:
        query["chosen"] = chosen == "true"
    if propertyId:
        query["property"] = {"$eq": to_oid(propertyId)}
    return await match_service.list_matches(
        _db(request),
        query=query,
        page=paging.page if paging.pagination_enabled else None,
        page_size=paging.page_size if paging.pagination_enabled else None,
        me=user["user_id"],
        api_url=settings.absolute_url,
        log_days=settings.log_expiration_days,
        log_query=query,
    )


@router.get("/count", status_code=200)
async def count(
    request: Request,
    user: CurrentUser,
    matched: Annotated[str | None, Query()] = None,
    disliked: Annotated[str | None, Query()] = None,
):  # type: ignore[no-untyped-def]
    query: dict[str, Any] = {"created_by": {"$eq": to_oid(user["user_id"])}}
    if matched == "false":
        query["matched"] = False
    if matched == "true":
        query["matched"] = True
    if disliked == "true":
        query["disliked"] = True
    if disliked == "false":
        query["disliked"] = False
    try:
        number = await match_service.count_matches(_db(request), query)
        return {"number": number}
    except Exception:
        return PlainTextResponse('{"error": "Unable to count matches"}', status_code=500)


@router.post("/tenants", status_code=201)
async def like_tenant(
    body: dict,
    request: Request,
    user: CurrentUser,
    settings: Annotated[Settings, Depends(get_settings)],
):  # type: ignore[no-untyped-def]
    match = await match_service.create_match(
        _db(request),
        {
            "property": body.get("property"),
            "tenant": body.get("tenant"),
            "chosen": True,
            "type": _type_for(user["role"]),
            "landlord": user["user_id"],
            "created_by": user["user_id"],
        },
    )
    await match_service.log_create(
        _db(request), user["user_id"], body, settings.log_expiration_days
    )
    return match


@router.post("/dislikes/tenants", status_code=201)
async def dislike_tenant(
    body: dict,
    request: Request,
    user: CurrentUser,
    settings: Annotated[Settings, Depends(get_settings)],
):  # type: ignore[no-untyped-def]
    match = await match_service.create_match(
        _db(request),
        {
            "property": body.get("property"),
            "tenant": body.get("tenant"),
            "disliked": True,
            "type": _type_for(user["role"]),
            "landlord": user["user_id"],
            "created_by": user["user_id"],
        },
    )
    await match_service.log_create(
        _db(request), user["user_id"], body, settings.log_expiration_days
    )
    return match


@router.post("/properties", status_code=201)
async def like_property(
    body: dict,
    request: Request,
    user: CurrentUser,
    settings: Annotated[Settings, Depends(get_settings)],
):  # type: ignore[no-untyped-def]
    prop = await find_property_raw(_db(request), body.get("property"))
    if not prop:
        raise HTTPException(status_code=404, detail="not_found")
    match = await match_service.create_match(
        _db(request),
        {
            "chosen": True,
            "landlord": str(prop.get("created_by")),
            "property": str(prop["_id"]),
            "type": _type_for(user["role"]),
            "tenant": user["user_id"],
            "created_by": user["user_id"],
        },
    )
    await increment_detail(_db(request), prop["_id"], {"matches": 1})
    # PARITY: Node writes the create log TWICE here — replicated.
    await match_service.log_create(
        _db(request), user["user_id"], body, settings.log_expiration_days
    )
    await match_service.log_create(
        _db(request), user["user_id"], body, settings.log_expiration_days
    )
    return match


@router.post("/dislikes/properties", status_code=201)
async def dislike_property(
    body: dict,
    request: Request,
    user: CurrentUser,
    settings: Annotated[Settings, Depends(get_settings)],
):  # type: ignore[no-untyped-def]
    prop = await find_property_raw(_db(request), body.get("property"))
    if not prop:
        raise HTTPException(status_code=404, detail="not_found")
    match = await match_service.create_match(
        _db(request),
        {
            "disliked": True,
            "landlord": str(prop.get("created_by")),
            "property": str(prop["_id"]),
            "type": "Property",
            "tenant": user["user_id"],
            "created_by": user["user_id"],
        },
    )
    await increment_detail(_db(request), prop["_id"], {"matches": 1})
    await match_service.log_create(
        _db(request), user["user_id"], body, settings.log_expiration_days
    )
    await match_service.log_create(
        _db(request), user["user_id"], body, settings.log_expiration_days
    )
    return match


@router.get("/{id}", status_code=200)
async def get_by_id(
    id: str,
    request: Request,
    user: CurrentUser,
    settings: Annotated[Settings, Depends(get_settings)],
):  # type: ignore[no-untyped-def]
    oid = validate_object_id(id)
    match = await match_service.get_match_by_query(
        _db(request),
        {"type": _type_for(user["role"]), "_id": str(oid), "created_by": user["user_id"]},
        settings.absolute_url,
    )
    if not match:
        return PlainTextResponse('{"error": "Match not found."}', status_code=404)
    from app.services.criteria_service import find_by_user_id
    from app.services.suggestions import calculate_similarity

    tenant = match.get("tenant") or {}
    criteria = await find_by_user_id(
        _db(request), tenant.get("_id") if isinstance(tenant, dict) else None
    )
    prop = match.get("property") if isinstance(match.get("property"), dict) else {}
    percentage = calculate_similarity(criteria or {}, prop or {})
    match["property"]["percentage"] = int(round(percentage))
    match["percentage"] = int(round(percentage))
    match["criteria"] = criteria
    match["matched"] = await match_service.reciprocal_match(_db(request), match)
    await match_service.log_create(
        _db(request), user["user_id"], match, settings.log_expiration_days
    )
    return match


@router.post("/tenant", status_code=201)
async def create_match_property(
    body: dict,
    request: Request,
    user: CurrentUser,
    settings: Annotated[Settings, Depends(get_settings)],
):  # type: ignore[no-untyped-def]
    match = await match_service.create_match(
        _db(request),
        {
            **body,
            "type": _type_for(user["role"]),
            "landlord": user["user_id"],
            "created_by": user["user_id"],
        },
    )
    await match_service.log_create(
        _db(request), user["user_id"], body, settings.log_expiration_days
    )
    return match


@router.post("/property", status_code=201)
async def create_match_tenant(
    body: dict,
    request: Request,
    user: CurrentUser,
    settings: Annotated[Settings, Depends(get_settings)],
):  # type: ignore[no-untyped-def]
    prop = await find_property_raw(_db(request), body.get("property"))
    if not prop:
        raise HTTPException(status_code=404, detail="not_found")
    match = await match_service.create_match(
        _db(request),
        {
            **body,
            "landlord": str(prop.get("created_by")),
            "type": _type_for(user["role"]),
            "tenant": user["user_id"],
            "created_by": user["user_id"],
        },
    )
    await increment_detail(_db(request), prop["_id"], {"matches": 1})
    await match_service.log_create(
        _db(request), user["user_id"], body, settings.log_expiration_days
    )
    return match


@router.put("/{id}", status_code=200)
async def update_match(id: str, body: dict, request: Request, user: CurrentUser):  # type: ignore[no-untyped-def]
    oid = validate_object_id(id)
    existing = await _db(request)[models.MATCH].find_one({"_id": oid})
    if not existing:
        return PlainTextResponse('{"error": "Match not found."}', status_code=404)
    updated = await match_service.update_match(_db(request), oid, body, user_id=user["user_id"])
    if updated is None:
        # PARITY: chosen:false deletes the match -> 204 with deleted payload.
        return PlainTextResponse("null", status_code=204)
    return updated


@router.delete("/{id}", status_code=200)
async def delete_match(id: str, request: Request, user: CurrentUser):  # type: ignore[no-untyped-def]
    oid = validate_object_id(id)
    deleted = await match_service.delete_match(_db(request), oid, user_id=user["user_id"])
    if not deleted:
        return PlainTextResponse('{"error": "Match not found."}', status_code=404)
    return deleted


@router.patch("/{id}/unmatched", status_code=201)
async def mark_unmatched(id: str, request: Request, user: CurrentUser):  # type: ignore[no-untyped-def]
    oid = validate_object_id(id)
    updated = await match_service.mark_as_unmatched(_db(request), oid, user_id=user["user_id"])
    if not updated:
        raise HTTPException(status_code=404, detail="not_found")
    return updated

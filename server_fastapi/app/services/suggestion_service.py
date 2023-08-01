"""Suggestion queries. Ports getFilteredPropertiesByUser / getPropertiesWithoutAccount /
getFilteredTenantsByUser / getTenantsByUser from suggestion.service.ts.

Response quirks replicated: `percentage` is a STRING (toFixed(0)) here (unlike the
int in match enrichment), and the `sugestion_id` typo is kept — the client reads it.
"""

from typing import Any

from app import models
from app.services import property_helpers as helpers
from app.services.mongo_helpers import paginate_response, serialize_doc, to_oid
from app.services.property_service import find_published_example
from app.services.suggestions import PUBLISHED_STATUSES, calculate_similarity


def _property_payload(prop: dict, api_url: str) -> dict:
    out = serialize_doc(prop)
    creator = None  # populated by callers when needed
    _ = creator
    out["property_images"] = helpers.generate_links_for_one_asset(
        prop.get("property_images") or [], api_url
    )
    return out


async def get_filtered_properties(
    db: Any,
    *,
    user_id: str,
    chosen: str | None,
    disliked: str | None,
    page: int | None,
    page_size: int | None,
    api_url: str,
) -> dict:
    criteria = await db[models.CRITERIA].find_one({"created_by": to_oid(user_id)})
    if not criteria:
        from fastapi import HTTPException

        raise HTTPException(status_code=404, detail="criteria_not_found")

    props = (
        await db[models.PROPERTY]
        .find({"status_string": {"$in": PUBLISHED_STATUSES}, "deleted_at": {"$exists": False}})
        .to_list(length=100)
    )
    matches = await db[models.MATCH].find({"created_by": to_oid(user_id)}).to_list(length=None)

    def _match_for(prop: dict) -> dict | None:
        for m in matches:
            if str(m.get("property")) == str(prop.get("_id")):
                return m
        return None

    scored = []
    for prop in props:
        percentage = calculate_similarity(criteria, prop)
        payload = _property_payload(prop, api_url)
        payload["percentage"] = f"{percentage:.0f}"
        # PARITY: exclusion comparisons use the string percentage + match flags.
        try:
            pct = float(payload["percentage"])
        except ValueError:
            continue
        if pct < 20:
            continue
        mp = _match_for(prop)
        if chosen == "false" and mp and mp.get("chosen"):
            continue
        if chosen == "true" and mp and mp.get("chosen"):
            continue
        if disliked == "false" and mp and mp.get("disliked"):
            continue
        if disliked == "true" and (not mp or not mp.get("disliked")):
            continue
        scored.append((pct, payload, mp))
    scored.sort(key=lambda t: t[0], reverse=True)

    docs = [
        {
            "sugestion_id": i,
            "property": payload,
            "chosen": bool(mp.get("chosen")) if mp else False,
            "matchId": str(mp["_id"]) if mp else None,
        }
        for i, (_, payload, mp) in enumerate(scored)
    ]
    return paginate_response(docs, total=len(docs), page=page, limit=page_size)


async def get_properties_without_account(
    db: Any,
    *,
    criteria: dict,
    page: int | None,
    page_size: int | None,
    api_url: str,
) -> dict:
    if not criteria:
        from fastapi import HTTPException

        raise HTTPException(status_code=404, detail="criteria_not_found")
    props = (
        await db[models.PROPERTY]
        .find({"status_string": {"$in": PUBLISHED_STATUSES}, "deleted_at": {"$exists": False}})
        .to_list(length=100)
    )
    scored = []
    for prop in props:
        percentage = calculate_similarity(criteria, prop)
        payload = _property_payload(prop, api_url)
        payload["percentage"] = f"{percentage:.0f}"
        try:
            pct = float(payload["percentage"])
        except ValueError:
            continue
        if pct < 20:
            continue
        scored.append((pct, payload))
    scored.sort(key=lambda t: t[0], reverse=True)
    docs = [{"sugestion_id": i, "property": payload} for i, (_, payload) in enumerate(scored)]
    return paginate_response(docs, total=len(docs), page=page, limit=page_size)


async def _tenant_criteria(db: Any, user_id: str) -> list[dict]:
    """All criteria whose author is a Tenant (Node filters populated role == Client)."""
    all_criteria = (
        await db[models.CRITERIA].find({"created_by": {"$ne": to_oid(user_id)}}).to_list(length=100)
    )
    out = []
    for crit in all_criteria:
        author = await db[models.USER].find_one({"_id": to_oid(crit.get("created_by"))})
        if not author or author.get("role") != "Tenant":
            continue
        payload = serialize_doc(crit)
        payload["created_by"] = serialize_doc(author)
        out.append(payload)
    return out


def _suggestion_object(item: dict, matches: list[dict], prop: dict, api_url: str) -> dict:
    tenant_id = (
        (item.get("created_by") or {}).get("_id")
        if isinstance(item.get("created_by"), dict)
        else None
    )
    match = next(
        (
            m
            for m in matches
            if str(m.get("tenant")) == str(tenant_id)
            and str(m.get("property")) == str(prop.get("_id"))
        ),
        None,
    )
    percentage = calculate_similarity(item, prop)
    payload = _property_payload(prop, api_url)
    payload["percentage"] = int(round(percentage))
    return {
        "criteria": item,
        "property": payload,
        "percentage": percentage,
        "chosen": bool(match.get("chosen")) if match else False,
        "disliked": bool(match.get("disliked")) if match else False,
        "matchId": str(match["_id"]) if match else None,
    }


async def get_filtered_tenants(
    db: Any,
    *,
    user_id: str,
    property_id: str | None,
    chosen: str | None,
    disliked: str | None,
    page: int | None,
    page_size: int | None,
    api_url: str,
) -> dict:
    tenant_docs = await _tenant_criteria(db, user_id)
    my_props = await find_published_example(db, user_id=user_id, property_id=property_id)
    matches = await db[models.MATCH].find({"created_by": to_oid(user_id)}).to_list(length=None)
    data = [
        _suggestion_object(item, matches, prop, api_url)
        for prop in my_props
        for item in tenant_docs
    ]
    filtered = []
    for item in data:
        try:
            pct = float(item["property"]["percentage"])
        except (TypeError, ValueError):
            continue
        if pct < 20:
            continue
        if chosen == "false" and item["chosen"]:
            continue
        if chosen == "true" and not item["chosen"]:
            continue
        if disliked == "false" and item["disliked"]:
            continue
        if disliked == "true" and not item["disliked"]:
            continue
        filtered.append(item)
    filtered.sort(key=lambda i: float(i["property"]["percentage"]), reverse=True)
    return paginate_response(filtered, total=len(filtered), page=page, limit=page_size)


async def get_tenants_by_user(db: Any, user_id: str, api_url: str = "") -> list[dict]:
    """Unpaginated variant used by GET /api/asset/last (Node getTenantsByUser)."""
    tenant_docs = await _tenant_criteria(db, user_id)
    my_props = await find_published_example(db, user_id=user_id)
    matches = await db[models.MATCH].find({"created_by": to_oid(user_id)}).to_list(length=None)
    data = [
        _suggestion_object(item, matches, prop, api_url)
        for prop in my_props
        for item in tenant_docs
    ]
    kept = []
    for item in data:
        try:
            pct = float(item["property"]["percentage"])
        except (TypeError, ValueError):
            continue
        if pct > 20:
            kept.append(item)
    kept.sort(key=lambda i: float(i["property"]["percentage"]), reverse=True)
    return kept

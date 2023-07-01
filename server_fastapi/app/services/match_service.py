"""Match domain service + enrichment. Port of Match/match.service.ts and the
enrichment loops in match.controller.ts (unread_messages, criteria, percentage,
matched, suggestion_id/matchId, has_owner_deleted).
"""

from datetime import UTC, datetime
from typing import Any

from bson import ObjectId
from fastapi import HTTPException

from app import models
from app.services import property_helpers as helpers
from app.services.log_service import LogAction, write_entity_log
from app.services.mongo_helpers import paginate_response, serialize_doc, to_oid
from app.services.suggestions import calculate_similarity

USER_SELECT = {"first_name": 1, "last_name": 1, "avatar": 1, "deleted_at": 1}


async def create_match(db: Any, data: dict) -> dict:
    doc = {
        "tenant": to_oid(data.get("tenant")),
        "landlord": to_oid(data.get("landlord")),
        "property": to_oid(data.get("property")),
        "chosen": bool(data.get("chosen", False)),
        "matched": bool(data.get("matched", False)),
        "unmatched": bool(data.get("unmatched", False)),
        "disliked": bool(data.get("disliked", False)),
        "type": data.get("type"),
        "created_by": to_oid(data.get("created_by")),
        "edited_by": to_oid(data.get("edited_by")),
        "created_at": datetime.now(UTC),
    }
    result = await db[models.MATCH].insert_one(doc)
    created = await db[models.MATCH].find_one({"_id": result.inserted_id})
    if created is None:
        raise HTTPException(status_code=500, detail="match_not_created")
    return serialize_doc(created)


async def _populate(db: Any, doc: dict, api_url: str = "") -> dict:
    out = serialize_doc(doc)
    prop = await db[models.PROPERTY].find_one({"_id": to_oid(doc.get("property"))})
    if prop:
        p = serialize_doc(prop)
        creator = await db[models.USER].find_one(
            {"_id": to_oid(prop.get("created_by"))},
            {"first_name": 1, "last_name": 1, "avatar": 1},
        )
        p["created_by"] = serialize_doc(creator) if creator else prop.get("created_by")
        p["property_images"] = [
            {"key": img.get("key"), "link": img.get("link")}
            for img in (prop.get("property_images") or [])
        ]
        out["property"] = p
    for key in ("tenant", "landlord"):
        person = await db[models.USER].find_one({"_id": to_oid(doc.get(key))}, USER_SELECT)
        out[key] = serialize_doc(person) if person else doc.get(key)
    landlord = await db[models.USER].find_one({"_id": to_oid(doc.get("landlord"))}, USER_SELECT)
    if landlord and landlord.get("deleted_at"):
        if isinstance(out.get("property"), dict):
            out["property"]["has_owner_deleted"] = True
    _ = api_url
    return out


async def unread_between_users(
    db: Any, *, landlord: str, tenant: str, me: str, property_id: Any
) -> int:
    """Port of chat.service getMessagesBetweenUsers (returns unseen-from-others count)."""
    room = await db[models.ROOM].find_one(
        {
            "$or": [
                {"participant": to_oid(landlord), "author": to_oid(tenant)},
                {"participant": to_oid(tenant), "author": to_oid(landlord)},
            ],
            "property": {"$eq": to_oid(property_id)},
        }
    )
    query: dict[str, Any] = {
        "$or": [
            {"participant": to_oid(landlord), "author": to_oid(tenant)},
            {"participant": to_oid(tenant), "author": to_oid(landlord)},
        ],
        "sender": {"$ne": to_oid(me)},
        "seen": False,
    }
    if room:
        query["room_id"] = room["_id"]
    return await db[models.MESSAGE].count_documents(query)


async def reciprocal_match(db: Any, match: dict) -> bool:
    """A match is mutual when the opposite-type chosen match exists (controller logic)."""
    prop_id = (
        match.get("property", {}).get("_id") if isinstance(match.get("property"), dict) else None
    )
    if match.get("type") == "Property":
        query = {"type": "User", "chosen": True}
        tenant = match.get("tenant", {})
        if isinstance(tenant, dict) and tenant.get("_id"):
            query["tenant"] = {"$eq": to_oid(tenant["_id"])}
        if prop_id:
            query["property"] = {"$eq": to_oid(prop_id)}
    else:
        query = {"type": "Property", "chosen": True}
        landlord = match.get("landlord", {})
        if isinstance(landlord, dict) and landlord.get("_id"):
            query["landlord"] = {"$eq": to_oid(landlord["_id"])}
        if prop_id:
            query["property"] = {"$eq": to_oid(prop_id)}
    found = await db[models.MATCH].find_one(query)
    return found is not None


async def enrich_match(db: Any, populated: dict, *, me: str, index: int = 0) -> dict:
    from app.services.criteria_service import find_by_user_id

    landlord = populated.get("landlord") or {}
    tenant = populated.get("tenant") or {}
    prop = populated.get("property") or {}
    populated["unread_messages"] = await unread_between_users(
        db,
        landlord=landlord.get("_id", "") if isinstance(landlord, dict) else "",
        tenant=tenant.get("_id", "") if isinstance(tenant, dict) else "",
        me=me,
        property_id=prop.get("_id") if isinstance(prop, dict) else None,
    )
    criteria = await find_by_user_id(db, tenant.get("_id") if isinstance(tenant, dict) else None)
    populated["criteria"] = criteria
    percentage = calculate_similarity(criteria or {}, prop if isinstance(prop, dict) else {})
    populated["percentage"] = int(round(percentage))
    if isinstance(prop, dict):
        prop["percentage"] = int(round(percentage))
    populated["suggestion_id"] = index
    populated["matchId"] = populated.get("_id")
    populated["matched"] = await reciprocal_match(db, populated)
    return populated


async def list_matches(
    db: Any,
    *,
    query: dict,
    page: int | None,
    page_size: int | None,
    me: str,
    api_url: str,
    log_days: int,
    log_query: dict,
) -> dict:
    total = await db[models.MATCH].count_documents(query)
    cursor = db[models.MATCH].find(query).sort([("created_at", -1)])
    if page and page_size:
        docs = await cursor.skip((page - 1) * page_size).limit(page_size).to_list(length=page_size)
    else:
        docs = await cursor.to_list(length=None)
    enriched = []
    for i, doc in enumerate(docs):
        populated = await _populate(db, doc, api_url)
        enriched.append(await enrich_match(db, populated, me=me, index=i))
    helpers.generate_links_for_matches_images(enriched)
    response = paginate_response(enriched, total=total, page=page, limit=page_size)
    await write_entity_log(
        db,
        collection=models.MATCH_LOG,
        user_id=to_oid(me),
        action=LogAction.Read,
        info=log_query,
        log_expiration_days=log_days,
    )
    return response


async def get_match_by_query(db: Any, query: dict, api_url: str = "") -> dict | None:
    # Convert friendly string ids to ObjectIds for known ref fields.
    mongo_query: dict[str, Any] = {}
    for key, value in query.items():
        if key in ("tenant", "landlord", "property", "created_by", "_id") and isinstance(
            value, str
        ):
            mongo_query[key] = to_oid(value)
        elif key in ("tenant", "landlord", "property") and isinstance(value, dict):
            mongo_query[key] = {k: (to_oid(v) if k in ("$eq",) else v) for k, v in value.items()}
        else:
            mongo_query[key] = value
    doc = await db[models.MATCH].find_one(mongo_query)
    return await _populate(db, doc, api_url) if doc else None


async def count_matches(db: Any, query: dict) -> int:
    return await db[models.MATCH].count_documents(query)


async def update_match(db: Any, match_id: ObjectId, data: dict, *, user_id: str) -> dict | None:
    existing = await db[models.MATCH].find_one({"_id": match_id})
    if not existing:
        return None
    update = {k: v for k, v in data.items() if k != "_id"}
    update["edited_at"] = datetime.now(UTC)
    update["edited_by"] = to_oid(user_id)
    await db[models.MATCH].update_one({"_id": match_id}, {"$set": update})

    from app.services.property_service import increment_detail

    delta: dict[str, int] = {}
    if existing.get("chosen") and not update.get("chosen", existing.get("chosen")):
        delta = {"matches": -1}
    elif not existing.get("chosen") and update.get("chosen"):
        delta = {"matches": 1}
    if delta and existing.get("property"):
        await increment_detail(db, existing["property"], delta)

    updated = await db[models.MATCH].find_one({"_id": match_id})
    if updated and not updated.get("chosen"):
        # PARITY: chosen:false via PUT deletes the match -> 204.
        await db[models.MATCH].delete_one({"_id": match_id})
        return None
    await write_entity_log(
        db,
        collection=models.MATCH_LOG,
        user_id=to_oid(user_id),
        action=LogAction.Update,
        ref=match_id,
        info=data,
        log_expiration_days=90,
    )
    return serialize_doc(updated) if updated else None


async def delete_match(db: Any, match_id: ObjectId, *, user_id: str) -> dict | None:
    doc = await db[models.MATCH].find_one({"_id": match_id})
    if not doc:
        return None
    await db[models.MATCH].delete_one({"_id": match_id})
    await write_entity_log(
        db,
        collection=models.MATCH_LOG,
        user_id=to_oid(user_id),
        action=LogAction.Delete,
        ref=match_id,
        info=serialize_doc(doc),
        log_expiration_days=90,
    )
    return serialize_doc(doc)


async def mark_as_unmatched(db: Any, match_id: ObjectId, *, user_id: str) -> dict | None:
    mine = await db[models.MATCH].find_one({"_id": match_id, "created_by": to_oid(user_id)})
    if not mine:
        return None
    await db[models.MATCH].update_one({"_id": match_id}, {"$set": {"unmatched": True}})
    updated = await db[models.MATCH].find_one({"_id": match_id})
    if updated is None:
        raise HTTPException(status_code=500, detail="match_not_updated")
    return serialize_doc(updated)


async def log_create(db: Any, user_id: str, info: Any, log_days: int) -> None:
    await write_entity_log(
        db,
        collection=models.MATCH_LOG,
        user_id=to_oid(user_id),
        action=LogAction.Create,
        info=info,
        log_expiration_days=log_days,
    )


async def raise_not_found(detail: str = "not_found") -> None:
    raise HTTPException(status_code=404, detail=detail)

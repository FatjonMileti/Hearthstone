"""Offer domain service. Port of Offer/offer.service.ts + controller guards.

DIVERGENCE (documented): cancel/refuse/accept return the updated offer document,
where Node returns the raw Mongo update result. Status codes (201) are preserved.
"""

from datetime import UTC, datetime
from typing import Any

from bson import ObjectId
from fastapi import HTTPException

from app import models
from app.services.mongo_helpers import serialize_doc, to_oid

REQUIRED_FIELDS = ("match", "offering_price", "warranty", "min_duration")


async def create_offer(db: Any, *, data: dict, user_id: str) -> dict:
    match = await db[models.MATCH].find_one({"_id": to_oid(data.get("match"))})
    if not match:
        raise HTTPException(status_code=400, detail="Match not found")
    missing = [f for f in REQUIRED_FIELDS if data.get(f) is None]
    if missing:
        # PARITY: Node's mongoose validation error surfaces as 500 here.
        raise HTTPException(status_code=500, detail="Unable to create a offer.")
    doc = {
        **data,
        "created_by": to_oid(user_id),
        "created_for": to_oid(match.get("landlord")),
        "property": to_oid(match.get("property")),
        "canceled": False,
        "refused": False,
        "accepted": {"status": False},
        "created_at": datetime.now(UTC),
    }
    result = await db[models.OFFER].insert_one(doc)
    created = await db[models.OFFER].find_one({"_id": result.inserted_id})
    if created is None:
        raise HTTPException(status_code=500, detail="unexpected_empty_result")
    return serialize_doc(created)


async def get_by_match(db: Any, *, match_id: str, user_id: str) -> dict:
    match = await db[models.MATCH].find_one({"_id": to_oid(match_id)})
    if not match:
        raise HTTPException(status_code=400, detail="Match not found")
    if match.get("type") == "User":
        query: dict[str, Any] = {
            "match": match_id,
            "created_by": to_oid(user_id),
            "canceled": False,
        }
    else:
        query = {
            "property": to_oid(match.get("property")),
            "created_for": to_oid(match.get("landlord")),
            "created_by": to_oid(match.get("tenant")),
            "canceled": False,
        }
    cursor = db[models.OFFER].find(query).sort([("created_at", -1)]).limit(1)
    docs = await cursor.to_list(length=1)
    if not docs:
        raise HTTPException(status_code=404, detail="offer_not_found")
    return serialize_doc(docs[0])


async def _owned_offer(
    db: Any, offer_id: ObjectId, field: str, user_id: str, extra: dict | None = None
) -> dict:
    query: dict[str, Any] = {"_id": offer_id, field: to_oid(user_id), "canceled": False}
    if extra:
        query.update(extra)
    doc = await db[models.OFFER].find_one(query)
    if not doc:
        raise HTTPException(status_code=400, detail="offer_not_found")
    return doc


async def cancel_offer(db: Any, *, offer_id: ObjectId, user_id: str) -> dict:
    await _owned_offer(db, offer_id, "created_by", user_id)
    await db[models.OFFER].update_one({"_id": offer_id}, {"$set": {"canceled": True}})
    updated = await db[models.OFFER].find_one({"_id": offer_id})
    if updated is None:
        raise HTTPException(status_code=500, detail="unexpected_empty_result")
    return serialize_doc(updated)


async def refuse_offer(db: Any, *, offer_id: ObjectId, user_id: str) -> dict:
    await _owned_offer(db, offer_id, "created_for", user_id, {"refused": False})
    await db[models.OFFER].update_one({"_id": offer_id}, {"$set": {"refused": True}})
    updated = await db[models.OFFER].find_one({"_id": offer_id})
    if updated is None:
        raise HTTPException(status_code=500, detail="unexpected_empty_result")
    return serialize_doc(updated)


async def accept_offer(db: Any, *, offer_id: ObjectId, user_id: str) -> dict:
    await _owned_offer(
        db, offer_id, "created_for", user_id, {"refused": False, "accepted.status": False}
    )
    await db[models.OFFER].update_one(
        {"_id": offer_id},
        {"$set": {"accepted": {"status": True, "accepted_date": datetime.now(UTC)}}},
    )
    updated = await db[models.OFFER].find_one({"_id": offer_id})
    if updated is None:
        raise HTTPException(status_code=500, detail="unexpected_empty_result")
    return serialize_doc(updated)

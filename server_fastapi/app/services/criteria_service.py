"""Criteria domain service. Port of Criteria/services/criteria.service.ts."""

from datetime import UTC, datetime
from typing import Any

from bson import ObjectId
from fastapi import HTTPException

from app import models
from app.services.mongo_helpers import serialize_doc, to_oid

UPDATABLE_FIELDS = (
    "distance_from_underground",
    "distance_from_schools",
    "distance_from_high_street",
    "distance_from_gym",
    "flat_details",
    "outside_space",
    "parking_details",
    "floor_size_unit",
    "budget",
    "area_of_interest",
    "radius",
    "budget_for",
    "asset_address",
    "transaction_type_string",
    "property_type",
    "house_details",
    "deposit_amount",
    "contract_details",
    "floor_size",
    "room_details",
    "property_features",
    "property_preferences",
    "specific_property_features",
    "credit_score_requirements",
    "looking_for",
)


async def create_criteria(db: Any, *, data: dict, user_id: str, maps: Any = None) -> dict:
    data = dict(data)
    data["created_by"] = to_oid(user_id)
    data["currency_code"] = "GBP"
    if data.get("area_of_interest") and maps is not None:
        try:
            coords = maps.get_coordinates(data["area_of_interest"])
            geometry = (coords or {}).get("geometry", {})
            lat = (geometry.get("location") or {}).get("lat")
            lng = (geometry.get("location") or {}).get("lng")
            if lat and lng:
                normalized = maps.get_address(float(lat), float(lng))
                if normalized:
                    data["asset_address"] = normalized
        except (TypeError, ValueError):
            pass
    user = await db[models.USER].find_one({"_id": to_oid(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="not found")
    # Role switch mirrors looking_for (Node compares against LookingForEnum values).
    if data.get("looking_for") == "I’m looking for a place":
        user["role"] = "Tenant"
        user["has_completed_initial_setup"] = True
    if data.get("looking_for") == "I own a place":
        user["role"] = "Landlord"
        user["has_completed_initial_setup"] = True
    await db[models.USER].update_one(
        {"_id": user["_id"]},
        {
            "$set": {
                "role": user["role"],
                "has_completed_initial_setup": user.get("has_completed_initial_setup", False),
            }
        },
    )
    data["created_at"] = datetime.now(UTC)
    result = await db[models.CRITERIA].insert_one(data)
    doc = await db[models.CRITERIA].find_one({"_id": result.inserted_id})
    if doc is None:
        raise HTTPException(status_code=500, detail="criteria_not_created")
    return serialize_doc(doc)


async def update_criteria(db: Any, *, data: dict, user_id: str) -> dict:
    user = await db[models.USER].find_one({"_id": to_oid(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="not found")
    criteria = await db[models.CRITERIA].find_one({"created_by": to_oid(user_id)})
    if not criteria:
        raise HTTPException(status_code=404, detail="criteria not found")
    update = {f: data[f] for f in UPDATABLE_FIELDS if f in data}
    # PARITY: moving_time is assigned unconditionally (commented-out guard in Node).
    update["moving_time"] = data.get("moving_time")
    await db[models.CRITERIA].update_one({"_id": criteria["_id"]}, {"$set": update})

    from app.services.user_service import set_trust_score

    await set_trust_score(db, to_oid(user_id))  # type: ignore[arg-type]
    updated = await db[models.CRITERIA].find_one({"_id": criteria["_id"]})
    if updated is None:
        raise HTTPException(status_code=500, detail="criteria_not_updated")
    return serialize_doc(updated)


async def get_by_user_id(db: Any, user_id: str) -> dict:
    doc = await db[models.CRITERIA].find_one({"created_by": to_oid(user_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="The item does not exist")
    return serialize_doc(doc)


async def get_by_id(db: Any, criteria_id: ObjectId) -> dict:
    doc = await db[models.CRITERIA].find_one({"_id": criteria_id})
    if not doc:
        raise HTTPException(status_code=404, detail="The item does not exist")
    return serialize_doc(doc)


async def find_by_user_id(db: Any, user_id: Any) -> dict | None:
    """Populated variant used by match enrichment (created_by: first/last/avatar)."""
    doc = await db[models.CRITERIA].find_one({"created_by": to_oid(user_id)})
    if not doc:
        return None
    out = serialize_doc(doc)
    author = await db[models.USER].find_one(
        {"_id": to_oid(doc.get("created_by"))},
        {"first_name": 1, "last_name": 1, "avatar": 1},
    )
    out["created_by"] = serialize_doc(author) if author else doc.get("created_by")
    return out

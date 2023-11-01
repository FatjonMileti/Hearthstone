"""Notification queries. Port of Notification/notification.controller.ts.

Quirks replicated: list ignores paging (Node passes only select); unread uses the
double-$group aggregation whose length===1 rule means it returns 1 only when
exactly one room has unviewed notifications, else 0.
"""

from typing import Any

from bson import ObjectId
from fastapi import HTTPException

from app import models
from app.services.mongo_helpers import serialize_doc, to_oid

SELECT_FIELDS = {"data": 1, "message": 1, "type": 1, "viewed": 1, "created_at": 1}


async def list_notifications(db: Any, user_id: str) -> dict:
    docs = (
        await db[models.NOTIFICATION]
        .find({"type": "Chat", "viewed": False, "user": to_oid(user_id)}, SELECT_FIELDS)
        .to_list(length=None)
    )
    serialized = [serialize_doc(d) for d in docs]
    return {"docs": serialized, "totalDocs": len(serialized)}


async def unread_count(db: Any, user_id: str) -> dict:
    pipeline = [
        {"$match": {"viewed": False, "user": to_oid(user_id), "data.room_id": {"$exists": True}}},
        {"$group": {"_id": {"room_id": "$data.room_id"}}},
        {"$group": {"_id": "$_id.room_id", "count": {"$sum": 1}}},
    ]
    grouped = await db[models.NOTIFICATION].aggregate(pipeline).to_list(length=None)
    # PARITY QUIRK: returns the count only when exactly one group exists, else 0.
    unread = grouped[0]["count"] if len(grouped) == 1 else 0
    return {"unread": unread}


async def mark_viewed(db: Any, *, notification_id: ObjectId, user_id: str, viewed: Any) -> None:
    doc = await db[models.NOTIFICATION].find_one({"_id": notification_id, "user": to_oid(user_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="not found")
    await db[models.NOTIFICATION].update_one({"_id": notification_id}, {"$set": {"viewed": viewed}})

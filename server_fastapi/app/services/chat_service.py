"""Chat domain service. Port of Chat/chat.service.ts + room.service.ts.

Aggregation pipelines (RoomAggregation) are replaced with equivalent manual
joins — same response shapes ({docs, limit, page, totalDocs, totalPages} and
DefaultResponse), same populate selections.
"""

from datetime import UTC, datetime
from typing import Any

from bson import ObjectId
from fastapi import HTTPException

from app import models
from app.services.mongo_helpers import paginate_response, serialize_doc, to_oid

ROOM_USER_SELECT = {"first_name": 1, "last_name": 1}
ROOM_USER_FULL = {"first_name": 1, "last_name": 1, "avatar": 1, "role": 1}


async def populate_room(db: Any, room: dict, full: bool = False) -> dict:
    out = serialize_doc(room)
    select = ROOM_USER_FULL if full else ROOM_USER_SELECT
    for key in ("author", "participant"):
        person = await db[models.USER].find_one({"_id": to_oid(room.get(key))}, select)
        out[key] = serialize_doc(person) if person else room.get(key)
    return out


async def list_rooms(
    db: Any,
    *,
    user_id: str,
    property_id: str | None,
    page: int | None,
    page_size: int | None,
) -> dict:
    me = to_oid(user_id)
    query: dict[str, Any] = {"$or": [{"author": me}, {"participant": me}]}
    if property_id:
        query["property"] = to_oid(property_id)
    total = await db[models.ROOM].count_documents(query)
    cursor = db[models.ROOM].find(query).sort([("created_at", -1)])
    if page and page_size:
        docs = await cursor.skip((page - 1) * page_size).limit(page_size).to_list(length=page_size)
    else:
        docs = await cursor.to_list(length=None)
    populated = [await populate_room(db, r) for r in docs]
    return paginate_response(populated, total=total, page=page, limit=page_size)


async def started_conversations(db: Any, user_id: str) -> list[dict]:
    me = to_oid(user_id)
    rooms = (
        await db[models.ROOM]
        .find({"$or": [{"author": me}, {"participant": me}]})
        .to_list(length=None)
    )
    seen: dict[str, dict] = {}
    for room in rooms:
        prop = await db[models.PROPERTY].find_one({"_id": to_oid(room.get("property"))})
        if not prop:
            continue
        seen[str(prop["_id"])] = {
            "_id": str(prop["_id"]),
            "title": prop.get("title"),
            "area_of_interest": prop.get("area_of_interest"),
            "property_type": prop.get("property_type"),
            "property_images": prop.get("property_images") or [],
        }
    return list(seen.values())


async def create_room(db: Any, *, author: Any, participant: Any, property: Any) -> dict:
    doc = {
        "author": to_oid(author),
        "participant": to_oid(participant),
        "property": to_oid(property),
        "created_at": datetime.now(UTC),
    }
    result = await db[models.ROOM].insert_one(doc)
    created = await db[models.ROOM].find_one({"_id": result.inserted_id})
    if created is None:
        raise HTTPException(status_code=500, detail="unexpected_empty_result")
    # PARITY QUIRK (chat.controller create): the seed message is {...newRoom,
    # room_id: newRoom._id} — room fields copied into a message. Replicated.
    seed = {k: v for k, v in created.items() if k != "_id"}
    seed["room_id"] = created["_id"]
    await db[models.MESSAGE].insert_one(seed)
    return await populate_room(db, created, full=True)


async def get_messages(
    db: Any, *, room_id: ObjectId, page: int | None, page_size: int | None
) -> dict:
    query = {"room_id": room_id}
    total = await db[models.MESSAGE].count_documents(query)
    cursor = db[models.MESSAGE].find(query).sort([("created_at", -1)])
    if page and page_size:
        docs = await cursor.skip((page - 1) * page_size).limit(page_size).to_list(length=page_size)
    else:
        docs = await cursor.to_list(length=None)
    return paginate_response(
        [serialize_doc(d) for d in docs], total=total, page=page, limit=page_size
    )


async def read_messages(db: Any, *, room_id: str, user_id: str) -> dict:
    msg_result = await db[models.MESSAGE].update_many(
        {"room_id": to_oid(room_id), "sender": {"$ne": to_oid(user_id)}, "seen": False},
        {"$set": {"seen": True}},
    )
    await db[models.NOTIFICATION].update_many(
        {"data.room_id": to_oid(room_id), "data.sender": {"$ne": to_oid(user_id)}, "viewed": False},
        {"$set": {"viewed": True}},
    )
    return {
        "acknowledged": True,
        "matchedCount": msg_result.matched_count,
        "modifiedCount": msg_result.modified_count,
    }


async def check_room(db: Any, *, me: str, participant: str, property: Any) -> dict:
    doc = await db[models.ROOM].find_one(
        {
            "$or": [
                {"participant": to_oid(participant), "author": to_oid(me)},
                {"author": to_oid(participant), "participant": to_oid(me)},
            ],
            "property": {"$eq": to_oid(property)},
        }
    )
    if not doc:
        raise HTTPException(status_code=404, detail="not_found")
    return await populate_room(db, doc, full=True)


async def delete_room(db: Any, room_id: ObjectId) -> None:
    await db[models.ROOM].delete_one({"_id": room_id})


async def find_room(db: Any, query: dict) -> dict | None:
    doc = await db[models.ROOM].find_one(query)
    return await populate_room(db, doc, full=True) if doc else None


async def match_room(db: Any, match_id: str) -> dict:
    match = await db[models.MATCH].find_one({"_id": to_oid(match_id)})
    if not match:
        raise HTTPException(status_code=404, detail="match not found")
    existing = await db[models.ROOM].find_one(
        {"$or": [{"property_match": to_oid(match_id)}, {"tenant_match": to_oid(match_id)}]}
    )
    if existing:
        return await populate_room(db, existing, full=True)

    if match.get("type") == "Property":
        reciprocal = await db[models.MATCH].find_one(
            {
                "type": "User",
                "tenant": to_oid(match.get("tenant")),
                "property": to_oid(match.get("property")),
                "chosen": True,
            }
        )
        room = {
            "author": to_oid(match.get("tenant")),
            "participant": to_oid(match.get("landlord")),
            "property": to_oid(match.get("property")),
            "property_match": match["_id"],
            "tenant_match": reciprocal["_id"] if reciprocal else None,
            "created_at": datetime.now(UTC),
        }
    else:
        reciprocal = await db[models.MATCH].find_one(
            {
                "type": "Property",
                "landlord": to_oid(match.get("landlord")),
                "property": to_oid(match.get("property")),
                "chosen": True,
            }
        )
        room = {
            "author": to_oid(match.get("tenant")),
            "participant": to_oid(match.get("landlord")),
            "property": to_oid(match.get("property")),
            "property_match": reciprocal["_id"] if reciprocal else None,
            "tenant_match": match["_id"],
            "created_at": datetime.now(UTC),
        }
    result = await db[models.ROOM].insert_one(room)
    created = await db[models.ROOM].find_one({"_id": result.inserted_id})
    if created is None:
        raise HTTPException(status_code=500, detail="unexpected_empty_result")
    return await populate_room(db, created, full=True)


async def contract_status(db: Any, *, room_id: ObjectId, role: str) -> dict:
    room = await db[models.ROOM].find_one({"_id": room_id})
    if not room or not room.get("property") or role != "Landlord":
        raise HTTPException(status_code=404, detail="not_found")
    author = await db[models.USER].find_one({"_id": to_oid(room.get("author"))})
    participant = await db[models.USER].find_one({"_id": to_oid(room.get("participant"))})
    if not author or not participant:
        raise HTTPException(status_code=404, detail="not_found")

    from app.services.document_service import can_complete_transaction

    document = await can_complete_transaction(db, room.get("author"), room.get("participant"))
    files = (document or {}).get("file") or []
    approved = bool(files) and all(isinstance(f, dict) and f.get("approved") for f in files)

    landlord_id = (
        room.get("author") if (author.get("role") == "Landlord") else room.get("participant")
    )
    tenant_id = room.get("author") if (author.get("role") == "Tenant") else room.get("participant")
    envelope = await db[models.ENVELOPE].find_one(
        {
            "tenant": to_oid(tenant_id),
            "land_lord": to_oid(landlord_id),
            "property": to_oid(room.get("property")),
            "document_type": {"$eq": "Rent Contract"},
        }
    )
    return {"areDocumentsApproved": approved, "isContractCreated": envelope is not None}


# --- realtime message handling (chat.service handleNewMessage) -----------------


async def handle_new_message(db: Any, emit: Any, data: dict) -> tuple[dict, str]:
    """Persist + notify + emit. `emit(event, payload, room=None)` abstracts the socket.

    Returns (message, notified_user_id). Mirrors handleNewMessage incl.
    receive_room_id when the client sends no room_id.
    """
    data = dict(data)
    if not data.get("room_id"):
        room_result = await db[models.ROOM].insert_one(
            {
                "author": to_oid(data.get("author")),
                "participant": to_oid(data.get("participant")),
                "property": to_oid(data.get("property")),
                "created_at": datetime.now(UTC),
            }
        )
        created = await db[models.ROOM].find_one({"_id": room_result.inserted_id})
        await emit("receive_room_id", await populate_room(db, created or {}, full=True))
        data["room_id"] = room_result.inserted_id
        room = await populate_room(db, created or {}, full=True)
    else:
        data["room_id"] = to_oid(data["room_id"])
        found = await db[models.ROOM].find_one({"_id": data["room_id"]})
        if not found:
            raise HTTPException(status_code=404, detail="room not found")
        room = await populate_room(db, found, full=True)

    author = room.get("author") or {}
    participant = room.get("participant") or {}
    data["participant"] = participant.get("_id") if isinstance(participant, dict) else participant
    data["author"] = author.get("_id") if isinstance(author, dict) else author
    data["seen"] = False
    data["created_at"] = datetime.now(UTC)
    result = await db[models.MESSAGE].insert_one(data)
    created_msg = await db[models.MESSAGE].find_one({"_id": result.inserted_id})
    if created_msg is None:
        raise HTTPException(status_code=500, detail="unexpected_empty_result")

    sender = str(data.get("sender"))
    notified = (
        str(data["author"]) if sender == str(data["participant"]) else str(data["participant"])
    )
    await db[models.NOTIFICATION].insert_one(
        {
            "user": to_oid(notified),
            "entity": "Message",
            "entity_id": created_msg["_id"],
            "data": {
                **serialize_doc(created_msg),
                "room_id": created_msg.get("room_id"),
                "sender": to_oid(data.get("sender")),
            },
            "type": "Chat",
            "viewed": False,
            "created_at": datetime.now(UTC),
        }
    )

    latest = await db[models.MESSAGE].find_one(
        {"room_id": to_oid(data["room_id"])}, sort=[("created_at", -1)]
    )
    await emit("receive_message", serialize_doc(latest or created_msg), room=str(data["room_id"]))
    return serialize_doc(created_msg), notified


async def record_property_view(db: Any, *, property_id: Any, user_id: Any) -> bool:
    """Port of the view_property socket event. Returns True on first view."""
    from app.services.property_service import increment_detail

    existing = await db[models.PROPERTY_VIEW].find_one(
        {"created_by": to_oid(user_id), "property": to_oid(property_id)}
    )
    if existing:
        return False
    await db[models.PROPERTY_VIEW].insert_one(
        {
            "property": to_oid(property_id),
            "created_by": to_oid(user_id),
            "created_at": datetime.now(UTC),
        }
    )
    await increment_detail(db, property_id, {"views": 1})
    return True

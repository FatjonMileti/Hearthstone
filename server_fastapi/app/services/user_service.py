from datetime import UTC, datetime
from typing import Any
from uuid import uuid4

from bson import ObjectId

from app import models
from app.core.security import ahash_password, is_password_strong
from app.services.email_service import EmailService, MailOptions
from app.services.log_service import LoginAction, write_login_log
from app.services.templates import (
    reset_password_html,
    reset_password_link,
    verify_email_html,
    verify_link,
)

WELCOME_MESSAGE_TEMPLATE = (
    "Hey {first_name}, welcome to Hearthstone! We`re happy you choose to find a perfect "
    "match and not waste time with unnecessary listings. To get started you have to initiate "
    "a match finding. We recommend that you fill out all details in order to make the algorithm "
    "learn from your choices and show you curated listings based on your needs. Any questions "
    "you have you can write them in this chat and our AI will answer you instantly. "
    "Are you ready to start your journey with Hearthstone?"
)

PUBLIC_FIELDS_PROJECTION = {"hash": 0}


def serialize_user(doc: dict) -> dict:
    """Port of mapToUser: {id, ...doc} with hash stripped and ObjectIds stringified."""
    out: dict[str, Any] = {}
    for key, value in doc.items():
        if key == "hash":
            continue
        if key == "_id":
            out["_id"] = str(value)
            continue
        if isinstance(value, ObjectId):
            out[key] = str(value)
        elif isinstance(value, datetime):
            out[key] = value.isoformat()
        else:
            out[key] = value
    out["id"] = out.get("_id")
    return out


async def calculate_trust_score(db: Any, user: dict) -> int:
    """Port of calculateProfileCompleteness (user.schema.ts)."""
    score = 0
    user_id = user["_id"]
    role = user.get("role")

    if role == "Landlord":
        nr = await db[models.PROPERTY].count_documents({"created_by": user_id})
        if nr:
            score += 10
        live_prop = await db[models.PROPERTY].find_one(
            {"created_by": user_id, "status_string": "Live"}
        )
        if live_prop and live_prop.get("property_images"):
            score += 20
    elif role == "Tenant":
        criteria = await db[models.CRITERIA].find_one({"created_by": user_id})
        if criteria:
            if criteria.get("budget"):
                score += 10
            room = criteria.get("room_details") or {}
            features = criteria.get("specific_property_features") or []
            if (
                criteria.get("floor_size") != "0-0"
                and room.get("number_of_bathrooms") != "0-0"
                and room.get("number_of_bedrooms") != "0-0"
                and len(features)
            ):
                score += 20

    if user.get("signed_transaction_agreement"):
        score += 20
    if user.get("avatar"):
        score += 5
    if user.get("first_name") and user.get("email"):
        score += 10
    if user.get("agreed_application_policy"):
        score += 10
    if user.get("address"):
        score += 5
    docs = user.get("documents") or []
    if len(docs) >= 1 and isinstance(docs[0], dict) and docs[0].get("key"):
        score += 10
    # PARITY QUIRK (user.schema.ts): moment().diff(moment(created_at, 'days')) compares
    # milliseconds >= 7, so this is +10 for every user with a created_at. Replicated.
    if user.get("created_at"):
        score += 10
    return min(100, score)


async def set_trust_score(db: Any, user_id: ObjectId) -> int:
    user = await db[models.USER].find_one({"_id": user_id})
    if not user:
        return 0
    score = await calculate_trust_score(db, user)
    await db[models.USER].update_one({"_id": user_id}, {"$set": {"trust_score": score}})
    return score


async def find_one(db: Any, query: dict, include_hash: bool = False) -> dict | None:
    doc = await db[models.USER].find_one(query)
    if doc and not include_hash:
        doc.pop("hash", None)
    return doc


async def find_by_query(db: Any, query: dict) -> list[dict]:
    cursor = db[models.USER].find(query)
    return await cursor.to_list(length=None)


async def create_user(
    db: Any,
    *,
    first_name: str,
    last_name: str,
    email: str,
    password: str,
    settings: Any,
) -> dict:
    """Port of user.service createUser (also serves POST /api/account/register)."""
    existing = await db[models.USER].find_one({"email": email})
    if existing:
        raise _http(400, "user_already_exists")

    strong, message = is_password_strong(password)
    if not strong:
        raise _http(400, message)

    hashed = await ahash_password(password)
    confirmation_token = str(uuid4())
    now = datetime.now(UTC)
    doc: dict[str, Any] = {
        "first_name": first_name,
        "last_name": last_name,
        "email": email,
        "hash": hashed,
        "confirmation_token": confirmation_token,
        "address": "",
        "role": "NewUser",
        "is_disabled": True,
        "created_at": now,
    }
    result = await db[models.USER].insert_one(doc)
    saved = await db[models.USER].find_one({"_id": result.inserted_id})
    if saved is None:
        raise _http(500, "user_not_created")

    # Verification email (fire-and-forget like Node's .then() chain).
    try:
        email_service = EmailService.get_instance()
        await email_service.send_mail(
            MailOptions(
                to=email,
                subject="Confirm your user",
                html=verify_email_html(verify_link(settings, confirmation_token)),
            )
        )
    except (RuntimeError, OSError):
        pass

    # Welcome Agent -> user room + message + notification.
    agent = await db[models.USER].find_one({"role": "Agent"})
    if agent:
        room_result = await db[models.ROOM].insert_one(
            {
                "author": agent["_id"],
                "participant": saved["_id"],
                "property": None,
                "created_at": now,
            }
        )
        message_doc = {
            "room_id": room_result.inserted_id,
            "participant": saved["_id"],
            "author": agent["_id"],
            "sender": agent["_id"],
            "message": WELCOME_MESSAGE_TEMPLATE.format(first_name=first_name),
            "seen": False,
            "created_at": now,
        }
        msg_result = await db[models.MESSAGE].insert_one(message_doc)
        message_doc["_id"] = msg_result.inserted_id
        await db[models.NOTIFICATION].insert_one(
            {
                "user": saved["_id"],
                "entity": "Message",
                "entity_id": msg_result.inserted_id,
                "data": {**message_doc, "_id": str(msg_result.inserted_id)},
                "type": "Chat",
                "viewed": False,
                "created_at": now,
            }
        )

    return serialize_user(saved)


async def list_users(
    db: Any,
    *,
    self_id: ObjectId,
    search: str | None = None,
    is_disabled: bool | None = None,
    role: str | None = None,
    created_since: datetime | None = None,
    created_until: datetime | None = None,
    page: int | None = None,
    page_size: int | None = None,
    sort_field: str | None = None,
    sort_dir: int = -1,
) -> dict:
    """Port of user.service getAll. Returns mongoose-paginate-v2 shaped payload."""
    query: dict[str, Any] = {"deleted_at": {"$exists": False}, "_id": {"$nin": [self_id]}}
    if search:
        query["$or"] = [
            {"first_name": {"$regex": search, "$options": "i"}},
            {"last_name": {"$regex": search, "$options": "i"}},
            {"phone": {"$regex": search, "$options": "i"}},
            {"email": {"$regex": search, "$options": "i"}},
        ]
    if is_disabled is not None:
        query["is_disabled"] = is_disabled
    if role:
        query["role"] = role
    if created_since or created_until:
        query["created_at"] = {}
        if created_since:
            query["created_at"]["$gt"] = created_since
        if created_until:
            query["created_at"]["$lte"] = created_until

    sort_spec = [(sort_field or "created_at", sort_dir)]
    total = await db[models.USER].count_documents(query)
    cursor = db[models.USER].find(query, {"hash": 0}).sort(sort_spec)
    if page and page_size:
        cursor = cursor.skip((page - 1) * page_size).limit(page_size)
        docs = await cursor.to_list(length=page_size)
        total_pages = max((total + page_size - 1) // page_size, 1)
        return {
            "docs": [serialize_user(d) for d in docs],
            "totalDocs": total,
            "limit": page_size,
            "page": page,
            "totalPages": total_pages,
            "pagingCounter": (page - 1) * page_size + 1 if total else 0,
            "hasPrevPage": page > 1,
            "hasNextPage": page < total_pages,
            "prevPage": page - 1 if page > 1 else None,
            "nextPage": page + 1 if page < total_pages else None,
        }
    docs = await cursor.to_list(length=None)
    return {"docs": [serialize_user(d) for d in docs], "totalDocs": total}


async def get_by_id(db: Any, user_id: ObjectId) -> dict | None:
    doc = await db[models.USER].find_one(
        {"_id": user_id, "deleted_at": {"$exists": False}}, {"hash": 0}
    )
    return serialize_user(doc) if doc else None


PATCHABLE_FIELDS = (
    "first_name",
    "last_name",
    "email",
    "age",
    "address",
    "martial_status",
    "have_pets",
    "phone",
    "description",
    "avatar",
    "notification",
    "documents",
    "agreed_application_policy",
)


async def update_user(db: Any, user_id: ObjectId, body: dict) -> dict | None:
    user = await db[models.USER].find_one({"_id": user_id})
    if not user:
        return None
    update: dict[str, Any] = {}
    for field in PATCHABLE_FIELDS:
        if field in ("first_name", "last_name", "email", "avatar", "notification", "documents"):
            if body.get(field):
                update[field] = body[field]
        elif field in body:
            update[field] = body[field]
    if update:
        await db[models.USER].update_one({"_id": user_id}, {"$set": update})
    await set_trust_score(db, user_id)
    updated = await db[models.USER].find_one({"_id": user_id}, {"hash": 0})
    if updated is None:
        raise _http(500, "user_not_updated")
    return serialize_user(updated)


async def soft_delete_self(db: Any, user_id: ObjectId) -> None:
    """Port of deleteUser: anonymize self (DELETE /api/user has no :id)."""
    await db[models.USER].update_one(
        {"_id": user_id},
        {
            "$set": {
                "deleted_at": datetime.now(UTC),
                "first_name": "Hearthstone",
                "last_name": "User",
                "email": "",
                "phone": "",
                "avatar": "",
                "is_disabled": True,
                "documents": [],
                "google": {"username": "", "google_user_id": "", "is_google_verified": False},
                "facebook": {
                    "username": "",
                    "facebook_user_id": "",
                    "is_facebook_verified": False,
                },
                "twitter": {
                    "username": "",
                    "twitter_user_id": "",
                    "is_twitter_verified": False,
                },
            }
        },
    )


async def send_reset_instructions(
    db: Any, *, email: str, subject: str, settings: Any, for_user_id: ObjectId | None = None
) -> None:
    query: dict[str, Any] = {"_id": for_user_id} if for_user_id else {"email": email}
    user = await db[models.USER].find_one(query)
    if not user:
        raise _http(404, "user_not_found")
    token = str(uuid4())
    await db[models.USER].update_one({"_id": user["_id"]}, {"$set": {"confirmation_token": token}})
    template = reset_password_html(
        reset_password_link(settings, token),
        f"{user.get('first_name', '')}{user.get('last_name', '')}",
    )
    try:
        await EmailService.get_instance().send_mail(
            MailOptions(to=user["email"], subject=subject, html=template)
        )
    except (RuntimeError, OSError):
        pass


async def reset_password(db: Any, *, token: str, password: str, settings: Any) -> dict:
    """Port of resetUserPassword. Returns token pair WITHOUT rules (Node behavior)."""
    from app.core.security import generate_token_pair

    user = await db[models.USER].find_one({"confirmation_token": token})
    if not user:
        raise _http(404, "user_not_found")
    strong, message = is_password_strong(password)
    if not strong:
        raise _http(400, message)
    hashed = await ahash_password(password)
    await db[models.USER].update_one(
        {"_id": user["_id"]}, {"$set": {"hash": hashed, "confirmation_token": None}}
    )
    pair = generate_token_pair(
        user_id=str(user["_id"]),
        first_name=user.get("first_name", ""),
        role=user.get("role", ""),
        jwt_secret=settings.jwt_secret,
        refresh_secret=settings.refresh_secret,
        jwt_expire_seconds=settings.jwt_expire_seconds,
        refresh_expire_seconds=settings.refresh_expire_seconds,
        rules=[],
    )
    await write_login_log(db, user_id=user["_id"], action=LoginAction.Login)
    return pair


def _http(status: int, message: str) -> Any:
    from fastapi import HTTPException

    return HTTPException(status_code=status, detail=message)

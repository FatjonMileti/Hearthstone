"""Admin log explorer. Port of Agent/admin.service.ts + helpers/filters.ts.

Filters replicated: search (user first/last regex, applied post-join since it
targets populated fields), action equality, type lastmonth/lastweek/lastday
(date windows on `date`).
"""

from datetime import UTC, datetime, timedelta
from typing import Any

from app import models
from app.services.mongo_helpers import paginate_response, serialize_doc, to_oid


def build_log_filter(
    *, search: str | None, action: str | None, type_filter: str | None
) -> tuple[dict, str | None]:
    query: dict[str, Any] = {}
    if action:
        query["action"] = {"$eq": action}
    now = datetime.now(UTC)
    if type_filter == "lastmonth":
        start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        prev = (start - timedelta(days=1)).replace(day=1)
        query["date"] = {"$gte": prev, "$lt": start}
    elif type_filter == "lastweek":
        start_of_week = (now - timedelta(days=now.weekday())).replace(
            hour=0, minute=0, second=0, microsecond=0
        )
        query["date"] = {"$gte": start_of_week - timedelta(weeks=1), "$lt": start_of_week}
    elif type_filter == "lastday":
        start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        query["date"] = {"$gte": start, "$lt": start + timedelta(days=1)}
    return query, search


async def _populate_user(db: Any, doc: dict, extra: set[str] | None = None) -> dict:
    out = serialize_doc(doc)
    select = {"first_name": 1, "last_name": 1, "avatar": 1}
    if extra:
        for field in extra:
            select[field] = 1
    person = await db[models.USER].find_one({"_id": to_oid(doc.get("user"))}, select)
    out["user"] = serialize_doc(person) if person else doc.get("user")
    return out


def _matches_search(item: dict, search: str | None) -> bool:
    if not search:
        return True
    user = item.get("user") or {}
    if not isinstance(user, dict):
        return False
    needle = search.lower()
    return (
        needle in str(user.get("first_name", "")).lower()
        or needle in str(user.get("last_name", "")).lower()
    )


async def list_logs(
    db: Any,
    *,
    collection: str,
    search: str | None,
    action: str | None,
    type_filter: str | None,
    page: int | None,
    page_size: int | None,
) -> dict:
    query, _ = build_log_filter(search=search, action=action, type_filter=type_filter)
    total = await db[collection].count_documents(query)
    cursor = db[collection].find(query).sort([("date", -1)])
    if page and page_size:
        docs = await cursor.skip((page - 1) * page_size).limit(page_size).to_list(length=page_size)
    else:
        docs = await cursor.to_list(length=None)
    populated = [await _populate_user(db, d) for d in docs]
    populated = [d for d in populated if _matches_search(d, search)]
    # Search targets populated user fields, so it narrows in Python; the total
    # reflects the narrowed set (Node's $or on the unpopulated ref never matches).
    total = len(populated) if search else total
    return paginate_response(populated, total=total, page=page, limit=page_size)


async def get_log_by_id(
    db: Any,
    *,
    collection: str,
    log_id: Any,
    not_found_message: str,
    extra_user_fields: set[str] | None = None,
    populate_ref: bool = False,
) -> dict:
    from fastapi import HTTPException

    doc = await db[collection].find_one({"_id": to_oid(log_id)})
    if not doc:
        raise HTTPException(status_code=404, detail=not_found_message)
    out = await _populate_user(db, doc, extra_user_fields)
    if populate_ref and doc.get("ref") is not None:
        ref = await db[models.PROPERTY].find_one({"_id": to_oid(doc.get("ref"))})
        out["ref"] = serialize_doc(ref) if ref else doc.get("ref")
    return out

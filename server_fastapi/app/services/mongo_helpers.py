"""Shared Mongo helpers: serialization + paginate-shaped responses."""

from datetime import datetime
from typing import Any

from bson import ObjectId


def serialize_doc(doc: dict) -> dict:
    out: dict[str, Any] = {}
    for key, value in doc.items():
        if key == "_id":
            out["_id"] = str(value)
        elif isinstance(value, ObjectId):
            out[key] = str(value)
        elif isinstance(value, datetime):
            out[key] = value.isoformat()
        elif isinstance(value, list):
            out[key] = [_stringify(v) for v in value]
        elif isinstance(value, dict):
            out[key] = {k: _stringify(v) for k, v in value.items()}
        else:
            out[key] = value
    out["id"] = out.get("_id")
    return out


def _stringify(value: Any) -> Any:
    if isinstance(value, ObjectId):
        return str(value)
    if isinstance(value, datetime):
        return value.isoformat()
    if isinstance(value, dict):
        return {k: _stringify(v) for k, v in value.items()}
    if isinstance(value, list):
        return [_stringify(v) for v in value]
    return value


def to_oid(value: Any) -> ObjectId | None:
    if value is None:
        return None
    if isinstance(value, ObjectId):
        return value
    try:
        return ObjectId(str(value))
    except Exception:
        return None


def paginate_response(docs: list[dict], *, total: int, page: int | None, limit: int | None) -> dict:
    if page and limit:
        total_pages = max((total + limit - 1) // limit, 1)
        return {
            "docs": docs,
            "totalDocs": total,
            "limit": limit,
            "page": page,
            "totalPages": total_pages,
            "pagingCounter": (page - 1) * limit + 1 if total else 0,
            "hasPrevPage": page > 1,
            "hasNextPage": page < total_pages,
            "prevPage": page - 1 if page > 1 else None,
            "nextPage": page + 1 if page < total_pages else None,
        }
    return {"docs": docs, "totalDocs": total}

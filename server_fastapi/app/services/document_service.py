"""Document domain service. Port of Document/document.service.ts + controller flows.

Quirks replicated:
- GET /api/document queries {user: <unset>} (Node reads req.user._id which the
  JWT middleware never sets) and therefore returns [] — implemented literally.
- PATCH merges via handleUploadedDocuments, applies landlord-only fileDoc
  approval, then applies {file} iff the body carried `file` (Node's final
  findByIdAndUpdate(id, {file}) with undefined `file` is a driver no-op).
- DELETE returns 200 {message} (Node uses 200, not 204).
"""

import logging
from datetime import UTC, datetime
from typing import Any

from bson import ObjectId
from fastapi import HTTPException

from app import models
from app.services.mongo_helpers import serialize_doc, to_oid

logger = logging.getLogger("hearthstone.documents")


def document_approved(files: list) -> bool:
    return bool(files) and all(isinstance(f, dict) and f.get("approved") for f in files)


async def can_complete_transaction(db: Any, landlord: Any, tenant: Any) -> dict | None:
    doc = await db[models.DOCUMENT].find_one(
        {
            "$or": [
                {"tenant": to_oid(landlord), "landlord": to_oid(tenant)},
                {"tenant": to_oid(tenant), "landlord": to_oid(landlord)},
            ]
        }
    )
    if not doc:
        return None
    out = serialize_doc(doc)
    out["approved"] = document_approved(doc.get("file") or [])
    return out


async def list_documents(db: Any) -> list[dict]:
    """PARITY QUIRK: Node queries {user: req.user._id} with req.user unset."""
    docs = await db[models.DOCUMENT].find({"user": None}).to_list(length=None)
    return [serialize_doc(d) for d in docs]


async def get_by_users(db: Any, *, me: str, participant: str | None) -> dict:
    if not participant:
        raise HTTPException(status_code=404, detail="not_found")
    doc = await db[models.DOCUMENT].find_one(
        {
            "$or": [
                {"tenant": to_oid(me), "landlord": to_oid(participant)},
                {"tenant": to_oid(participant), "landlord": to_oid(me)},
            ]
        }
    )
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return serialize_doc(doc)


async def get_by_id(db: Any, doc_id: ObjectId) -> dict:
    doc = await db[models.DOCUMENT].find_one({"_id": doc_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return serialize_doc(doc)


async def create_document(db: Any, *, user_id: str, role: str, file: Any, participant: Any) -> dict:
    me = await db[models.USER].find_one({"_id": to_oid(user_id)})
    if not me:
        raise HTTPException(status_code=404, detail="not_found")
    # Node Role.Client == 'Tenant': tenant is self for tenants, else the participant.
    doc = {
        "tenant": to_oid(user_id) if role == "Tenant" else to_oid(participant),
        "landlord": to_oid(user_id) if role == "Landlord" else to_oid(participant),
        "file": file,
        "created_by": to_oid(user_id),
        "created_at": datetime.now(UTC),
        "updated_at": datetime.now(UTC),
    }
    result = await db[models.DOCUMENT].insert_one(doc)
    created = await db[models.DOCUMENT].find_one({"_id": result.inserted_id})
    if created is None:
        raise HTTPException(status_code=500, detail="unexpected_empty_result")
    return serialize_doc(created)


def merge_files(existing: list, incoming: list) -> list:
    if len(existing) == len(incoming) and all(x in incoming for x in existing):
        return list(incoming)
    return list(incoming)


async def update_document(
    db: Any,
    *,
    doc_id: ObjectId,
    body: dict,
    can_approve: bool,
    storage_delete: Any = None,
) -> dict:
    doc = await db[models.DOCUMENT].find_one({"_id": doc_id})
    if not doc:
        raise HTTPException(status_code=404, detail="document_not_found")
    merged = list(doc.get("file") or [])
    if "file" in body:
        incoming = body.get("file") or []
        removed = [
            f
            for f in merged
            if isinstance(f, dict)
            and not any(isinstance(n, dict) and n.get("key") == f.get("key") for n in incoming)
        ]
        if removed and storage_delete is not None:
            for img in removed:
                try:
                    await storage_delete(img.get("key"))
                except Exception as exc:
                    logger.info("orphaned document delete failed: %s", exc)
        merged = merge_files(merged, incoming)
    if can_approve and "fileDoc" in body:
        file_doc = body.get("fileDoc") or {}
        merged = [
            file_doc
            if (isinstance(item, dict) and item.get("key") == file_doc.get("key"))
            else item
            for item in merged
        ]
    update: dict[str, Any] = {"updated_at": datetime.now(UTC), "file": merged}
    if body.get("file") is not None:
        # Node's final findByIdAndUpdate(id, {file}) — no-op when body.file unset.
        update["file"] = body["file"]
    await db[models.DOCUMENT].update_one({"_id": doc_id}, {"$set": update})
    updated = await db[models.DOCUMENT].find_one({"_id": doc_id})
    if updated is None:
        raise HTTPException(status_code=500, detail="unexpected_empty_result")
    return serialize_doc(updated)


async def delete_document(db: Any, doc_id: ObjectId) -> dict:
    doc = await db[models.DOCUMENT].find_one({"_id": doc_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    await db[models.DOCUMENT].delete_one({"_id": doc_id})
    return {"message": "Document deleted successfully"}

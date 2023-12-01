"""Document router. Port of Document/document.controller.ts route table.

Static /by-user and /upload are declared BEFORE /:id so they are not shadowed.
PATCH carries the Update-Documents ability gate (field-level approval resolved
inside the service, mirroring req.ability).
"""

from typing import Annotated, Any

from fastapi import APIRouter, Depends, File, Query, Request, UploadFile

from app.api.deps import CurrentUser, validate_object_id
from app.core.config import Settings, get_settings
from app.core.permissions import Action, can_on_object
from app.services import document_service
from app.services.storage import select_storage
from app.services.storage.base import UploadedFile

router = APIRouter(prefix="/document", tags=["document"])


def _db(request: Request) -> Any:
    return request.app.state.db


@router.get("/", status_code=200)
async def list_all(request: Request, user: CurrentUser):  # type: ignore[no-untyped-def]
    _ = user
    # PARITY QUIRK: Node queries {user: req.user._id} with req.user unset -> [].
    return await document_service.list_documents(_db(request))


@router.get("/by-user", status_code=200)
async def by_user(
    request: Request,
    user: CurrentUser,
    participant: Annotated[str | None, Query()] = None,
):  # type: ignore[no-untyped-def]
    return await document_service.get_by_users(
        _db(request), me=user["user_id"], participant=participant
    )


@router.get("/{id}", status_code=200)
async def get_by_id(id: str, request: Request, user: CurrentUser):  # type: ignore[no-untyped-def]
    _ = user
    return await document_service.get_by_id(_db(request), validate_object_id(id))


@router.post("/", status_code=201)
async def create(body: dict, request: Request, user: CurrentUser):  # type: ignore[no-untyped-def]
    return await document_service.create_document(
        _db(request),
        user_id=user["user_id"],
        role=user["role"],
        file=body.get("file"),
        participant=body.get("participant"),
    )


@router.post("/upload", status_code=200)
async def upload(
    request: Request,
    user: CurrentUser,
    settings: Annotated[Settings, Depends(get_settings)],
    files: Annotated[list[UploadFile], File()] = ...,  # type: ignore[assignment]
):  # type: ignore[no-untyped-def]
    service = select_storage(settings)
    uploads = [
        UploadedFile(
            filename=f.filename or "file",
            originalname=f.filename or "file",
            mimetype=f.content_type or "application/octet-stream",
            buffer=await f.read(),
        )
        for f in files
    ]
    stored = await service.upload_files(uploads, _db(request))
    _ = user
    return [
        {
            "key": s.key,
            "mimetype": s.mimetype,
            "originalName": s.originalName,
            "link": s.link,
            "isNew": s.isNew,
        }
        for s in stored
    ]


@router.patch("/{id}", status_code=200)
async def update(
    id: str,
    body: dict,
    request: Request,
    user: CurrentUser,
    settings: Annotated[Settings, Depends(get_settings)],
):  # type: ignore[no-untyped-def]
    if not can_on_object(user["user_id"], user["role"], Action.update, "Documents", None):
        from fastapi import HTTPException

        raise HTTPException(status_code=403, detail="forbidden")
    can_approve = _can_approve_field(user)
    storage = select_storage(settings)

    async def _delete(key: str) -> bool:
        return await storage.delete_file(key, _db(request))

    return await document_service.update_document(
        _db(request),
        doc_id=validate_object_id(id),
        body=body,
        can_approve=can_approve,
        storage_delete=_delete,
    )


@router.delete("/{id}", status_code=200)
async def delete(id: str, request: Request, user: CurrentUser):  # type: ignore[no-untyped-def]
    _ = user
    return await document_service.delete_document(_db(request), validate_object_id(id))


def _can_approve_field(user: dict) -> bool:
    from app.core.permissions import can_on_object as _can

    # Field-level check mirroring ability.can(Update, 'Documents', 'file.approved').
    return _can(
        user["user_id"], user["role"], Action.update, "Documents", None, field="file.approved"
    )

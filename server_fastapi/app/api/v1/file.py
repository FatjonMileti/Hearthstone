"""File serving router. Port of File/file.controller.ts (GET /:filename, public).

Lookup by filename OR key; 404 when unknown. Content-Type from stored mimetype.
Azure backend streams the blob buffer; all other backends read local disk
(Node branches only on useAzureStorage — replicated).
"""

from typing import Annotated, Any

from fastapi import APIRouter, Depends, Request
from fastapi.responses import Response as RawResponse

from app import models
from app.core.config import Settings, get_settings
from app.services.storage import select_storage

router = APIRouter(prefix="/file", tags=["file"])


@router.get("/{filename}", include_in_schema=False)
async def get_file(
    filename: str,
    request: Request,
    settings: Annotated[Settings, Depends(get_settings)],
) -> Any:
    from fastapi import HTTPException

    db: Any = request.app.state.db
    meta = await db[models.FILE].find_one({"$or": [{"filename": filename}, {"key": filename}]})
    if not meta:
        raise HTTPException(status_code=404, detail="not_found")
    service = select_storage(settings)
    content = await service.get_file(filename, db)
    if content is None:
        raise HTTPException(status_code=404, detail="not_found")
    return RawResponse(
        content=bytes(content), media_type=meta.get("mimetype") or "application/octet-stream"
    )

"""Asset router. Port of Property/property.controller.ts route table.

Static paths (/last, /draft, /upload, /generate-images) are declared BEFORE
/:id so they are not shadowed — same order as the Express controller.
"""

from typing import Annotated, Any

from fastapi import APIRouter, Depends, File, HTTPException, Query, Request, UploadFile

from app.api.deps import CurrentUser, Paging, validate_object_id
from app.core.config import Settings, get_settings
from app.core.permissions import Action, can_on_object
from app.schemas.asset import AssetCreateFull, AssetDraft
from app.services import property_service
from app.services.google_maps import from_settings as maps_from_settings
from app.services.storage import select_storage
from app.services.storage.base import UploadedFile

router = APIRouter(prefix="/asset", tags=["asset"])


def _db(request: Request) -> Any:
    return request.app.state.db


def _api_url(settings: Settings) -> str:
    return settings.absolute_url.rstrip("/")


@router.get("/", status_code=200)
async def find_all(
    request: Request,
    user: CurrentUser,
    paging: Paging,
    settings: Annotated[Settings, Depends(get_settings)],
    status: Annotated[str | None, Query()] = None,
):  # type: ignore[no-untyped-def]
    if not can_on_object(user["user_id"], user["role"], Action.read, "Property", None):
        raise HTTPException(status_code=403, detail="forbidden")
    return await property_service.find_all(
        _db(request),
        user_id=user["user_id"],
        role=user["role"],
        status=status,
        page=paging.page if paging.pagination_enabled else None,
        page_size=paging.page_size if paging.pagination_enabled else None,
        sort_field=paging.sort,
        sort_dir=paging.sort_direction,
        api_url=_api_url(settings),
        log_days=settings.log_expiration_days,
    )


@router.get("/last", status_code=200)
async def get_last(
    request: Request,
    user: CurrentUser,
    settings: Annotated[Settings, Depends(get_settings)],
):  # type: ignore[no-untyped-def]
    return await property_service.find_last_with_details(
        _db(request), user["user_id"], _api_url(settings)
    )


@router.post("/", status_code=201)
async def create_asset(
    body: AssetCreateFull,
    request: Request,
    user: CurrentUser,
    settings: Annotated[Settings, Depends(get_settings)],
):  # type: ignore[no-untyped-def]
    return await property_service.create_asset(
        _db(request),
        data=body.model_dump(exclude_unset=False),
        user_id=user["user_id"],
        api_url=_api_url(settings),
        log_days=settings.log_expiration_days,
        maps=maps_from_settings(settings),
    )


@router.post("/generate-images", status_code=200)
async def generate_images(
    body: dict,
    user: CurrentUser,
    settings: Annotated[Settings, Depends(get_settings)],
):  # type: ignore[no-untyped-def]
    _ = user
    prompt = body.get("prompt")
    if not prompt:
        raise HTTPException(status_code=400, detail="Prompt is required")
    from app.services.image_generator import generate_images_from_settings

    images = await generate_images_from_settings(prompt, settings)
    return {"images": images}


@router.post("/draft", status_code=201)
async def create_draft(
    body: AssetDraft,
    request: Request,
    user: CurrentUser,
    settings: Annotated[Settings, Depends(get_settings)],
):  # type: ignore[no-untyped-def]
    return await property_service.create_asset(
        _db(request),
        data=body.model_dump(exclude_unset=False),
        user_id=user["user_id"],
        api_url=_api_url(settings),
        log_days=settings.log_expiration_days,
        maps=maps_from_settings(settings),
    )


@router.post("/upload", status_code=200)
async def upload(
    request: Request,
    user: CurrentUser,
    settings: Annotated[Settings, Depends(get_settings)],
    files: Annotated[list[UploadFile], File()] = ...,  # type: ignore[assignment]
):  # type: ignore[no-untyped-def]
    _ = user
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


@router.get("/{id}/viewed-by", status_code=200)
async def viewed_by(
    id: str,
    request: Request,
    user: CurrentUser,
    paging: Paging,
    settings: Annotated[Settings, Depends(get_settings)],
):  # type: ignore[no-untyped-def]
    _ = user
    oid = validate_object_id(id)
    return await property_service.get_viewers(
        _db(request),
        prop_id=oid,
        page=paging.page if paging.pagination_enabled else None,
        page_size=paging.page_size if paging.pagination_enabled else None,
        api_url=_api_url(settings),
    )


@router.get("/{id}/get-applications", status_code=200)
async def get_applications(id: str, request: Request, user: CurrentUser, paging: Paging):  # type: ignore[no-untyped-def]
    _ = user
    oid = validate_object_id(id)
    return await property_service.get_applications(
        _db(request),
        prop_id=oid,
        page=paging.page if paging.pagination_enabled else None,
        page_size=paging.page_size if paging.pagination_enabled else None,
    )


@router.get("/{id}/application", status_code=200)
async def get_one_application(id: str, request: Request, user: CurrentUser):  # type: ignore[no-untyped-def]
    oid = validate_object_id(id)
    return await property_service.get_one_application(
        _db(request), prop_id=oid, user_id=user["user_id"]
    )


@router.post("/{id}/send-application", status_code=200)
async def send_application(
    id: str,
    body: dict,
    request: Request,
    user: CurrentUser,
    settings: Annotated[Settings, Depends(get_settings)],
):  # type: ignore[no-untyped-def]
    oid = validate_object_id(id)
    return await property_service.send_application(
        _db(request),
        prop_id=oid,
        body=body,
        user_id=user["user_id"],
        username=user.get("username") or "",
        frontend_url=settings.frontend_url,
    )


@router.patch("/{id}/approve-application", status_code=200)
async def approve_application(
    id: str,
    body: dict,
    request: Request,
    user: CurrentUser,
    settings: Annotated[Settings, Depends(get_settings)],
):  # type: ignore[no-untyped-def]
    oid = validate_object_id(id)
    return await property_service.approve_application(
        _db(request),
        route_id=oid,
        body=body,
        user_id=user["user_id"],
        username=user.get("username") or "",
        frontend_url=settings.frontend_url,
    )


@router.patch("/{id}/update-application", status_code=200)
async def update_application(id: str, body: dict, request: Request, user: CurrentUser):  # type: ignore[no-untyped-def]
    oid = validate_object_id(id)
    return await property_service.update_application(
        _db(request), prop_id=oid, body=body, user_id=user["user_id"]
    )


@router.post("/{id}/send-invitation", status_code=200)
async def send_invitation(
    id: str,
    body: dict,
    request: Request,
    user: CurrentUser,
    settings: Annotated[Settings, Depends(get_settings)],
):  # type: ignore[no-untyped-def]
    oid = validate_object_id(id)
    return await property_service.send_invitation(
        _db(request),
        prop_id=oid,
        body=body,
        user_id=user["user_id"],
        frontend_url=settings.frontend_url,
    )


@router.get("/{id}", status_code=200)
async def get_by_id(
    id: str,
    request: Request,
    user: CurrentUser,
    settings: Annotated[Settings, Depends(get_settings)],
):  # type: ignore[no-untyped-def]
    oid = validate_object_id(id)
    return await property_service.get_by_id(
        _db(request),
        oid,
        user_id=user["user_id"],
        api_url=_api_url(settings),
        log_days=settings.log_expiration_days,
    )


@router.patch("/{id}", status_code=200)
async def update_asset(
    id: str,
    body: AssetDraft,
    request: Request,
    user: CurrentUser,
    settings: Annotated[Settings, Depends(get_settings)],
):  # type: ignore[no-untyped-def]
    oid = validate_object_id(id)
    storage = select_storage(settings)

    async def _delete(key: str) -> bool:
        return await storage.delete_file(key, _db(request))

    return await property_service.update_asset(
        _db(request),
        prop_id=oid,
        data=body.model_dump(exclude_unset=True),
        user_id=user["user_id"],
        api_url=_api_url(settings),
        log_days=settings.log_expiration_days,
        maps=maps_from_settings(settings),
        storage_delete=_delete,
    )


@router.delete("/{id}", status_code=204)
async def delete_asset(
    id: str,
    request: Request,
    user: CurrentUser,
    settings: Annotated[Settings, Depends(get_settings)],
):  # type: ignore[no-untyped-def]
    from fastapi.responses import PlainTextResponse

    oid = validate_object_id(id)
    await property_service.delete_asset(
        _db(request),
        oid,
        user_id=user["user_id"],
        log_days=settings.log_expiration_days,
    )
    return PlainTextResponse("", status_code=204)

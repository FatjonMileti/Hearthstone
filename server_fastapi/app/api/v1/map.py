"""Map router. Port of Map/map.controller.ts route table. All routes PUBLIC (Node)."""

from typing import Annotated, Any

from fastapi import APIRouter, Depends, HTTPException, Query, Request

from app.core.config import Settings, get_settings
from app.services.google_maps import GoogleMapService, from_settings

router = APIRouter(prefix="/map", tags=["map"])


def get_maps(settings: Settings) -> GoogleMapService:
    return from_settings(settings)


@router.get("/", status_code=200)
async def address_by_latlong(
    request: Request,
    settings: Annotated[Settings, Depends(get_settings)],
    latitude: Annotated[str | None, Query()] = None,
    longitude: Annotated[str | None, Query()] = None,
):  # type: ignore[no-untyped-def]
    _ = request
    # PARITY QUIRK: Node checks `!longitude || !longitude` (longitude twice).
    if not longitude or not longitude:
        raise HTTPException(status_code=400, detail="latitude and longitude are required")
    try:
        data = get_maps(settings).get_address(float(latitude or 0), float(longitude))
        return dict(data) if isinstance(data, dict) else data
    except (TypeError, ValueError) as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from None


@router.get("/station", status_code=200)
async def stations(
    settings: Annotated[Settings, Depends(get_settings)],
    latitude: Annotated[str | None, Query()] = None,
    longitude: Annotated[str | None, Query()] = None,
):  # type: ignore[no-untyped-def]
    return await _nearby(settings, "subway_station", latitude, longitude)


@router.get("/school", status_code=200)
async def schools(
    settings: Annotated[Settings, Depends(get_settings)],
    latitude: Annotated[str | None, Query()] = None,
    longitude: Annotated[str | None, Query()] = None,
):  # type: ignore[no-untyped-def]
    return await _nearby(settings, "school", latitude, longitude)


@router.get("/places", status_code=200)
async def places(
    settings: Annotated[Settings, Depends(get_settings)],
    latitude: Annotated[str | None, Query()] = None,
    longitude: Annotated[str | None, Query()] = None,
):  # type: ignore[no-untyped-def]
    return await _nearby(settings, "store", latitude, longitude)


@router.get("/address/{address}/radius/{radius}", status_code=200)
async def address_radius(
    address: str, radius: str, settings: Annotated[Settings, Depends(get_settings)]
):  # type: ignore[no-untyped-def]
    # PARITY QUIRK: radius is accepted and ignored (TODO in Node).
    _ = radius
    return await _coordinates(settings, address)


@router.get("/address/{address}/", status_code=200)
async def address(address: str, settings: Annotated[Settings, Depends(get_settings)]):  # type: ignore[no-untyped-def]
    return await _coordinates(settings, address)


async def _nearby(settings: Settings, place_type: str, latitude: Any, longitude: Any) -> Any:
    try:
        return get_maps(settings).get_nearest_places_by_type(
            {"latitude": latitude, "longitude": longitude}, place_type
        )
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc) or "lookup failed") from None


async def _coordinates(settings: Settings, address: str) -> Any:
    coordinates = get_maps(settings).get_coordinates(address)
    if not coordinates:
        raise HTTPException(status_code=404, detail="Coordinates not found")
    return coordinates

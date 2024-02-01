"""Google Maps service. Behavior port of external-services/google-map.service.ts.

HTTP layer uses httpx (mirroring the axios calls in Node):
- get_coordinates(address): geocode/json -> results[0] if status OK else [];
  False on transport error.
- get_address(lat, lng): normalized shape; None when status != OK; False on error.
  Quirks replicated: `route` reads the street_number component (same as
  street_number in Node), neighbourhood is always '', country uses short_name
  with GB -> GBR.
- get_nearest_places_by_type(location, type): placesNearby radius 2000, top-3,
  each with walking distance -> [{place, distance}].
- get_distance_from(origin{lat,lng}, type): walking distance to first result.
"""

import logging
from typing import Any

import httpx

logger = logging.getLogger("hearthstone.maps")

GEOCODE_URL = "https://maps.googleapis.com/maps/api/geocode/json"
NEARBY_URL = "https://maps.googleapis.com/maps/api/place/nearbysearch/json"
MATRIX_URL = "https://maps.googleapis.com/maps/api/distancematrix/json"


class GoogleMapService:
    def __init__(self, api_key: str = "") -> None:
        self.api_key = api_key

    @property
    def available(self) -> bool:
        return bool(self.api_key)

    def _get(self, url: str, params: dict) -> dict | None:
        try:
            res = httpx.get(url, params=params, timeout=10)
            return res.json()
        except httpx.HTTPError as exc:
            logger.info("google maps request failed: %s", exc)
            return None

    def get_coordinates(self, address: str) -> Any:
        data = self._get(GEOCODE_URL, {"address": address, "key": self.api_key})
        if data is None:
            return False
        if data.get("status") == "OK":
            return data["results"][0]
        return []

    def get_address(self, lat: float, lng: float) -> Any:
        data = self._get(GEOCODE_URL, {"latlng": f"{lat},{lng}", "key": self.api_key})
        if data is None:
            return False
        if data.get("status") != "OK":
            return None
        return _normalize(lat, lng, data["results"][0])

    def get_nearest_places_by_type(self, location: dict, place_type: str) -> list[dict]:
        data = self._get(
            NEARBY_URL,
            {
                "location": f"{location.get('latitude')},{location.get('longitude')}",
                "radius": 2000,
                "type": place_type,
                "key": self.api_key,
            },
        )
        if not data:
            raise RuntimeError("places lookup failed")
        out = []
        for result in (data.get("results") or [])[:3]:
            geo = (result.get("geometry") or {}).get("location")
            if not geo:
                out.append({"place": result})
                continue
            out.append(
                {
                    "place": result,
                    "distance": _walking_distance(
                        self,
                        (location.get("latitude"), location.get("longitude")),
                        (geo.get("lat"), geo.get("lng")),
                    ),
                }
            )
        return out

    def get_distance_from(self, origin: dict, place_type: str) -> dict | None:
        data = self._get(
            NEARBY_URL,
            {
                "location": f"{origin.get('lat')},{origin.get('lng')}",
                "radius": 2000,
                "type": place_type,
                "key": self.api_key,
            },
        )
        results = (data or {}).get("results") or []
        geo = ((results[0].get("geometry") or {}).get("location")) if results else None
        if not geo:
            return None
        return _walking_distance(
            self, (origin.get("lat"), origin.get("lng")), (geo.get("lat"), geo.get("lng"))
        )


def _walking_distance(service: GoogleMapService, origin: Any, dest: Any) -> Any:
    data = service._get(
        MATRIX_URL,
        {
            "origins": f"{origin[0]},{origin[1]}",
            "destinations": f"{dest[0]},{dest[1]}",
            "mode": "walking",
            "key": service.api_key,
        },
    )
    try:
        return data["rows"][0]["elements"][0]["distance"]  # type: ignore[index]
    except (TypeError, KeyError, IndexError):
        return None


def _normalize(lat: float, lng: float, result: dict) -> dict:
    components = result.get("address_components", [])

    def _find(*types: str) -> dict:
        for component in components:
            if any(t in component.get("types", []) for t in types):
                return component
        return {}

    street_number = _find("street_number").get("long_name")
    country = _find("country").get("short_name")
    return {
        "latitude": lat,
        "longitude": lng,
        # PARITY QUIRK: Node reads 'street_number' for BOTH route and streetNumber.
        "street_number": street_number,
        "route": street_number,
        "neighbourhood": "",
        "postal_town": _find("postal_town").get("long_name"),
        "postal_code": _find("postal_code").get("long_name"),
        "administrative_area_level_1": _find("administrative_area_level_1").get("long_name"),
        "country_code": "GBR" if country == "GB" else country,
        "text": result.get("formatted_address"),
    }


def from_settings(settings: Any) -> GoogleMapService:
    return GoogleMapService(settings.google_map_key or "")

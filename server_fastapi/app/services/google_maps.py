"""Google Maps wrapper. Port of external-services/google-map.service.ts surface used by
property/criteria creation: get_coordinates(address), get_address(lat, lng) (normalized
to the property address shape), get_distance_from(origin, type).

When no API key is configured (or the call fails) every method returns None and
callers skip enrichment — offline-safe by design.
"""

import logging
from typing import Any

logger = logging.getLogger("hearthstone.maps")


class GoogleMapService:
    def __init__(self, api_key: str = "") -> None:
        self._client: Any = None
        if api_key:
            try:
                import googlemaps

                self._client = googlemaps.Client(key=api_key)
            except Exception as exc:
                logger.info("Google Maps client init failed: %s", exc)

    @property
    def available(self) -> bool:
        return self._client is not None

    def get_coordinates(self, address: str) -> dict | None:
        if not self._client:
            return None
        try:
            res = self._client.geocode(address)
            return res[0] if res else None
        except Exception as exc:
            logger.info("geocode failed: %s", exc)
            return None

    def get_address(self, lat: float, lng: float) -> dict | None:
        """Reverse-geocode and normalize (GB -> GBR country_code, like Node)."""
        if not self._client:
            return None
        try:
            res = self._client.reverse_geocode((lat, lng))
            if not res:
                return None
            return _normalize_geocode(lat, lng, res[0])
        except Exception as exc:
            logger.info("reverse geocode failed: %s", exc)
            return None

    def get_distance_from(self, origin: dict, place_type: str) -> dict | None:
        if not self._client:
            return None
        try:
            places = self._client.places_nearby(
                location=(origin["lat"], origin["lng"]), radius=2000, type=place_type
            )
            results = (places or {}).get("results", [])[:3]
            if not results:
                return None
            dest = (
                results[0]["geometry"]["location"]["lat"],
                results[0]["geometry"]["location"]["lng"],
            )
            matrix = self._client.distance_matrix(
                origins=[(origin["lat"], origin["lng"])],
                destinations=[dest],
                mode="walking",
            )
            element = matrix["rows"][0]["elements"][0]
            if element.get("status") != "OK":
                return None
            return element.get("distance")
        except Exception as exc:
            logger.info("distance lookup failed: %s", exc)
            return None


def _normalize_geocode(lat: float, lng: float, result: dict) -> dict:
    components = {t: c for c in result.get("address_components", []) for t in c.get("types", [])}

    def _get(*types: str) -> str:
        for t in types:
            if t in components:
                return components[t].get("long_name", "")
        return ""

    country = _get("country")
    country_code = "GBR" if country in ("United Kingdom", "UK", "GB") else country
    return {
        "latitude": lat,
        "longitude": lng,
        "street_number": _get("street_number"),
        "route": _get("route"),
        "neighbourhood": _get("neighbourhood", "sublocality"),
        "postal_town": _get("postal_town"),
        "postal_code": _get("postal_code"),
        "administrative_area_level_1": _get("administrative_area_level_1"),
        "country_code": country_code,
        "text": result.get("formatted_address", ""),
    }


def from_settings(settings: Any) -> GoogleMapService:
    return GoogleMapService(settings.google_map_key or "")

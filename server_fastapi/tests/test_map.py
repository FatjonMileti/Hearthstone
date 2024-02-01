"""Phase 5 Task 20: maps proxy (mocked service, no network) + normalization."""

from typing import Any

from httpx import AsyncClient

import app.api.v1.map as map_router


class FakeMaps:
    def get_address(self, lat: float, lng: float) -> Any:
        return {
            "latitude": lat,
            "longitude": lng,
            "street_number": "10",
            "route": "10",
            "neighbourhood": "",
            "postal_town": "London",
            "postal_code": "E1 6AN",
            "administrative_area_level_1": "England",
            "country_code": "GBR",
            "text": "10 Downing St, London",
        }

    def get_coordinates(self, address: str) -> Any:
        if address == "nowhere-xyz":
            return []
        return {"geometry": {"location": {"lat": 51.5, "lng": -0.12}}}

    def get_nearest_places_by_type(self, location: dict, place_type: str) -> Any:
        return [{"place": {"name": f"nearest {place_type}"}, "distance": {"value": 200}}]


async def test_map_endpoints(client: AsyncClient, monkeypatch: Any) -> None:
    monkeypatch.setattr(map_router, "get_maps", lambda settings: FakeMaps())

    res = await client.get("/api/map/?latitude=51.5&longitude=-0.12")
    assert res.status_code == 200, res.text
    assert res.json()["country_code"] == "GBR"
    assert res.json()["route"] == "10"  # street_number quirk

    missing = await client.get("/api/map/")
    assert missing.status_code == 400

    for path in ("/api/map/station", "/api/map/school", "/api/map/places"):
        r = await client.get(f"{path}?latitude=51.5&longitude=-0.12")
        assert r.status_code == 200
        assert r.json()[0]["distance"] == {"value": 200}

    geo = await client.get("/api/map/address/London/")
    assert geo.json()["geometry"]["location"]["lat"] == 51.5
    radius = await client.get("/api/map/address/London/radius/10")
    assert radius.status_code == 200  # radius ignored (parity)
    not_found = await client.get("/api/map/address/nowhere-xyz/")
    assert not_found.status_code == 404

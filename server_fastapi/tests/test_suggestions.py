"""Phase 3 Task 16: similarity unit tests + suggestion endpoints."""

from typing import Any

from httpx import AsyncClient

from app.services.suggestions import calculate_similarity
from tests.helpers import FULL_ASSET, auth, make_user

CRITERIA = {
    "area_of_interest": "London",
    "radius": "10",
    "asset_address": {"latitude": 51.5, "longitude": -0.12},
    "property_type": ["Flats"],
    "budget_for": "Month",
    "budget": {"min": 400, "max": 2000},
    "floor_size": "50-100",
    "room_details": {"number_of_bathrooms": "1-2", "number_of_bedrooms": "1-3"},
    "specific_property_features": ["Furnished"],
    "flat_details": {
        "number_of_bedrooms": {"min": 1, "max": 3},
        "number_of_bathrooms": {"min": 1, "max": 2},
    },
}


def _prop(**over: Any) -> dict:
    base = {
        "area_of_interest": "London",
        "asset_address": {"latitude": 51.51, "longitude": -0.13},
        "property_type": "Flats",
        "budget": {"min_budget": 500, "max_budget": 1500},
        "floor_size": 80,
        "floor_size_unit": "sq.m",
        "room_details": {"number_of_bathrooms": 1, "number_of_bedrooms": 2},
        "specific_property_features": [],
        "property_images": [],
    }
    base.update(over)
    return base


def test_similarity_weights_and_thresholds() -> None:
    full = calculate_similarity(CRITERIA, _prop())
    assert full >= 20  # area(5) + radius(5) + type + budget + rooms...

    other_area = calculate_similarity({**CRITERIA, "area_of_interest": "Paris"}, _prop())
    assert other_area < full  # -5 area points

    far = calculate_similarity(
        CRITERIA,
        _prop(asset_address={"latitude": 48.85, "longitude": 2.35}),  # Paris
    )
    assert far < full  # radius fails

    assert calculate_similarity({}, _prop()) == 0.0
    assert calculate_similarity(CRITERIA, {}) == 0.0


async def test_suggestion_endpoints(client: AsyncClient, db: Any) -> None:
    landlord = await make_user(db, email="l@example.com", role="Landlord")
    tenant = await make_user(db, email="t@example.com", role="Tenant")

    # No criteria yet -> 404 criteria_not_found.
    missing = await client.get("/api/suggestion/asset", headers=auth(tenant))
    assert missing.status_code == 404

    prop = await client.post(
        "/api/asset/",
        json={
            **FULL_ASSET,
            "area_of_interest": "London",
            "asset_address": {"latitude": 51.5, "longitude": -0.12},
        },
        headers=auth(landlord),
    )
    assert prop.status_code == 201
    prop_id = prop.json()["_id"]

    await client.post("/api/criteria/", json=CRITERIA, headers=auth(tenant))

    mine = await client.get("/api/suggestion/asset", headers=auth(tenant))
    assert mine.status_code == 200, mine.text
    assert mine.json()["totalDocs"] >= 1
    first = mine.json()["docs"][0]
    assert first["sugestion_id"] == 0  # typo kept for client parity
    assert isinstance(first["property"]["percentage"], str)

    # Exclusion: like the property, then chosen=true must hide it.
    await client.post("/api/match/properties", json={"property": prop_id}, headers=auth(tenant))
    hidden = await client.get("/api/suggestion/asset?chosen=true", headers=auth(tenant))
    assert hidden.json()["totalDocs"] == 0

    theirs = await client.get("/api/suggestion/tenant", headers=auth(landlord))
    assert theirs.status_code == 200
    assert theirs.json()["totalDocs"] >= 1

    anon = await client.post("/api/suggestion/without-account/properties", json=CRITERIA)
    assert anon.status_code == 200
    assert anon.json()["totalDocs"] >= 1

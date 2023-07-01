"""Phase 3 Task 15: match likes, mutual matched, count, unmatched, update-delete."""

from typing import Any

from httpx import AsyncClient

from app import models
from tests.helpers import FULL_ASSET, auth, make_user


async def _property(client: AsyncClient, db: Any, landlord: dict) -> str:
    res = await client.post("/api/asset/", json=FULL_ASSET, headers=auth(landlord))
    assert res.status_code == 201, res.text
    return res.json()["_id"]


async def test_like_flows_and_mutual_match(client: AsyncClient, db: Any) -> None:
    landlord = await make_user(db, email="l@example.com", role="Landlord")
    tenant = await make_user(db, email="t@example.com", role="Tenant")
    prop_id = await _property(client, db, landlord)
    prop = await db[models.PROPERTY].find_one({"_id": __import__("bson").ObjectId(prop_id)})

    like = await client.post(
        "/api/match/properties", json={"property": prop_id}, headers=auth(tenant)
    )
    assert like.status_code == 201, like.text
    assert like.json()["type"] == "Property"
    assert like.json()["tenant"] == str(tenant["_id"])
    assert like.json()["landlord"] == str(prop["created_by"])
    detail = await db[models.PROPERTY_DETAIL].find_one({"property": prop["_id"]})
    assert detail["matches"] == 1

    dislike = await client.post(
        "/api/match/dislikes/properties", json={"property": prop_id}, headers=auth(tenant)
    )
    assert dislike.status_code == 201
    assert dislike.json()["disliked"] is True

    # Landlord likes the tenant back on the same property -> mutual.
    back = await client.post(
        "/api/match/tenants",
        json={"tenant": str(tenant["_id"]), "property": prop_id},
        headers=auth(landlord),
    )
    assert back.status_code == 201
    assert back.json()["type"] == "User"

    listed = await client.get("/api/match/", headers=auth(tenant))
    assert listed.status_code == 200
    assert listed.json()["totalDocs"] == 2
    first = listed.json()["docs"][0]
    assert first["matched"] is True
    assert "percentage" in first and "criteria" in first and "matchId" in first

    count = await client.get("/api/match/count", headers=auth(tenant))
    assert count.json() == {"number": 2}
    chosen = await client.get("/api/match/?chosen=true", headers=auth(tenant))
    assert chosen.json()["totalDocs"] == 1

    match_id = listed.json()["docs"][0]["_id"]
    single = await client.get(f"/api/match/{match_id}", headers=auth(tenant))
    assert single.status_code == 200

    unmatched = await client.patch(f"/api/match/{match_id}/unmatched", headers=auth(tenant))
    assert unmatched.status_code == 201
    assert unmatched.json()["unmatched"] is True

    other_id = listed.json()["docs"][1]["_id"]
    updated = await client.put(
        f"/api/match/{other_id}", json={"chosen": False}, headers=auth(tenant)
    )
    assert updated.status_code == 204  # chosen:false deletes -> 204

    deleted = await client.request("DELETE", f"/api/match/{match_id}", headers=auth(tenant))
    assert deleted.status_code == 200


async def test_match_property_feed_and_count_filters(client: AsyncClient, db: Any) -> None:
    landlord = await make_user(db, email="l@example.com", role="Landlord")
    tenant = await make_user(db, email="t@example.com", role="Tenant")
    prop_id = await _property(client, db, landlord)
    await client.post("/api/match/properties", json={"property": prop_id}, headers=auth(tenant))

    feed = await client.get("/api/match/property", headers=auth(landlord))
    assert feed.status_code == 200
    assert feed.json()["totalDocs"] == 1

    disliked = await client.get("/api/match/count?disliked=true", headers=auth(tenant))
    assert disliked.json() == {"number": 0}

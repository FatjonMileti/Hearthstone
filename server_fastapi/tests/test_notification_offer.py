"""Phase 4 Task 18: notifications + offers."""

from typing import Any

from bson import ObjectId
from httpx import AsyncClient

from tests.helpers import FULL_ASSET, auth, make_user


async def test_notifications_flow(client: AsyncClient, db: Any) -> None:
    landlord = await make_user(db, email="l@example.com", role="Landlord")
    tenant = await make_user(db, email="t@example.com", role="Tenant")
    prop = await client.post("/api/asset/", json=FULL_ASSET, headers=auth(landlord))
    room = await client.post(
        "/api/chat/create",
        headers=auth(tenant),
        json={
            "author": str(tenant["_id"]),
            "participant": str(landlord["_id"]),
            "property": prop.json()["_id"],
        },
    )
    from app.services import chat_service

    events: list = []

    async def emit(event: str, payload: Any, room: Any = None) -> None:
        events.append(event)

    await chat_service.handle_new_message(
        db,
        emit,
        {"room_id": room.json()["_id"], "sender": str(tenant["_id"]), "message": "hi"},
    )

    listed = await client.get("/api/notification/", headers=auth(landlord))
    assert listed.status_code == 200
    assert listed.json()["totalDocs"] == 1
    item = listed.json()["docs"][0]
    assert item["type"] == "Chat" and item["viewed"] is False

    unread = await client.get("/api/notification/unread", headers=auth(landlord))
    assert unread.json() == {"unread": 1}

    # PARITY QUIRK: read is GET with {viewed} body.
    marked = await client.request(
        "GET",
        f"/api/notification/{item['_id']}",
        json={"viewed": True},
        headers=auth(landlord),
    )
    assert marked.status_code == 200
    assert (await client.get("/api/notification/", headers=auth(landlord))).json()["totalDocs"] == 0

    missing = await client.request(
        "GET",
        f"/api/notification/{ObjectId()}",
        json={"viewed": True},
        headers=auth(landlord),
    )
    assert missing.status_code == 404


async def test_offer_lifecycle(client: AsyncClient, db: Any) -> None:
    landlord = await make_user(db, email="l@example.com", role="Landlord")
    tenant = await make_user(db, email="t@example.com", role="Tenant")
    prop = await client.post("/api/asset/", json=FULL_ASSET, headers=auth(landlord))
    like = await client.post(
        "/api/match/properties", json={"property": prop.json()["_id"]}, headers=auth(tenant)
    )
    match_id = like.json()["_id"]

    # Unknown match -> 400 (Node parity).
    bad = await client.post("/api/offer/", json={"match": str(ObjectId())}, headers=auth(tenant))
    assert bad.status_code == 400

    created = await client.post(
        "/api/offer/",
        json={
            "match": match_id,
            "offering_price": 1200,
            "warranty": "1 month",
            "min_duration": "12 months",
        },
        headers=auth(tenant),
    )
    assert created.status_code == 201, created.text
    offer_id = created.json()["_id"]
    assert created.json()["created_for"] == str(landlord["_id"])

    fetched = await client.get(f"/api/offer/matches/{match_id}/offer", headers=auth(tenant))
    assert fetched.status_code == 200
    assert fetched.json()["_id"] == offer_id

    accepted = await client.patch(f"/api/offer/{offer_id}/accepted", headers=auth(landlord))
    assert accepted.status_code == 201
    assert accepted.json()["accepted"]["status"] is True

    # Second offer to exercise cancel (201) + refuse (201).
    second = await client.post(
        "/api/offer/",
        json={
            "match": match_id,
            "offering_price": 1300,
            "warranty": "1 month",
            "min_duration": "12 months",
        },
        headers=auth(tenant),
    )
    canceled = await client.patch(
        f"/api/offer/{second.json()['_id']}/canceled", headers=auth(tenant)
    )
    assert canceled.status_code == 201
    assert canceled.json()["canceled"] is True

    third = await client.post(
        "/api/offer/",
        json={
            "match": match_id,
            "offering_price": 1400,
            "warranty": "1 month",
            "min_duration": "12 months",
        },
        headers=auth(tenant),
    )
    refused = await client.request(
        "DELETE", f"/api/offer/{third.json()['_id']}", headers=auth(landlord)
    )
    assert refused.status_code == 201
    assert refused.json()["refused"] is True

"""Phase 4 Task 17: chat REST + realtime message/view logic."""

from typing import Any

from bson import ObjectId
from httpx import AsyncClient

from app import models
from app.services import chat_service
from tests.helpers import FULL_ASSET, auth, make_user


async def _landlord_tenant(db: Any) -> tuple[dict, dict]:
    landlord = await make_user(db, email="l@example.com", role="Landlord")
    tenant = await make_user(db, email="t@example.com", role="Tenant")
    return landlord, tenant


async def _property_id(client: AsyncClient, landlord: dict) -> str:
    res = await client.post("/api/asset/", json=FULL_ASSET, headers=auth(landlord))
    assert res.status_code == 201, res.text
    return res.json()["_id"]


async def test_chat_rest_flow(client: AsyncClient, db: Any) -> None:
    landlord, tenant = await _landlord_tenant(db)
    prop_id = await _property_id(client, landlord)

    created = await client.post(
        "/api/chat/create",
        headers=auth(tenant),
        json={
            "author": str(tenant["_id"]),
            "participant": str(landlord["_id"]),
            "property": prop_id,
        },
    )
    assert created.status_code == 200, created.text
    room_id = created.json()["_id"]

    rooms = await client.get("/api/chat/", headers=auth(tenant))
    assert rooms.json()["totalDocs"] == 1
    filtered = await client.get(f"/api/chat/?property={prop_id}", headers=auth(tenant))
    assert filtered.json()["totalDocs"] == 1
    bad_prop = await client.get("/api/chat/?property=nope", headers=auth(tenant))
    assert bad_prop.status_code == 400

    convos = await client.get("/api/chat/started-conversations", headers=auth(tenant))
    assert convos.status_code == 200
    assert convos.json()[0]["title"] == "Sunny flat"

    check = await client.get(
        f"/api/chat/room?participant={landlord['_id']}&property={prop_id}",
        headers=auth(tenant),
    )
    assert check.status_code == 200
    missing = await client.get(
        f"/api/chat/room?participant={ObjectId()}&property={prop_id}",
        headers=auth(tenant),
    )
    assert missing.status_code == 404

    msgs = await client.get(f"/api/chat/{room_id}?pageSize=15&page=1", headers=auth(tenant))
    assert msgs.status_code == 200
    assert msgs.json()["totalDocs"] == 1  # seed message quirk

    read = await client.put("/api/chat/read", json={"room_id": room_id}, headers=auth(tenant))
    assert read.status_code == 200

    # Non-landlord gets 404 on contract status.
    status_denied = await client.get(
        f"/api/chat/{room_id}/contract-documents-status", headers=auth(tenant)
    )
    assert status_denied.status_code == 404
    status_ok = await client.get(
        f"/api/chat/{room_id}/contract-documents-status", headers=auth(landlord)
    )
    assert status_ok.status_code == 200
    assert status_ok.json() == {"areDocumentsApproved": False, "isContractCreated": False}

    deleted = await client.request("DELETE", f"/api/chat/{room_id}", headers=auth(tenant))
    assert deleted.status_code == 204


async def test_match_room_creates_from_match(client: AsyncClient, db: Any) -> None:
    landlord, tenant = await _landlord_tenant(db)
    prop_id = await _property_id(client, landlord)
    like = await client.post(
        "/api/match/properties", json={"property": prop_id}, headers=auth(tenant)
    )
    match_id = like.json()["_id"]

    room = await client.get(f"/api/chat/matches/{match_id}", headers=auth(tenant))
    assert room.status_code == 200, room.text
    again = await client.get(f"/api/chat/matches/{match_id}", headers=auth(tenant))
    assert again.json()["_id"] == room.json()["_id"]  # idempotent

    unknown = await client.get(f"/api/chat/matches/{ObjectId()}", headers=auth(tenant))
    assert unknown.status_code == 404


class FakeSocket:
    def __init__(self) -> None:
        self.emitted: list[tuple] = []

    async def emit(self, event: str, payload: Any, room: Any = None) -> None:
        self.emitted.append((event, payload, room))


async def test_realtime_send_and_view(client: AsyncClient, db: Any) -> None:
    landlord, tenant = await _landlord_tenant(db)
    prop_id = await _property_id(client, landlord)
    created = await client.post(
        "/api/chat/create",
        headers=auth(tenant),
        json={
            "author": str(tenant["_id"]),
            "participant": str(landlord["_id"]),
            "property": prop_id,
        },
    )
    room_id = created.json()["_id"]
    sock = FakeSocket()

    message, notified = await chat_service.handle_new_message(
        db,
        sock.emit,
        {"room_id": room_id, "sender": str(tenant["_id"]), "message": "hello"},
    )
    assert notified == str(landlord["_id"])
    assert message["message"] == "hello"
    assert any(e[0] == "receive_message" for e in sock.emitted)
    assert await db[models.NOTIFICATION].count_documents({"user": landlord["_id"]}) == 1

    # First property view records + increments; second is a no-op.
    assert (
        await chat_service.record_property_view(db, property_id=prop_id, user_id=str(tenant["_id"]))
        is True
    )
    assert (
        await chat_service.record_property_view(db, property_id=prop_id, user_id=str(tenant["_id"]))
        is False
    )
    detail = await db[models.PROPERTY_DETAIL].find_one()
    assert detail["views"] == 1

    viewers = await client.get(f"/api/asset/{prop_id}/viewed-by", headers=auth(landlord))
    assert viewers.json()["totalDocs"] == 1


async def test_realtime_registers_and_cleans_up() -> None:
    from mongomock_motor import AsyncMongoMockClient

    from app.core.config import get_settings
    from app.core.security import generate_token_pair
    from app.realtime import create_sio_server, register_handlers

    settings = get_settings()
    sio = create_sio_server(settings)
    assert sio is not None
    db: Any = AsyncMongoMockClient()["t"]
    users = register_handlers(sio, lambda: db)
    pair = generate_token_pair(
        user_id="u1",
        first_name="A",
        role="Agent",
        jwt_secret=settings.jwt_secret,
        refresh_secret=settings.refresh_secret,
        jwt_expire_seconds=7200,
        refresh_expire_seconds=172800,
        rules=[],
    )
    # Drive the connect/disconnect handlers through the server event table.
    connect = sio.handlers["/"]["connect"]
    await connect("sid-1", {}, {"token": pair["access_token"]})
    assert users == {"u1": ["sid-1"]}
    # Invalid token leaves the socket unregistered (Node parity: just returns).
    await connect("sid-bad", {}, {"token": "garbage"})
    assert "sid-bad" not in str(users)
    disconnect = sio.handlers["/"]["disconnect"]
    await disconnect("sid-1")
    assert users == {}

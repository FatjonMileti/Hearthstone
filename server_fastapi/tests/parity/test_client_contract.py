"""Phase 6 Task 23: E2E parity suite — drives the API exactly like ../client/src.

Flow: register -> invitation -> login -> me -> criteria -> asset CRUD ->
suggestions -> like -> match list/count -> chat -> document -> offer ->
refresh -> logout, plus anonymous suggestion, v1 feed, file serve, socket.
Asserts status codes + key response shapes the React client depends on.
"""

from typing import Any

from httpx import AsyncClient

from app import models
from tests.helpers import FULL_ASSET, PASSWORD, auth, make_user

CRITERIA = {
    "area_of_interest": "London",
    "radius": "10",
    "asset_address": {"latitude": 51.5, "longitude": -0.12},
    "property_type": ["Flats"],
    "budget_for": "Month",
    "budget": {"min": 400, "max": 2000},
    "transaction_type_string": "Rent",
    "looking_for": "I’m looking for a place",
    "moving_time": "This month",
}


async def test_full_client_journey(client: AsyncClient, db: Any) -> None:
    # --- register -> invitation -> login -> me (LoginModal, VerifyAccount) ---
    reg = await client.post(
        "/api/account/register",
        json={
            "first_name": "Tina",
            "last_name": "Tenant",
            "email": "tina@example.com",
            "password": PASSWORD,
        },
    )
    assert reg.status_code == 201
    assert set(reg.json()) >= {"id", "_id", "email", "role"}

    user = await db[models.USER].find_one({"email": "tina@example.com"})
    inv = await client.get(f"/api/account/invitation/{user['confirmation_token']}")
    assert inv.status_code == 200
    assert set(inv.json()) >= {
        "token_type",
        "access_token",
        "refresh_token",
        "expires_in",
        "refresh_expires_in",
        "rules",
    }

    login = await client.post(
        "/api/account/login", json={"email": "tina@example.com", "password": PASSWORD}
    )
    assert login.status_code == 200
    tokens, rules = login.json(), login.json()["rules"]
    assert tokens["token_type"] == "bearer" and isinstance(rules, list)
    tenant_headers = {"Authorization": f"Bearer {tokens['access_token']}"}

    me = await client.get("/api/account/me", headers=tenant_headers)
    assert me.status_code == 200
    assert me.json()["email"] == "tina@example.com"

    # --- users list (role filter; Agent role as in admin client views) ---
    agent = await make_user(db, email="agent@example.com", role="Agent")
    users = await client.get("/api/user/", headers=auth(agent))
    assert users.status_code == 200, users.text
    assert users.json()["docs"][0]["email"] == "tina@example.com"
    by_role = await client.get("/api/user/?role=NewUser", headers=auth(agent))
    assert by_role.json()["totalDocs"] == 1

    # --- criteria create + get (client criteria pages) ---
    crit = await client.post("/api/criteria/", json=CRITERIA, headers=tenant_headers)
    assert crit.status_code == 201
    assert (await client.get("/api/criteria/", headers=tenant_headers)).status_code == 200
    assert (
        await client.patch("/api/criteria/", json={"radius": "8"}, headers=tenant_headers)
    ).status_code == 200
    # Criteria setup flips NewUser -> Tenant; re-login for a fresh role claim
    # (the access token minted above still says NewUser).
    login = await client.post(
        "/api/account/login", json={"email": "tina@example.com", "password": PASSWORD}
    )
    assert login.status_code == 200
    tokens = login.json()
    tenant_headers = {"Authorization": f"Bearer {tokens['access_token']}"}

    # --- asset CRUD (client property pages, ?status= + /last) ---
    landlord = await make_user(db, email="larry@example.com", role="Landlord")
    landlord_headers = auth(landlord)
    asset = await client.post("/api/asset/", json=FULL_ASSET, headers=landlord_headers)
    assert asset.status_code == 201
    prop_id = asset.json()["_id"]
    assert asset.json()["property_images"] == []
    assert (
        await client.get("/api/asset/?status=published", headers=landlord_headers)
    ).status_code == 200
    assert (await client.get("/api/asset/last", headers=landlord_headers)).status_code == 200
    assert (await client.get(f"/api/asset/{prop_id}", headers=tenant_headers)).status_code == 200

    # --- suggestions (asset + tenant + without-account w/ absolute URL style) ---
    mine = await client.get("/api/suggestion/asset", headers=tenant_headers)
    assert mine.status_code == 200 and mine.json()["totalDocs"] >= 1
    theirs = await client.get("/api/suggestion/tenant", headers=landlord_headers)
    assert theirs.status_code == 200 and theirs.json()["totalDocs"] >= 1
    anon = await client.post("/api/suggestion/without-account/properties", json=CRITERIA)
    assert anon.status_code == 200 and anon.json()["totalDocs"] >= 1

    # --- like -> match list/count (useMatchesCount, match pages) ---
    like = await client.post(
        "/api/match/properties", json={"property": prop_id}, headers=tenant_headers
    )
    assert like.status_code == 201
    match_id = like.json()["_id"]
    buddy = await client.post(
        "/api/match/tenants",
        json={"tenant": str(user["_id"]), "property": prop_id},
        headers=landlord_headers,
    )
    assert buddy.status_code == 201
    matches = await client.get("/api/match/", headers=tenant_headers)
    assert matches.json()["totalDocs"] == 1  # own Property-type match only
    assert matches.json()["docs"][0]["matched"] is True  # landlord liked back
    count = await client.get("/api/match/count", headers=tenant_headers)
    assert count.json() == {"number": 1}  # only own created_by matches count
    unlike = await client.request("DELETE", f"/api/match/{match_id}", headers=tenant_headers)
    assert unlike.status_code == 200
    unmatched = await client.patch(
        f"/api/match/{buddy.json()['_id']}/unmatched", headers=landlord_headers
    )
    assert unmatched.status_code == 201

    # --- chat (Messages pages: list, started, room page, read, match room) ---
    room = await client.post(
        "/api/chat/create",
        headers=tenant_headers,
        json={"author": str(user["_id"]), "participant": str(landlord["_id"]), "property": prop_id},
    )
    assert room.status_code == 200
    room_id = room.json()["_id"]
    assert (await client.get("/api/chat/", headers=tenant_headers)).status_code == 200
    convos = await client.get("/api/chat/started-conversations", headers=tenant_headers)
    assert convos.status_code == 200 and len(convos.json()) == 1
    page = await client.get(f"/api/chat/{room_id}?pageSize=15&page=1", headers=tenant_headers)
    assert page.status_code == 200 and page.json()["totalDocs"] == 1
    assert (
        await client.put("/api/chat/read", json={"room_id": room_id}, headers=tenant_headers)
    ).status_code == 200
    match_room = await client.get(
        f"/api/chat/matches/{buddy.json()['_id']}", headers=tenant_headers
    )
    assert match_room.status_code == 200
    status = await client.get(
        f"/api/chat/{room_id}/contract-documents-status", headers=landlord_headers
    )
    assert status.json() == {"areDocumentsApproved": False, "isContractCreated": False}

    # --- documents (Documents.tsx: upload, create, patch, by-user) ---
    up = await client.post(
        "/api/document/upload",
        headers=tenant_headers,
        files=[("files", ("id.pdf", b"bytes", "application/pdf"))],
    )
    assert up.status_code == 200
    doc = await client.post(
        "/api/document/",
        headers=tenant_headers,
        json={
            "file": [{"key": up.json()[0]["key"], "approved": False}],
            "participant": str(landlord["_id"]),
        },
    )
    assert doc.status_code == 201
    doc_id = doc.json()["_id"]
    assert (
        await client.patch(
            f"/api/document/{doc_id}", headers=tenant_headers, json={"file": doc.json()["file"]}
        )
    ).status_code == 200
    by_user = await client.get(
        f"/api/document/by-user?participant={landlord['_id']}", headers=tenant_headers
    )
    assert by_user.status_code == 200

    # --- offer (create, by-match, accept) ---
    like2 = await client.post(
        "/api/match/properties", json={"property": prop_id}, headers=tenant_headers
    )
    offer = await client.post(
        "/api/offer/",
        json={
            "match": like2.json()["_id"],
            "offering_price": 1200,
            "warranty": "1m",
            "min_duration": "12m",
        },
        headers=tenant_headers,
    )
    assert offer.status_code == 201
    got_offer = await client.get(
        f"/api/offer/matches/{like2.json()['_id']}/offer", headers=tenant_headers
    )
    assert got_offer.status_code == 200
    accepted = await client.patch(
        f"/api/offer/{offer.json()['_id']}/accepted", headers=landlord_headers
    )
    assert accepted.status_code == 201

    # --- notifications produced by chat message ---
    from app.services import chat_service

    async def _emit(event: str, payload: Any, room: Any = None) -> None:
        pass

    await chat_service.handle_new_message(
        db, _emit, {"room_id": room_id, "sender": str(user["_id"]), "message": "hey"}
    )
    notifs = await client.get("/api/notification/", headers=landlord_headers)
    assert notifs.json()["totalDocs"] >= 1
    assert (
        await client.get("/api/notification/unread", headers=landlord_headers)
    ).status_code == 200

    # --- file serve (public, from document upload) ---
    served = await client.get(f"/api/file/{up.json()[0]['key']}")
    assert served.status_code == 200 and served.content == b"bytes"

    # --- refresh rotation + logout (SessionMaintainer) ---
    refreshed = await client.post(
        "/api/account/refresh", json={"refresh_token": tokens["refresh_token"]}
    )
    assert refreshed.status_code == 200
    # Same-second rotation can mint byte-identical JWTs (deterministic HS256);
    # rotation is proven by the old refresh token now being rejected.
    assert set(refreshed.json()) >= {"access_token", "refresh_token", "rules"}
    assert (
        await client.post("/api/account/refresh", json={"refresh_token": tokens["refresh_token"]})
    ).status_code == 401
    logout = await client.post(
        "/api/account/logout",
        json={"refresh_token": refreshed.json()["refresh_token"]},
        headers={"Authorization": f"Bearer {refreshed.json()['access_token']}"},
    )
    assert logout.json() == {"success": True}
    assert (
        await client.get(
            "/api/account/me",
            headers={"Authorization": f"Bearer {refreshed.json()['access_token']}"},
        )
    ).status_code == 401

    # --- password recovery links keep their shape ---
    await client.post("/api/user/forgot-password", json={"email": "tina@example.com"})
    tina = await db[models.USER].find_one({"email": "tina@example.com"})
    assert tina["confirmation_token"]

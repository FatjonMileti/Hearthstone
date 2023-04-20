"""Phase 2 Task 11: user router (list/get/patch/delete/register/password flows)."""

from datetime import UTC, datetime
from typing import Any

from httpx import AsyncClient

from app import models
from app.core.security import hash_password

PASSWORD = "Hearthstone1234!"


async def _agent_token(db: Any) -> tuple[str, str]:
    from app.core.config import get_settings
    from app.core.security import generate_token_pair

    doc = {
        "first_name": "Root",
        "last_name": "Agent",
        "email": "agent@example.com",
        "hash": hash_password(PASSWORD),
        "role": "Agent",
        "is_disabled": False,
        "created_at": datetime.now(UTC),
    }
    result = await db[models.USER].insert_one(doc)
    settings = get_settings()
    pair = generate_token_pair(
        user_id=str(result.inserted_id),
        first_name="Root",
        role="Agent",
        jwt_secret=settings.jwt_secret,
        refresh_secret=settings.refresh_secret,
        jwt_expire_seconds=7200,
        refresh_expire_seconds=172800,
        rules=[],
    )
    return pair["access_token"], str(result.inserted_id)


def _auth(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}


async def test_user_list_get_patch_delete_self(client: AsyncClient, db: Any) -> None:
    token, agent_id = await _agent_token(db)
    await db[models.USER].insert_one(
        {
            "first_name": "Tara",
            "last_name": "Tenant",
            "email": "tara@example.com",
            "hash": hash_password(PASSWORD),
            "role": "Tenant",
            "is_disabled": False,
            "created_at": datetime.now(UTC),
        }
    )

    listed = await client.get("/api/user/?role=Tenant", headers=_auth(token))
    assert listed.status_code == 200, listed.text
    assert listed.json()["totalDocs"] == 1
    assert listed.json()["docs"][0]["email"] == "tara@example.com"
    assert "hash" not in listed.json()["docs"][0]

    searched = await client.get("/api/user/?search=tara", headers=_auth(token))
    assert searched.json()["totalDocs"] == 1
    empty = await client.get("/api/user/?search=zzz-no-match", headers=_auth(token))
    assert empty.json()["totalDocs"] == 0

    target_id = listed.json()["docs"][0]["_id"]
    # Agent may read/update any user (manage all).
    got = await client.get(f"/api/user/{target_id}", headers=_auth(token))
    assert got.status_code == 200
    assert got.json()["id"] == target_id

    patched = await client.patch(
        f"/api/user/{target_id}",
        json={"phone": "+100", "address": "Main st 1"},
        headers=_auth(token),
    )
    assert patched.status_code == 200
    assert patched.json()["phone"] == "+100"

    # Invalid ObjectId -> 400 invalid_id.
    bad = await client.get("/api/user/not-an-id", headers=_auth(token))
    assert bad.status_code == 400
    assert bad.json()["message"] == "invalid_id"

    # DELETE /api/user deletes SELF and anonymizes.
    deleted = await client.request("DELETE", "/api/user/", headers=_auth(token))
    assert deleted.status_code == 204
    me = await db[models.USER].find_one({"email": "agent@example.com"})
    assert me is None
    anon = await db[models.USER].find_one({"first_name": "Hearthstone"})
    assert anon is not None and anon["is_disabled"] is True


async def test_tenant_cannot_list_users(client: AsyncClient, db: Any) -> None:
    from app.core.config import get_settings
    from app.core.security import generate_token_pair

    await db[models.USER].insert_one(
        {
            "first_name": "T",
            "last_name": "T",
            "email": "t@example.com",
            "hash": hash_password(PASSWORD),
            "role": "Tenant",
            "is_disabled": False,
            "created_at": datetime.now(UTC),
        }
    )
    settings = get_settings()
    tenant = await db[models.USER].find_one({"email": "t@example.com"})
    pair = generate_token_pair(
        user_id=str(tenant["_id"]),
        first_name="T",
        role="Tenant",
        jwt_secret=settings.jwt_secret,
        refresh_secret=settings.refresh_secret,
        jwt_expire_seconds=7200,
        refresh_expire_seconds=172800,
        rules=[],
    )
    res = await client.get("/api/user/", headers=_auth(pair["access_token"]))
    assert res.status_code == 403


async def test_password_flows(client: AsyncClient, db: Any) -> None:
    await client.post(
        "/api/user/register",
        json={
            "first_name": "Pam",
            "last_name": "W",
            "email": "pam@example.com",
            "password": PASSWORD,
        },
    )
    weak = await client.post(
        "/api/user/register",
        json={"first_name": "W", "last_name": "W", "email": "w@example.com", "password": "weak"},
    )
    assert weak.status_code == 400

    forgot = await client.post("/api/user/forgot-password", json={"email": "pam@example.com"})
    assert forgot.status_code == 201
    missing = await client.post("/api/user/forgot-password", json={"email": "nope@example.com"})
    assert missing.status_code == 404

    user = await db[models.USER].find_one({"email": "pam@example.com"})
    reset = await client.post(
        "/api/user/reset-password",
        json={"token": user["confirmation_token"], "password": "Newpass123!"},
    )
    assert reset.status_code == 200, reset.text
    assert reset.json()["token_type"] == "bearer"

    # New password works after invitation enables the account... enable first.
    await db[models.USER].update_one({"email": "pam@example.com"}, {"$set": {"is_disabled": False}})
    login = await client.post(
        "/api/account/login", json={"email": "pam@example.com", "password": "Newpass123!"}
    )
    assert login.status_code == 200

"""Phase 2 Task 10: account flows (login/refresh/logout/me/tokens/register/invitation/social)."""

from datetime import UTC, datetime
from typing import Any

from bson import ObjectId
from httpx import AsyncClient

from app import models
from app.core.security import hash_password

PASSWORD = "Hearthstone1234!"


async def _make_user(
    db: Any, *, email: str = "ada@example.com", role: str = "Landlord", disabled: bool = False
) -> dict:
    doc = {
        "first_name": "Ada",
        "last_name": "Lovelace",
        "email": email,
        "hash": hash_password(PASSWORD),
        "role": role,
        "is_disabled": disabled,
        "created_at": datetime.now(UTC),
    }
    result = await db[models.USER].insert_one(doc)
    doc["_id"] = result.inserted_id
    return doc


async def test_register_login_me_refresh_logout_cycle(client: AsyncClient, db: Any) -> None:
    reg = await client.post(
        "/api/account/register",
        json={
            "first_name": "Ada",
            "last_name": "L",
            "email": "ada@example.com",
            "password": PASSWORD,
        },
    )
    assert reg.status_code == 201, reg.text
    assert reg.json()["email"] == "ada@example.com"
    assert "hash" not in reg.json()

    # New users are disabled until invitation (Node default) -> login must fail.
    bad_login = await client.post(
        "/api/account/login", json={"email": "ada@example.com", "password": PASSWORD}
    )
    assert bad_login.status_code == 400

    inv = await db[models.USER].find_one({"email": "ada@example.com"})
    token = inv["confirmation_token"]
    got = await client.get(f"/api/account/invitation/{token}")
    assert got.status_code == 200, got.text
    # PARITY QUIRK: invitation rules are always [] (Node passes role string to CASL).
    assert got.json()["rules"] == []

    login = await client.post(
        "/api/account/login", json={"email": "ada@example.com", "password": PASSWORD}
    )
    assert login.status_code == 200, login.text
    body = login.json()
    assert body["token_type"] == "bearer"
    assert body["expires_in"] == "7200"
    assert isinstance(body["rules"], list)
    assert await db[models.LOGIN_LOG].count_documents({"action": "login"}) >= 1

    me = await client.get(
        "/api/account/me", headers={"Authorization": f"Bearer {body['access_token']}"}
    )
    assert me.status_code == 200
    assert me.json()["email"] == "ada@example.com"
    assert "hash" not in me.json()
    assert isinstance(me.json()["rules"], list)

    refresh = await client.post(
        "/api/account/refresh", json={"refresh_token": body["refresh_token"]}
    )
    assert refresh.status_code == 200
    # Single-use refresh: replay must 401.
    replay = await client.post(
        "/api/account/refresh", json={"refresh_token": body["refresh_token"]}
    )
    assert replay.status_code == 401

    logout = await client.post(
        "/api/account/logout",
        json={"refresh_token": refresh.json()["refresh_token"]},
        headers={"Authorization": f"Bearer {refresh.json()['access_token']}"},
    )
    assert logout.status_code == 200
    assert logout.json() == {"success": True}
    # Reused access token must now 401.
    dead = await client.get(
        "/api/account/me", headers={"Authorization": f"Bearer {refresh.json()['access_token']}"}
    )
    assert dead.status_code == 401


async def test_login_wrong_password_and_unknown_user(client: AsyncClient, db: Any) -> None:
    await _make_user(db)
    wrong = await client.post(
        "/api/account/login", json={"email": "ada@example.com", "password": "Wrong1234!"}
    )
    assert wrong.status_code == 400
    assert wrong.json()["message"] == "incorrect_password"
    missing = await client.post(
        "/api/account/login", json={"email": "nobody@example.com", "password": PASSWORD}
    )
    assert missing.status_code == 400
    assert missing.json()["message"] == "user_not_found"


async def test_get_access_tokens_reissues_pair(client: AsyncClient, db: Any) -> None:
    user = await _make_user(db)
    from app.core.config import get_settings
    from app.core.security import generate_token_pair

    settings = get_settings()
    pair = generate_token_pair(
        user_id=str(user["_id"]),
        first_name="Ada",
        role="Landlord",
        jwt_secret=settings.jwt_secret,
        refresh_secret=settings.refresh_secret,
        jwt_expire_seconds=7200,
        refresh_expire_seconds=172800,
        rules=[],
    )
    res = await client.get(
        "/api/account/get-access-tokens",
        headers={"Authorization": f"Bearer {pair['access_token']}"},
    )
    assert res.status_code == 200
    assert res.json()["token_type"] == "bearer"


async def test_login_social_google_creates_tenant(client: AsyncClient, db: Any) -> None:
    res = await client.post(
        "/api/account/login-social",
        json={
            "provider": "google",
            "user": {
                "email": "g@example.com",
                "given_name": "G",
                "family_name": "Oogle",
                "name": "G Oogle",
                "sub": "sub-1",
            },
        },
    )
    assert res.status_code == 200, res.text
    assert res.json()["token_type"] == "bearer"
    created = await db[models.USER].find_one({"email": "g@example.com"})
    assert created["role"] == "Tenant"
    assert created["is_disabled"] is False

    again = await client.post(
        "/api/account/login-social",
        json={"provider": "google", "user": {"email": "g@example.com"}},
    )
    assert again.status_code == 200


async def test_invitation_unknown_token_404(client: AsyncClient) -> None:
    res = await client.get(f"/api/account/invitation/{ObjectId()}")
    assert res.status_code == 404


async def test_twitter_callback_failure_redirects_to_login(client: AsyncClient) -> None:
    res = await client.get(
        "/api/account/login-twitter-callback?code=bad&state=x", follow_redirects=False
    )
    assert res.status_code == 302
    assert res.headers["location"].endswith("/login")

"""Phase 5 Task 22: admin logs, v1 feed, video, web/form, dead routes."""

import os
from typing import Any

from bson import ObjectId
from httpx import AsyncClient

from tests.helpers import FULL_ASSET, auth, make_user


async def _agent_client(client: AsyncClient, db: Any) -> tuple[AsyncClient, dict]:
    agent = await make_user(db, email="agent@example.com", role="Agent")
    return client, auth(agent)


async def test_admin_logs_and_filters(client: AsyncClient, db: Any) -> None:
    client, headers = await _agent_client(client, db)
    landlord = await make_user(db, email="l@example.com", role="Landlord")
    await client.post(
        "/api/account/login", json={"email": "l@example.com", "password": "Hearthstone1234!"}
    )

    sessions = await client.get("/api/admin/session", headers=headers)
    assert sessions.status_code == 200, sessions.text
    assert sessions.json()["totalDocs"] == 1
    action = await client.get("/api/admin/session?action=login", headers=headers)
    assert action.json()["totalDocs"] == 1
    searched = await client.get("/api/admin/session?search=test", headers=headers)
    assert searched.json()["totalDocs"] == 1
    empty = await client.get("/api/admin/session?search=zzz", headers=headers)
    assert empty.json()["totalDocs"] == 0

    log_id = sessions.json()["docs"][0]["_id"]
    single = await client.get(f"/api/admin/session-log/{log_id}", headers=headers)
    assert single.status_code == 200
    assert single.json()["user"]["first_name"] == "Test"
    assert (
        await client.get(f"/api/admin/session-log/{ObjectId()}", headers=headers)
    ).status_code == 404
    assert (await client.get("/api/admin/session-log/nope", headers=headers)).status_code == 400

    prop = await client.post("/api/asset/", json=FULL_ASSET, headers=auth(landlord))
    plogs = await client.get("/api/admin/property", headers=headers)
    assert plogs.json()["totalDocs"] >= 1
    plog_id = plogs.json()["docs"][0]["_id"]
    assert (
        await client.get(f"/api/admin/property-log/{plog_id}", headers=headers)
    ).status_code == 200

    tenant = await make_user(db, email="t@example.com", role="Tenant")
    await client.post(
        "/api/match/properties", json={"property": prop.json()["_id"]}, headers=auth(tenant)
    )
    mlogs = await client.get("/api/admin/match", headers=headers)
    assert mlogs.json()["totalDocs"] >= 1
    mlog_id = mlogs.json()["docs"][0]["_id"]
    got = await client.get(f"/api/admin/match-log/{mlog_id}", headers=headers)
    assert got.status_code == 200
    assert "email" in got.json()["user"]


async def test_v1_feed_token_guard(client: AsyncClient, db: Any) -> None:
    landlord = await make_user(db, email="l@example.com", role="Landlord")
    await client.post("/api/asset/", json=FULL_ASSET, headers=auth(landlord))

    assert (await client.get("/api/v1/property/get")).status_code == 401
    assert (await client.get("/api/v1/property/get", headers={"token": "wrong"})).status_code == 401

    import app.api.v1.external_feed as feed

    _ = feed
    from app.core.config import get_settings

    token = get_settings().Hearthstone_api_access_token
    if token == "change-me":
        os.environ["HEARTHSTONE_API_ACCESS_TOKEN"] = "partner-token"
        get_settings.cache_clear()
        token = "partner-token"
    try:
        props = await client.get("/api/v1/property/get", headers={"token": token})
        assert props.status_code == 200, props.text
        assert props.json()["totalDocs"] == 1
        assert props.json()["docs"][0]["chosen"] is False
        assert 30 <= props.json()["docs"][0]["percentage"] <= 100

        users = await client.get("/api/v1/user/get", headers={"token": token})
        assert users.status_code == 200
        assert any(u["user_type"] == "Client" for u in users.json())
    finally:
        if os.getenv("HEARTHSTONE_API_ACCESS_TOKEN") == "partner-token":
            del os.environ["HEARTHSTONE_API_ACCESS_TOKEN"]
            get_settings.cache_clear()


async def test_video_missing_and_dead_routes(client: AsyncClient, db: Any) -> None:
    agent = await make_user(db, email="agent@example.com", role="Agent")
    video = await client.get("/api/video")
    assert video.status_code == 404

    # Attribute / Condition routers were never mounted in Node -> must 404.
    for dead in ("/api/attribute", "/api/condition", "/api/attribute/", "/api/condition/"):
        assert (await client.get(dead, headers=auth(agent))).status_code == 404


async def test_form_flow(client: AsyncClient) -> None:
    form = await client.get("/form")
    assert form.status_code == 200
    assert "_csrf" in form.text

    posted = await client.post("/form", data={"favoriteColor": "blue"})
    # No token -> 403 (CSRF enforced, unlike the open API).
    assert posted.status_code in (403, 422)

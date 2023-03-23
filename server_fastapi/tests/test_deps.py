"""Phase 1 Task 06 verify: paging, ObjectId guard, auth deps, service token."""

import os
from typing import Any

import pytest
from fastapi import HTTPException
from httpx import AsyncClient
from mongomock_motor import AsyncMongoMockClient

from app import models
from app.api.deps import paging_params, validate_object_id
from app.core.security import generate_token_pair


def test_paging_defaults_to_no_pagination() -> None:
    p = paging_params(page=None, pageSize=None, sort=None, asc=False)
    assert p.pagination_enabled is False
    assert p.skip == 0 and p.limit == 0
    assert p.sort_spec() == [("created_at", -1)]


def test_paging_requires_both_page_and_size() -> None:
    assert paging_params(page=1, pageSize=None, sort=None, asc=False).pagination_enabled is False
    p = paging_params(page=2, pageSize=10, sort="created_at", asc=True)
    assert p.pagination_enabled is True
    assert p.skip == 10 and p.limit == 10
    assert p.sort_spec() == [("created_at", 1)]


def test_validate_object_id() -> None:
    oid = validate_object_id("64b64c8a2f8b9a0012345678")
    assert str(oid) == "64b64c8a2f8b9a0012345678"
    with pytest.raises(HTTPException) as exc:
        validate_object_id("not-an-id")
    assert exc.value.status_code == 400
    assert exc.value.detail == "invalid_id"


async def test_public_ping_ok(client: AsyncClient) -> None:
    res = await client.get("/api/_ping")
    assert res.status_code == 200  # ping itself is public; auth tested below


async def test_verify_service_token() -> None:
    from app.api.deps import verify_service_token
    from app.core.config import get_settings

    get_settings.cache_clear()

    os.environ["HEARTHSTONE_API_ACCESS_TOKEN"] = "tok123"
    get_settings.cache_clear()
    try:
        await verify_service_token("tok123")
        with pytest.raises(HTTPException) as exc:
            await verify_service_token("wrong")
        assert exc.value.status_code == 401
    finally:
        del os.environ["HEARTHSTONE_API_ACCESS_TOKEN"]
        get_settings.cache_clear()


async def test_revoked_token_rejected() -> None:
    from fastapi import Request

    from app.api.deps import get_current_user
    from app.core.config import get_settings

    settings = get_settings()
    pair = generate_token_pair(
        user_id="u1",
        first_name="A",
        role="Agent",
        jwt_secret=settings.jwt_secret,
        refresh_secret=settings.refresh_secret,
        jwt_expire_seconds=7200,
        refresh_expire_seconds=172800,
    )
    scope = {
        "type": "http",
        "headers": [(b"authorization", f"Bearer {pair['access_token']}".encode())],
        "app": None,
    }
    db: Any = AsyncMongoMockClient()["t"]
    await db[models.REVOKED_TOKEN].insert_one({"token": pair["access_token"]})

    class _App:
        state = type("S", (), {"db": db})()

    request = Request({**scope, "app": _App()})
    with pytest.raises(HTTPException) as exc:
        await get_current_user(request)
    assert exc.value.status_code == 401
    assert exc.value.detail == "token was revoked"

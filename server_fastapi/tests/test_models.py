"""Phase 1 Task 03: collection registry + TTL indexes (mongomock-motor)."""

from typing import Any

import pytest
from mongomock_motor import AsyncMongoMockClient

from app import models
from app.models.indexes import ensure_indexes


@pytest.fixture
def db() -> Any:
    return AsyncMongoMockClient()["test-db"]


async def test_all_expected_collections_registered() -> None:
    for name in (
        "user",
        "property",
        "property-detail",
        "property-view",
        "criteria",
        "match",
        "room",
        "message",
        "notification",
        "offer",
        "document",
        "envelope",
        "file",
        "login.log",
        "user.log",
        "match.log",
        "property.log",
        "revoked.token",
        "used.refresh.token",
        "docusign.token",
        "application",
        "invitation",
    ):
        assert name in models.ALL_COLLECTIONS


async def test_ensure_indexes_creates_ttl_and_token_indexes(db) -> None:  # type: ignore[no-untyped-def]
    created = await ensure_indexes(db)
    for log_col in ("login.log", "user.log", "match.log", "property.log"):
        info = await db[log_col].index_information()
        assert any("expiresAt" in str(key) for key in info), log_col
    for col in ("revoked.token", "used.refresh.token"):
        info = await db[col].index_information()
        keys = " ".join(str(v) for v in info.values())
        assert "token" in keys and "expiresAt" in keys, col
    assert created["file"]

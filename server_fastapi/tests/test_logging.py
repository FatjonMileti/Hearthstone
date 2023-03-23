"""Phase 1 Task 09: entity logs + access-log body masking."""

from typing import Any

from mongomock_motor import AsyncMongoMockClient

from app import models
from app.core.logging_setup import _body_for_log
from app.services.log_service import LogAction, LoginAction, write_entity_log, write_login_log


async def test_login_and_entity_logs_write_with_expiry() -> None:
    db: Any = AsyncMongoMockClient()["t"]
    await write_login_log(
        db, user_id="64b64c8a2f8b9a0012345678", action=LoginAction.Login, info="Ada"
    )
    assert await db[models.LOGIN_LOG].count_documents({"action": "login"}) == 1
    await write_entity_log(
        db,
        collection=models.MATCH_LOG,
        user_id="64b64c8a2f8b9a0012345678",
        action=LogAction.Create,
        ref="64b64c8a2f8b9a0012345679",
    )
    doc = await db[models.MATCH_LOG].find_one()
    assert doc is not None and doc["action"] == "create"
    assert doc["expiresAt"] > doc["date"]


def test_access_log_masks_login_and_register_bodies() -> None:
    assert _body_for_log("/api/account/login", b'{"password":"x"}') == ""
    assert _body_for_log("/api/account/register", b'{"password":"x"}') == ""
    assert "hello" in _body_for_log("/api/asset", b'{"hello":"world"}')

"""Entity logs. Port of server_node/src/data/logs.ts usage.

Collections: login.log (Login|Refresh|Logout|login_google), user.log / match.log /
property.log (create|read|update|delete + ref + info). expiresAt defaults to
now + LOG_EXPIRATION_DAYS with a TTL index (expireAfterSeconds=0).
"""

from datetime import UTC, datetime, timedelta
from enum import StrEnum
from typing import Any

from bson import ObjectId

from app import models


class LoginAction(StrEnum):
    Login = "login"
    Refresh = "refresh"
    Logout = "logout"
    Login_Google = "login_google"


class LogAction(StrEnum):
    Create = "create"
    Read = "read"
    Update = "update"
    Delete = "delete"


def _expiry(log_expiration_days: int) -> datetime:
    return datetime.now(UTC) + timedelta(days=log_expiration_days)


def _oid(value: str | ObjectId | None) -> ObjectId | None:
    if value is None:
        return None
    return value if isinstance(value, ObjectId) else ObjectId(value)


async def write_login_log(
    db: Any,
    *,
    user_id: str | ObjectId,
    action: LoginAction,
    info: Any = None,
    log_expiration_days: int = 90,
) -> Any:
    return await db[models.LOGIN_LOG].insert_one(
        {
            "user": _oid(user_id),
            "action": action.value,
            "info": info,
            "date": datetime.now(UTC),
            "expiresAt": _expiry(log_expiration_days),
        }
    )


async def write_entity_log(
    db: Any,
    *,
    collection: str,
    user_id: str | ObjectId,
    action: LogAction,
    ref: str | ObjectId | None = None,
    info: Any = None,
    log_expiration_days: int = 90,
) -> Any:
    return await db[collection].insert_one(
        {
            "user": _oid(user_id),
            "action": action.value,
            "ref": _oid(ref),
            "info": info,
            "date": datetime.now(UTC),
            "expiresAt": _expiry(log_expiration_days),
        }
    )

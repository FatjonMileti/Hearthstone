"""Index bootstrap. Ports TTL/index behavior from server_node schemas:

- login.log / user.log / match.log / property.log: TTL on expiresAt
  (expiresAt defaults to now + LOG_EXPIRATION_DAYS, see log_service).
- revoked.token / used.refresh.token: TTL on expiresAt + index on token.
- docusign.token: index on token.
- file: index on key/filename.
- user: unique-ish index on email (Node: indexed, not unique — keep non-unique
  to preserve parity; service layer enforces flow).
"""

from typing import Any

from app import models


async def ensure_indexes(db: Any, log_expiration_days: int = 90) -> dict[str, list[str]]:
    """Create indexes; returns {collection: [index names]} for tests.

    `log_expiration_days` is accepted for signature parity with the TTL policy;
    the TTL itself is enforced via the `expiresAt` field + expireAfterSeconds=0
    exactly like the Mongoose schemas (no server-side day computation here).
    """
    _ = log_expiration_days
    created: dict[str, list[str]] = {}

    async def _ensure(collection: str, *indexes: Any) -> None:
        names = []
        for index in indexes:
            if isinstance(index, tuple):
                keys, kwargs = index
                names.append(await db[collection].create_index(keys, **kwargs))
            else:
                names.append(await db[collection].create_index(index))
        created[collection] = names

    ttl_expires = ([("expiresAt", 1)], {"expireAfterSeconds": 0})

    for log_col in (models.LOGIN_LOG, models.USER_LOG, models.MATCH_LOG, models.PROPERTY_LOG):
        await _ensure(
            log_col,
            ttl_expires,
            ([("user", 1)], {}),
        )
    await _ensure(models.REVOKED_TOKEN, ttl_expires, ([("token", 1)], {}))
    await _ensure(models.USED_REFRESH_TOKEN, ttl_expires, ([("token", 1)], {}))
    await _ensure(models.DOCUSIGN_TOKEN, ([("token", 1)], {}))
    await _ensure(models.FILE, ([("key", 1)], {}), ([("filename", 1)], {}))
    await _ensure(models.USER, ([("email", 1)], {}))
    await _ensure(models.ENVELOPE, ([("envelope_id", 1)], {}))
    await _ensure(models.MATCH, ([("created_by", 1)], {}))
    await _ensure(models.ROOM, ([("author", 1)], {}), ([("participant", 1)], {}))
    await _ensure(models.MESSAGE, ([("room_id", 1)], {}))
    await _ensure(models.NOTIFICATION, ([("user", 1)], {}))
    return created

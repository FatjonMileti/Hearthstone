"""Auth primitives.
+ Account/services/account.service.ts generateTokens/verify logic.

- bcrypt cost 12, is_password_strong messages identical to Node.
- JWT: HS256, iss=lost.fish, aud=lost.fish:api (access) / lost.fish:token (refresh).
- Token pair response shape identical to Node generateTokens envelope.
"""

import asyncio
import re
from datetime import UTC, datetime, timedelta

import bcrypt
from jose import JWTError, jwt

ISSUER = "lost.fish"
ACCESS_AUDIENCE = "lost.fish:api"
REFRESH_AUDIENCE = "lost.fish:token"
ALGORITHM = "HS256"
BCRYPT_ROUNDS = 12

_SYMBOL_RE = re.compile(r"[!@#$%^&*()\-=_+[\]{}|\\;:'\",.<>?/]")


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt(rounds=BCRYPT_ROUNDS)).decode()


async def ahash_password(password: str) -> str:
    loop = asyncio.get_running_loop()
    return await loop.run_in_executor(None, hash_password, password)


def verify_password(password: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(password.encode(), hashed.encode())
    except (ValueError, TypeError):
        return False


async def averify_password(password: str, hashed: str) -> bool:
    loop = asyncio.get_running_loop()
    return await loop.run_in_executor(None, verify_password, password, hashed)


def is_password_strong(password: str) -> tuple[bool, str]:
    """Returns (is_strong, message) with Node-identical message codes."""
    if not re.search(r"[A-Z]", password):
        return False, "should_have_uppercase"
    if not re.search(r"\d", password):
        return False, "should_have_number"
    if not _SYMBOL_RE.search(password):
        return False, "should_have_symbol"
    if len(password) < 8:
        return False, "password_length_less_than_eight"
    return True, ""


def create_access_token(
    *,
    user_id: str,
    first_name: str,
    role: str,
    secret: str,
    expires_in_seconds: int,
) -> str:
    now = datetime.now(UTC)
    payload = {
        "iss": ISSUER,
        "aud": ACCESS_AUDIENCE,
        "fname": first_name,
        "user_id": user_id,
        "username": first_name,
        "role": role,
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(seconds=expires_in_seconds)).timestamp()),
    }
    return jwt.encode(payload, secret, algorithm=ALGORITHM)


def create_refresh_token(*, user_id: str, secret: str, expires_in_seconds: int) -> str:
    now = datetime.now(UTC)
    payload = {
        "iss": ISSUER,
        "aud": REFRESH_AUDIENCE,
        "user_id": user_id,
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(seconds=expires_in_seconds)).timestamp()),
    }
    return jwt.encode(payload, secret, algorithm=ALGORITHM)


def generate_token_pair(
    *,
    user_id: str,
    first_name: str,
    role: str,
    jwt_secret: str,
    refresh_secret: str,
    jwt_expire_seconds: int,
    refresh_expire_seconds: int,
    rules: list | None = None,
) -> dict:
    """Node-identical envelope: {token_type, access_token, expires_in,
    refresh_token, refresh_expires_in, rules}."""
    return {
        "token_type": "bearer",
        "access_token": create_access_token(
            user_id=user_id,
            first_name=first_name,
            role=role,
            secret=jwt_secret,
            expires_in_seconds=jwt_expire_seconds,
        ),
        "expires_in": str(jwt_expire_seconds),
        "refresh_token": create_refresh_token(
            user_id=user_id, secret=refresh_secret, expires_in_seconds=refresh_expire_seconds
        ),
        "refresh_expires_in": str(refresh_expire_seconds),
        "rules": rules if rules is not None else [],
    }


def decode_access_token(token: str, secret: str) -> dict | None:
    try:
        return jwt.decode(
            token, secret, algorithms=[ALGORITHM], issuer=ISSUER, audience=ACCESS_AUDIENCE
        )
    except JWTError:
        return None


def decode_refresh_token(token: str, secret: str) -> dict | None:
    try:
        return jwt.decode(
            token, secret, algorithms=[ALGORITHM], issuer=ISSUER, audience=REFRESH_AUDIENCE
        )
    except JWTError:
        return None


def refresh_expires_at(payload: dict) -> datetime:
    return datetime.fromtimestamp(payload["exp"], tz=UTC)

"""Account domain service. Port of Account/services/account.service.ts
+ social-login.service.ts (login/refresh/logout/me/tokens/invitation/social/twitter).
"""

import base64
from datetime import UTC, datetime
from typing import Any

import httpx
from bson import ObjectId
from fastapi import HTTPException

from app import models
from app.core.permissions import rules_for
from app.core.security import (
    averify_password,
    decode_refresh_token,
    generate_token_pair,
    refresh_expires_at,
)
from app.services.log_service import LoginAction, write_login_log
from app.services.user_service import calculate_trust_score

TWITTER_TOKEN_URL = "https://api.twitter.com/2/oauth2/token"
TWITTER_ME_URL = "https://api.twitter.com/2/users/me"
TWITTER_CODE_VERIFIER = "8KxxO-RPl0bLSxX5AWwgdiFbMnry_VOKzFeIlVA7NoA"


def _pair(settings: Any, user: dict, with_rules: bool = True) -> dict:
    return generate_token_pair(
        user_id=str(user["_id"]),
        first_name=user.get("first_name", ""),
        role=user.get("role", ""),
        jwt_secret=settings.jwt_secret,
        refresh_secret=settings.refresh_secret,
        jwt_expire_seconds=settings.jwt_expire_seconds,
        refresh_expire_seconds=settings.refresh_expire_seconds,
        rules=rules_for(str(user["_id"]), user.get("role", "")) if with_rules else [],
    )


async def login(db: Any, *, email: str, password: str, settings: Any) -> dict:
    user = await db[models.USER].find_one({"email": email, "is_disabled": False})
    if not user:
        raise HTTPException(status_code=400, detail="user_not_found")
    ok = await averify_password(password, user.get("hash") or "")
    if not ok:
        raise HTTPException(status_code=400, detail="incorrect_password")
    await db[models.USER].update_one(
        {"_id": user["_id"]}, {"$set": {"last_login": datetime.now(UTC)}}
    )
    score = await calculate_trust_score(db, user)
    await db[models.USER].update_one({"_id": user["_id"]}, {"$set": {"trust_score": score}})
    await write_login_log(
        db,
        user_id=user["_id"],
        action=LoginAction.Login,
        info=user.get("first_name"),
        log_expiration_days=settings.log_expiration_days,
    )
    return _pair(settings, user)


async def refresh(db: Any, *, refresh_token: str, settings: Any) -> dict:
    payload = decode_refresh_token(refresh_token, settings.refresh_secret)
    if not payload:
        raise HTTPException(status_code=401, detail="invalid token")
    used = await db[models.USED_REFRESH_TOKEN].find_one({"token": refresh_token})
    if used:
        raise HTTPException(status_code=401, detail="refresh_token is already used")
    try:
        user_id = ObjectId(payload["user_id"])
    except Exception:
        raise HTTPException(status_code=401, detail="unauthorized") from None
    user = await db[models.USER].find_one({"_id": user_id, "is_disabled": False})
    if not user:
        raise HTTPException(status_code=401, detail="unauthorized")
    await db[models.USED_REFRESH_TOKEN].insert_one(
        {"token": refresh_token, "expiresAt": refresh_expires_at(payload)}
    )
    await write_login_log(
        db,
        user_id=user["_id"],
        action=LoginAction.Refresh,
        info=user.get("first_name"),
        log_expiration_days=settings.log_expiration_days,
    )
    return _pair(settings, user)


async def logout(
    db: Any, *, access_token: str, access_claims: dict, refresh_token: str | None, settings: Any
) -> dict:
    exp = access_claims.get("exp")
    expires_at = datetime.fromtimestamp(exp, tz=UTC) if exp else datetime.now(UTC)
    await db[models.REVOKED_TOKEN].insert_one({"token": access_token, "expiresAt": expires_at})
    # PARITY QUIRK (account.service logout): refresh token stored with expiresAt=now,
    # so the TTL index removes it almost immediately — replicated.
    await db[models.USED_REFRESH_TOKEN].insert_one(
        {"token": refresh_token, "expiresAt": datetime.now(UTC)}
    )
    await write_login_log(
        db,
        user_id=ObjectId(access_claims["user_id"]),
        action=LoginAction.Logout,
        info=access_claims.get("username"),
        log_expiration_days=settings.log_expiration_days,
    )
    return {"success": True}


async def get_my_profile(db: Any, user_id: str) -> dict:
    from app.services.user_service import serialize_user

    try:
        oid = ObjectId(user_id)
    except Exception:
        raise HTTPException(status_code=404, detail="not_found") from None
    user = await db[models.USER].find_one({"_id": oid})
    if not user:
        raise HTTPException(status_code=404, detail="not_found")
    data = serialize_user(user)
    data["rules"] = rules_for(str(user["_id"]), user.get("role", ""))
    return data


async def get_access_tokens(db: Any, user_id: str, settings: Any) -> dict:
    try:
        oid = ObjectId(user_id)
    except Exception:
        raise HTTPException(status_code=400, detail="user_not_found") from None
    user = await db[models.USER].find_one({"_id": oid})
    if not user:
        raise HTTPException(status_code=400, detail="user_not_found")
    await write_login_log(
        db,
        user_id=user["_id"],
        action=LoginAction.Login,
        info=user.get("first_name"),
        log_expiration_days=settings.log_expiration_days,
    )
    return _pair(settings, user)


async def get_invitation(db: Any, *, token: str, settings: Any) -> dict:
    user = await db[models.USER].find_one({"confirmation_token": token})
    if not user:
        raise HTTPException(status_code=404, detail="user_not_found")
    await db[models.USER].update_one({"_id": user["_id"]}, {"$set": {"is_disabled": False}})
    user["is_disabled"] = False
    # PARITY QUIRK (account.service getAccountInvitation): Node calls
    # defineAbilitiesFor(user.role) with the role STRING instead of the user, so no
    # branch matches and rules is always []. Replicated.
    return _pair(settings, user, with_rules=False)


# --- social login ------------------------------------------------------------


async def login_third_parties(db: Any, *, provider: str, profile: dict, settings: Any) -> dict:
    existing = await db[models.USER].find_one({"email": profile.get("email")})
    if not existing:
        if provider == "google":
            new_user = await _create_social_user(
                db,
                email=profile.get("email", ""),
                first_name=profile.get("given_name", ""),
                last_name=profile.get("family_name", ""),
                social={
                    "username": profile.get("name"),
                    "is_google_verified": True,
                    "google_user_id": profile.get("sub"),
                },
                field="google",
            )
            return _pair(settings, new_user)
        if provider == "facebook":
            new_user = await _create_social_user(
                db,
                email=profile.get("email", ""),
                first_name=profile.get("first_name", ""),
                last_name=profile.get("last_name", ""),
                social={
                    "username": profile.get("name"),
                    "is_facebook_verified": True,
                    "facebook_user_id": profile.get("userID"),
                },
                field="facebook",
            )
            return _pair(settings, new_user)
        raise HTTPException(status_code=400, detail="unsupported_provider")
    if existing.get("is_disabled"):
        raise HTTPException(status_code=401, detail="user_is_disabled")
    await write_login_log(
        db,
        user_id=existing["_id"],
        action=LoginAction.Login,
        info=existing.get("first_name"),
        log_expiration_days=settings.log_expiration_days,
    )
    return _pair(settings, existing)


async def _create_social_user(
    db: Any, *, email: str, first_name: str, last_name: str, social: dict, field: str
) -> dict:
    now = datetime.now(UTC)
    doc: dict[str, Any] = {
        "email": email,
        "first_name": first_name,
        "last_name": last_name,
        field: social,
        "is_disabled": False,
        "hash": None,
        "role": "Tenant",
        "created_at": now,
    }
    result = await db[models.USER].insert_one(doc)
    created = await db[models.USER].find_one({"_id": result.inserted_id})
    if created is None:
        raise HTTPException(status_code=500, detail="user_not_created")
    return created


# --- twitter -----------------------------------------------------------------


def twitter_basic_auth(settings: Any) -> str:
    raw = f"{settings.twitter_auth_client_id}:{settings.twitter_client_auth_secret}"
    return base64.b64encode(raw.encode()).decode()


async def exchange_twitter_code(code: str, settings: Any) -> dict | None:
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            res = await client.post(
                TWITTER_TOKEN_URL,
                data={
                    "client_id": settings.twitter_auth_client_id,
                    "code_verifier": TWITTER_CODE_VERIFIER,
                    "redirect_uri": settings.twitter_redirect_url,
                    "grant_type": "authorization_code",
                    "code": code,
                },
                headers={
                    "Content-Type": "application/x-www-form-urlencoded",
                    "Authorization": f"Basic {twitter_basic_auth(settings)}",
                },
            )
            if res.status_code != 200:
                return None
            return res.json()
    except httpx.HTTPError:
        return None


async def fetch_twitter_user(access_token: str) -> dict | None:
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            res = await client.get(
                TWITTER_ME_URL,
                headers={
                    "Content-type": "application/json",
                    "Authorization": f"Bearer {access_token}",
                },
            )
            if res.status_code != 200:
                return None
            return res.json().get("data")
    except httpx.HTTPError:
        return None


async def login_with_twitter(db: Any, *, code: str) -> dict | None:
    """Returns the user doc on success, None when the flow must redirect to /login."""
    from app.core.config import get_settings

    settings = get_settings()
    token_data = await exchange_twitter_code(code, settings)
    if not token_data:
        return None
    twitter_user = await fetch_twitter_user(token_data["access_token"])
    if not twitter_user:
        return None
    existing = await db[models.USER].find_one(
        {"twitter.twitter_user_id": twitter_user["id"], "twitter.is_twitter_verified": True}
    )
    if existing:
        return existing
    now = datetime.now(UTC)
    name = twitter_user.get("name", "")
    parts = name.split(" ")
    doc: dict[str, Any] = {
        "first_name": parts[0] if parts else "",
        "last_name": parts[1] if len(parts) > 1 else "",
        "twitter": {
            "username": twitter_user.get("username"),
            "is_twitter_verified": True,
            "twitter_user_id": twitter_user.get("id"),
        },
        "is_disabled": False,
        "hash": None,
        "role": "Tenant",
        "created_at": now,
    }
    result = await db[models.USER].insert_one(doc)
    created = await db[models.USER].find_one({"_id": result.inserted_id})
    if created is None:
        raise HTTPException(status_code=500, detail="user_not_created")
    return created

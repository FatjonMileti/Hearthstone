"""Account router. Port of Account/account.controller.ts route table."""

import json
from typing import Annotated, Any
from urllib.parse import quote

from fastapi import APIRouter, Depends, Request
from fastapi.responses import RedirectResponse
from pydantic import BaseModel

from app.api.deps import CurrentUser
from app.core.config import Settings, get_settings
from app.services import account_service
from app.services.user_service import create_user

router = APIRouter(prefix="/account", tags=["account"])


class LoginBody(BaseModel):
    email: str
    password: str


class RefreshBody(BaseModel):
    refresh_token: str


class LogoutBody(BaseModel):
    refresh_token: str | None = None


class SocialLoginBody(BaseModel):
    provider: str
    user: dict


class RegisterBody(BaseModel):
    first_name: str
    last_name: str
    email: str
    password: str


def _db(request: Request) -> Any:
    return request.app.state.db


@router.post("/login", status_code=200)
async def login(
    body: LoginBody, request: Request, settings: Annotated[Settings, Depends(get_settings)]
):  # type: ignore[no-untyped-def]
    return await account_service.login(
        _db(request), email=body.email, password=body.password, settings=settings
    )


@router.post("/refresh", status_code=200)
async def refresh(
    body: RefreshBody, request: Request, settings: Annotated[Settings, Depends(get_settings)]
):  # type: ignore[no-untyped-def]
    return await account_service.refresh(
        _db(request), refresh_token=body.refresh_token, settings=settings
    )


@router.post("/logout", status_code=200)
async def logout(
    body: LogoutBody,
    request: Request,
    user: CurrentUser,
    settings: Annotated[Settings, Depends(get_settings)],
):  # type: ignore[no-untyped-def]
    return await account_service.logout(
        _db(request),
        access_token=user["token"],
        access_claims=user["claims"],
        refresh_token=body.refresh_token,
        settings=settings,
    )


@router.post("/login-social", status_code=200)
async def login_social(
    body: SocialLoginBody, request: Request, settings: Annotated[Settings, Depends(get_settings)]
):  # type: ignore[no-untyped-def]
    return await account_service.login_third_parties(
        _db(request), provider=body.provider, profile=body.user, settings=settings
    )


@router.get("/login-twitter-callback", include_in_schema=False)
async def login_twitter_callback(
    request: Request, code: str | None = None, state: str | None = None
):  # type: ignore[no-untyped-def]
    from app.core.config import get_settings as _get_settings

    settings = _get_settings()
    user = await account_service.login_with_twitter(_db(request), code=code or "") if code else None
    if not user:
        return RedirectResponse(f"{settings.frontend_url}/login", status_code=302)
    pair = account_service._pair(settings, user)
    response = RedirectResponse(f"{settings.frontend_url}/twitter/redirect", status_code=302)
    # PARITY (social-login.service cookieOptions): httpOnly false, sameSite strict,
    # secure only when NODE_ENV == 'stage', domain from DOMAIN env (unset -> host-only).
    import os

    response.set_cookie(
        "oauth2_token",
        quote(json.dumps(pair)),
        httponly=False,
        secure=settings.stage == "stage",
        samesite="strict",
        domain=os.getenv("DOMAIN") or None,
        max_age=7200,
    )
    return response


@router.get("/get-access-tokens", status_code=200)
async def get_access_tokens(
    user: CurrentUser, request: Request, settings: Annotated[Settings, Depends(get_settings)]
):  # type: ignore[no-untyped-def]
    return await account_service.get_access_tokens(_db(request), user["user_id"], settings)


@router.get("/me", status_code=200)
async def me(user: CurrentUser, request: Request):  # type: ignore[no-untyped-def]
    return await account_service.get_my_profile(_db(request), user["user_id"])


@router.post("/register", status_code=201)
async def register(
    body: RegisterBody, request: Request, settings: Annotated[Settings, Depends(get_settings)]
):  # type: ignore[no-untyped-def]
    return await create_user(
        _db(request),
        first_name=body.first_name,
        last_name=body.last_name,
        email=body.email,
        password=body.password,
        settings=settings,
    )


@router.get("/invitation/{token}", status_code=200)
async def invitation(
    token: str, request: Request, settings: Annotated[Settings, Depends(get_settings)]
):  # type: ignore[no-untyped-def]
    return await account_service.get_invitation(_db(request), token=token, settings=settings)

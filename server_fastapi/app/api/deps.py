from collections.abc import Callable
from typing import Annotated, Any

from bson import ObjectId
from fastapi import Depends, Header, HTTPException, Query, Request
from pydantic import BaseModel

from app import models
from app.core.config import get_settings
from app.core.errors import invalid_id_error
from app.core.permissions import Action, Subject, can_on_object
from app.core.security import decode_access_token


class PagingParams(BaseModel):
    """Port of paging.ts: pagination:false unless BOTH page+pageSize given."""

    page: int | None = None
    page_size: int | None = None
    sort: str | None = None
    asc: bool = False

    @property
    def pagination_enabled(self) -> bool:
        return self.page is not None and self.page_size is not None

    @property
    def skip(self) -> int:
        if not self.pagination_enabled or self.page is None or self.page_size is None:
            return 0
        return max(self.page - 1, 0) * self.page_size

    @property
    def limit(self) -> int:
        if not self.pagination_enabled or self.page_size is None:
            return 0
        return self.page_size

    @property
    def sort_direction(self) -> int:
        return 1 if self.asc else -1

    def sort_spec(self) -> list[tuple[str, int]]:
        if self.sort:
            return [(self.sort, self.sort_direction)]
        return [("created_at", -1)]


def paging_params(
    page: Annotated[int | None, Query(ge=1)] = None,
    pageSize: Annotated[int | None, Query(ge=1, alias="pageSize")] = None,
    sort: Annotated[str | None, Query()] = None,
    asc: Annotated[bool, Query()] = False,
) -> PagingParams:
    return PagingParams(page=page, page_size=pageSize, sort=sort, asc=asc)


def validate_object_id(id: str) -> ObjectId:
    """Port of object-id.validator.ts: 400 invalid_id when not a Mongo ObjectId."""
    if not ObjectId.is_valid(id):
        raise invalid_id_error()
    return ObjectId(id)


def _db(request: Request) -> Any:
    db = getattr(request.app.state, "db", None)
    if db is None:
        raise HTTPException(status_code=500, detail="database not configured")
    return db


async def get_current_user(request: Request) -> dict:
    """Port of authorize() middleware.

    Requires `Authorization: Bearer <JWT>` (HS256, iss=lost.fish,
    aud=lost.fish:api), rejects revoked tokens (revoked.token collection),
    returns {"token", "claims", "user_id", "username", "role"} (= res.locals).
    """
    settings = get_settings()
    auth = request.headers.get("authorization")
    if not auth or not auth.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="authorization bearer header is required")
    token = auth[7:]
    claims = decode_access_token(token, settings.jwt_secret)
    if not claims:
        raise HTTPException(status_code=401, detail="invalid token")
    revoked = await _db(request)[models.REVOKED_TOKEN].find_one({"token": token})
    if revoked:
        raise HTTPException(status_code=401, detail="token was revoked")
    return {
        "token": token,
        "claims": claims,
        "user_id": claims["user_id"],
        "username": claims.get("username"),
        "role": claims.get("role"),
    }


async def verify_service_token(
    token: Annotated[str | None, Header()] = None,
) -> None:
    """Port of tokenAuthorize.ts: header `token` == HEARTHSTONE_API_ACCESS_TOKEN."""
    expected = get_settings().Hearthstone_api_access_token
    if not token or token != expected:
        raise HTTPException(status_code=401, detail="invalid service token")


def require_ability(action: Action, subject: Subject) -> Callable:
    """Port of ability(action, subject) middleware: 401 without identity, 403 on fail."""

    async def _dep(user: Annotated[dict, Depends(get_current_user)]) -> dict:
        if not user.get("role") or not user.get("user_id"):
            raise HTTPException(status_code=401, detail="unauthorized")
        if not can_on_object(user["user_id"], user["role"], action, subject, None):
            raise HTTPException(status_code=403, detail="forbidden")
        return user

    return _dep


CurrentUser = Annotated[dict, Depends(get_current_user)]
Paging = Annotated[PagingParams, Depends(paging_params)]

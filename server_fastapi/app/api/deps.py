"""Shared request dependencies.

Ports (stubs until Phase 1 implements fully):
- server_node/src/middleware/paging.ts       -> paging_params()
- server_node/src/middleware/object-id.validator.ts -> validate_object_id()
- server_node/src/middleware/authorize.ts    -> get_current_user() (full impl in Phase 1 Task 04)
"""

from typing import Annotated

from bson import ObjectId
from fastapi import Depends, Query
from pydantic import BaseModel

from app.core.errors import invalid_id_error


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


async def get_current_user() -> dict:  # Phase 1 Task 04 provides the real JWT version
    raise NotImplementedError("get_current_user lands in Phase 1 Task 04")


CurrentUser = Annotated[dict, Depends(get_current_user)]
Paging = Annotated[PagingParams, Depends(paging_params)]

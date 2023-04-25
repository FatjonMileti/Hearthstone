"""Pytest fixtures. Test DB: mongomock-motor (no external mongo needed)."""

import os
from typing import Any

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from mongomock_motor import AsyncMongoMockClient

os.environ.setdefault("NODE_ENV", "test")
os.environ.setdefault("DB_CONNECTION_STRING", "mongodb://localhost:27017/test-db")
os.environ.setdefault("JWT_SECRET", "test-secret")
os.environ.setdefault("REFRESH_SECRET", "test-refresh-secret")
os.environ.setdefault("SESSION_SECRET", "test-session-secret")
os.environ.setdefault("JWT_EXPIRE_SECONDS", "7200")
os.environ.setdefault("REFRESH_EXPIRE_SECONDS", "172800")
os.environ.setdefault("FRONTEND_URL", "http://localhost:4000")
os.environ.setdefault("ABSOLUTE_URL", "http://localhost:3000")

from app.core.config import get_settings  # noqa: E402
from app.main import create_app  # noqa: E402
from app.services.email_service import EmailService  # noqa: E402

get_settings.cache_clear()
EmailService.get_instance().configure(get_settings())


@pytest.fixture
def anyio_backend() -> str:
    return "asyncio"


@pytest.fixture
def db() -> Any:
    return AsyncMongoMockClient()["test-db"]


@pytest_asyncio.fixture
async def client(db: Any):  # type: ignore[no-untyped-def]
    app = create_app()
    app.state.db = db
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac

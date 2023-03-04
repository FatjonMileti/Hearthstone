"""Pytest fixtures. Test DB: mongomock-motor (no external mongo needed for Phase 0)."""

import os

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient

os.environ.setdefault("NODE_ENV", "test")
os.environ.setdefault("DB_CONNECTION_STRING", "mongodb://localhost:27017/test-db")
os.environ.setdefault("JWT_SECRET", "test-secret")
os.environ.setdefault("REFRESH_SECRET", "test-refresh-secret")
os.environ.setdefault("SESSION_SECRET", "test-session-secret")

from app.main import create_app  # noqa: E402


@pytest.fixture
def anyio_backend() -> str:
    return "asyncio"


@pytest_asyncio.fixture
async def client():  # type: ignore[no-untyped-def]
    app = create_app()
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac

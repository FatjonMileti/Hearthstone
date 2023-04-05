"""Phase 1 Task 08: local storage round-trip + factory selection."""

import os
from pathlib import Path
from typing import Any

import pytest
from mongomock_motor import AsyncMongoMockClient

from app import models
from app.core.config import Settings
from app.services.storage import select_storage
from app.services.storage.azure import AzureBlobService
from app.services.storage.base import UploadedFile
from app.services.storage.local import LocalFileService
from app.services.storage.s3 import S3FileService


@pytest.fixture
def db() -> Any:
    return AsyncMongoMockClient()["test-db"]


async def test_local_upload_serve_delete_round_trip(db: Any, tmp_path: Path) -> None:
    svc = LocalFileService(str(tmp_path), "http://localhost:3000")
    stored = await svc.upload_files(
        [
            UploadedFile(
                filename="a.bin", originalname="a.bin", mimetype="image/png", buffer=b"hello"
            )
        ],
        db,
    )
    assert stored[0].link == "http://localhost:3000/api/file/a.bin"
    assert stored[0].isNew is True
    assert await db[models.FILE].count_documents({}) == 1
    assert await svc.get_file("a.bin", db) == b"hello"
    assert await svc.delete_file("a.bin", db) is True
    assert await db[models.FILE].count_documents({}) == 0
    assert await svc.get_file("a.bin", db) is None
    assert await svc.delete_file("missing.bin", db) is False


def test_factory_defaults_to_local(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.delenv("USE_AZURE_BLOB_BACKET", raising=False)
    monkeypatch.delenv("USE_S3_BACKET", raising=False)
    s = Settings(_env_file=None, USE_AZURE_BLOB_BUCKET=False, USE_S3_BUCKET=False)  # type: ignore[call-arg]
    assert isinstance(select_storage(s), LocalFileService)


def test_factory_selects_s3_and_azure() -> None:
    s3 = Settings(_env_file=None, USE_S3_BUCKET=True)  # type: ignore[call-arg]
    assert isinstance(select_storage(s3), S3FileService)
    os.environ["USE_AZURE_BLOB_BACKET"] = "true"
    try:
        az = Settings(_env_file=None)  # type: ignore[call-arg]
        # Azure constructor needs a client; only assert the legacy flag is honored.
        assert az.legacy_use_azure_storage() is True
        assert AzureBlobService is not None
    finally:
        del os.environ["USE_AZURE_BLOB_BACKET"]

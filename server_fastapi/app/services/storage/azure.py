"""Azure Blob storage. Port of File/services/azure-blob.service.ts.

- Key scheme identical: <random-hex>-<originalname> (crypto.randomBytes(32).hex).
- Metadata rows in `file` collection; link ${ABSOLUTE_URL}/api/file/<key>.
- Upload uses buffer (memory-storage multer equivalent in Node).
"""

import asyncio
import secrets
from typing import Any

from app import models
from app.services.storage.base import FileService, StoredFile, UploadedFile


def _random_key(originalname: str) -> str:
    return f"{secrets.token_hex(32)}-{originalname}"


class AzureBlobService(FileService):
    def __init__(self, connection_string: str, container: str, api_url: str) -> None:
        from azure.storage.blob.aio import BlobServiceClient

        self.api_url = api_url.rstrip("/")
        self._service = BlobServiceClient.from_connection_string(connection_string)
        self._container = self._service.get_container_client(container)

    async def upload_files(self, files: list[UploadedFile], db: Any) -> list[StoredFile]:
        stored: list[StoredFile] = []
        rows = []
        for f in files:
            key = _random_key(f.originalname)
            blob = self._container.get_blob_client(key)
            await blob.upload_blob(f.buffer, content_type=f.mimetype, overwrite=True)
            rows.append({"originalName": f.originalname, "mimetype": f.mimetype, "key": key})
            stored.append(
                StoredFile(
                    key=key,
                    mimetype=f.mimetype,
                    originalName=f.originalname,
                    link=f"{self.api_url}/api/file/{key}",
                )
            )
        if rows:
            await db[models.FILE].insert_many(rows)
        return stored

    async def delete_file(self, key: str, db: Any) -> bool:
        if not key:
            return False
        try:
            await self._container.get_blob_client(key).delete_blob()
            await db[models.FILE].delete_one({"filename": key})
            return True
        except Exception:
            return False

    async def get_file(self, key: str, db: Any) -> bytes | None:
        _ = db
        try:
            data = await (await self._container.get_blob_client(key).download_blob()).readall()
            return bytes(data)
        except Exception:
            return None

    async def close(self) -> None:
        await asyncio.get_running_loop().run_in_executor(None, lambda: None)
        await self._service.close()

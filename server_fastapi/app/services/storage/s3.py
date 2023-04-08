"""S3 storage. Port of File/services/s3-file.service.ts.

- Key scheme identical: <random-hex>-<originalname>.
- Metadata rows in `file` collection; link ${ABSOLUTE_URL}/api/file/<key>.
- get_file returns a presigned GET URL's bytes (Node's getFile returns the
  presigned URL; we fetch it so the /api/file/:filename endpoint can stream).
"""

import secrets
from typing import Any

from app import models
from app.services.storage.base import FileService, StoredFile, UploadedFile


def _random_key(originalname: str) -> str:
    return f"{secrets.token_hex(32)}-{originalname}"


class S3FileService(FileService):
    def __init__(self, bucket: str, api_url: str, region: str = "test") -> None:
        import boto3  # deferred so Phase-0 installs stay light

        self.bucket = bucket
        self.api_url = api_url.rstrip("/")
        self._client = boto3.client(
            "s3",
            region_name=region,
            # Credentials come from env/shared config like the AWS SDK in Node.
        )

    async def upload_files(self, files: list[UploadedFile], db: Any) -> list[StoredFile]:
        import asyncio

        loop = asyncio.get_running_loop()
        stored: list[StoredFile] = []
        rows = []
        for f in files:
            key = _random_key(f.originalname)
            buffer = f.buffer

            def _put(key: str = key, body: bytes = buffer) -> None:
                self._client.put_object(Bucket=self.bucket, Key=key, Body=body)

            await loop.run_in_executor(None, _put)
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
        import asyncio

        loop = asyncio.get_running_loop()
        try:
            await loop.run_in_executor(
                None, lambda: self._client.delete_object(Bucket=self.bucket, Key=key)
            )
            await db[models.FILE].delete_one({"filename": key})
            return True
        except Exception:
            return False

    async def get_file(self, key: str, db: Any) -> bytes | None:
        import asyncio

        import httpx

        _ = db
        loop = asyncio.get_running_loop()
        url: str = await loop.run_in_executor(
            None,
            lambda: self._client.generate_presigned_url(
                "get_object", Params={"Bucket": self.bucket, "Key": key}, ExpiresIn=3600
            ),
        )
        async with httpx.AsyncClient() as client:
            res = await client.get(url)
            return res.content if res.status_code == 200 else None

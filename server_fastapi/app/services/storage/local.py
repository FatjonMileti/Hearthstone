"""Local disk storage. Port of File/services/file.service.ts.

- Files land in `uploads/` (multer dest in Node); metadata rows in `file` collection.
- Link shape identical: ${ABSOLUTE_URL}/api/file/<filename>.
- delete removes disk file + metadata row; missing file -> False (Node rejects -> False).
"""

from pathlib import Path
from typing import Any
from uuid import uuid4

from app import models
from app.services.storage.base import FileService, StoredFile, UploadedFile


class LocalFileService(FileService):
    def __init__(self, upload_dir: str = "uploads", api_url: str = "") -> None:
        self.upload_dir = Path(upload_dir)
        self.api_url = api_url.rstrip("/")

    async def upload_files(self, files: list[UploadedFile], db: Any) -> list[StoredFile]:
        self.upload_dir.mkdir(parents=True, exist_ok=True)
        rows = []
        stored: list[StoredFile] = []
        for f in files:
            filename = f.filename or f"{uuid4().hex}-{f.originalname}"
            (self.upload_dir / filename).write_bytes(f.buffer)
            rows.append(
                {
                    "originalName": f.originalname,
                    "mimetype": f.mimetype,
                    "size": str(f.size or len(f.buffer)),
                    "key": filename,
                    "filename": filename,
                    "path": str(self.upload_dir / filename),
                }
            )
            stored.append(
                StoredFile(
                    key=filename,
                    mimetype=f.mimetype,
                    originalName=f.originalname,
                    link=f"{self.api_url}/api/file/{filename}",
                )
            )
        if rows:
            await db[models.FILE].insert_many(rows)
        return stored

    async def delete_file(self, key: str, db: Any) -> bool:
        target = self.upload_dir / key
        try:
            target.unlink()
        except FileNotFoundError:
            return False
        await db[models.FILE].delete_one({"filename": key})
        return True

    async def get_file(self, key: str, db: Any) -> bytes | None:
        _ = db
        target = self.upload_dir / key
        try:
            return target.read_bytes()
        except FileNotFoundError:
            return None

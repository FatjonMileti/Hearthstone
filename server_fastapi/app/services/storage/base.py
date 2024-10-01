from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Any


@dataclass
class UploadedFile:
    filename: str  # multer `filename` (local) — S3/Azure set key differently
    originalname: str
    mimetype: str
    buffer: bytes = b""
    size: int = 0
    key: str = ""
    path: str = ""


@dataclass
class StoredFile:
    key: str
    mimetype: str
    originalName: str
    link: str
    isNew: bool = True


class FileService(ABC):
    @abstractmethod
    async def upload_files(self, files: list[UploadedFile], db: Any) -> list[StoredFile]: ...

    @abstractmethod
    async def delete_file(self, key: str, db: Any) -> bool: ...

    @abstractmethod
    async def get_file(self, key: str, db: Any) -> bytes | None: ...

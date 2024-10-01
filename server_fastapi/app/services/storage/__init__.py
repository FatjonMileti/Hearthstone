"""Azure when USE_AZURE_BLOB_BUCKET (or legacy typo USE_AZURE_BLOB_BACKET) is true,
else S3 when USE_S3_BUCKET (or legacy USE_S3_BACKET) is true, else local.
"""

from app.core.config import Settings
from app.services.storage.base import FileService
from app.services.storage.local import LocalFileService


def select_storage(settings: Settings) -> FileService:
    if settings.legacy_use_azure_storage():
        from app.services.storage.azure import AzureBlobService

        return AzureBlobService(
            settings.azure_storage_connection_string,
            settings.azure_storage_name,
            settings.absolute_url,
        )
    if settings.legacy_use_s3_bucket():
        from app.services.storage.s3 import S3FileService

        return S3FileService(settings.aws_bucket, settings.absolute_url, settings.aws_region)
    return LocalFileService("uploads", settings.absolute_url)

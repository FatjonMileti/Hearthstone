"""Central settings. Port of server_node/src/config/{index,local,stage,prod}.ts."""

from functools import lru_cache
from typing import Literal

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

Stage = Literal["development", "stage", "production", "test"]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    node_env: Stage = Field(default="development", alias="NODE_ENV")
    behind_proxy: bool = Field(default=True, alias="BEHIND_PROXY")
    port: int = Field(default=3000, alias="PORT")

    # Storage selection mirrors server_node/src/api/index.ts:
    # Azure when USE_AZURE_BLOB_BACKET=true, else S3 when USE_S3_BUCKET=true, else local.
    # NOTE: Node env key has typo "BACKET" — we accept both spellings.
    use_azure_blob_bucket: bool = Field(default=False, alias="USE_AZURE_BLOB_BUCKET")
    use_s3_bucket: bool = Field(default=False, alias="USE_S3_BUCKET")

    # DB (Node builds `connectionString` from parts; session store uses DB_CONNECTION_STRING)
    db_database: str = Field(default="", alias="DB_DATABASE")
    db_username: str = Field(default="", alias="DB_USERNAME")
    db_password: str = Field(default="", alias="DB_PASSWORD")
    db_host: str = Field(default="localhost", alias="DB_HOST")
    db_port: int = Field(default=27017, alias="DB_PORT")
    db_protocol: str = Field(default="mongodb", alias="DB_PROTOCOL")
    db_connection_string: str = Field(
        default="mongodb://localhost:27017/backend-app", alias="DB_CONNECTION_STRING"
    )

    redis_url: str = Field(default="redis://localhost:6379", alias="REDIS_URL")

    email_user: str = Field(default="", alias="EMAIL_USER")
    email_pass: str = Field(default="", alias="EMAIL_PASS")
    email_host: str = Field(default="", alias="EMAIL_HOST")
    email_port: int = Field(default=587, alias="EMAIL_PORT")

    offr_io_token: str = Field(default="", alias="OFFR_IO_TOKEN")
    # Static service token guarding GET /api/v1/* (Node: Hearthstone_API_ACCESS_TOKEN).
    Hearthstone_api_access_token: str = Field(
        default="change-me", alias="HEARTHSTONE_API_ACCESS_TOKEN"
    )

    session_secret: str = Field(default="change-me", alias="SESSION_SECRET")
    jwt_secret: str = Field(default="change-me", alias="JWT_SECRET")
    jwt_expire_seconds: int = Field(default=7200, alias="JWT_EXPIRE_SECONDS")
    refresh_secret: str = Field(default="change-me", alias="REFRESH_SECRET")
    refresh_expire_seconds: int = Field(default=172800, alias="REFRESH_EXPIRE_SECONDS")

    rate_limiter_number_for_hour: int = Field(default=10000, alias="RATE_LIMITER_NUMBER_FOR_HOUR")

    absolute_url: str = Field(default="http://localhost:3000", alias="ABSOLUTE_URL")
    frontend_url: str = Field(default="http://localhost:4000", alias="FRONTEND_URL")
    log_expiration_days: int = Field(default=90, alias="LOG_EXPIRATION_DAYS")

    google_map_key: str = Field(default="", alias="GOOGLE_MAP_KEY")

    twitter_app_name: str = Field(default="", alias="TWITTER_APP_NAME")
    twitter_auth_client_id: str = Field(default="", alias="TWITTER_AUTH_CLIENT_ID")
    twitter_client_auth_secret: str = Field(default="", alias="TWITTER_CLIENT_AUTH_SECRET")

    ds_jwt_client_id: str = Field(default="", alias="DS_JWT_CLIENT_ID")
    app_account_id: str = Field(default="", alias="APP_ACCOUNT_ID")
    impersonated_user_guid: str = Field(default="", alias="IMPERSONATED_USER_GUID")
    ds_oauth_server: str = Field(default="", alias="DS_OAUTH_SERVER")
    template_id: str = Field(default="", alias="TEMPLATE_ID")
    base_path: str = Field(default="", alias="BASE_PATH")
    renting_template_id: str = Field(default="", alias="RENTING_TEMPLATE_ID")
    Hearthstone_transaction_agreement_template_id: str = Field(
        default="", alias="HEARTHSTONE_TRANSACTION_AGREEMENT_TEMPLATE_ID"
    )
    Hearthstone_privacy_agreement_template_id: str = Field(
        default="", alias="HEARTHSTONE_PRIVACY_AGREEMENT_TEMPLATE_ID"
    )
    docusign_base_path: str = Field(default="", alias="DOCUSIGN_BASE_PATH")

    aws_access_key_id: str = Field(default="test", alias="AWS_ACCESS_KEY_ID")
    aws_secret_access_key: str = Field(default="test", alias="AWS_SECRET_ACCESS_KEY")
    aws_region: str = Field(default="test", alias="AWS_REGION")
    aws_bucket: str = Field(default="test", alias="AWS_BUCKET")
    azure_storage_connection_string: str = Field(
        default="", alias="AZURE_STORAGE_CONNECTION_STRING"
    )
    azure_storage_name: str = Field(default="stagecontainer", alias="AZURE_STORAGE_NAME")

    image_generator_key: str = Field(default="test", alias="IMAGE_GENERATOR_KEY")
    image_generator_secret: str = Field(default="test", alias="IMAGE_GENERATOR_SECRET")

    @property
    def stage(self) -> Stage:
        return self.node_env

    @property
    def use_redis(self) -> bool:
        # Port of config/index.ts: useRedis = stage in [stage, production]
        return self.node_env in ("stage", "production")

    @property
    def twitter_redirect_url(self) -> str:
        return f"{self.absolute_url}/api/account/login-twitter-callback"

    def legacy_use_azure_storage(self) -> bool:
        """Accept Node's typo'd env key USE_AZURE_BLOB_BACKET as well."""
        import os

        if self.use_azure_blob_bucket:
            return True
        return os.getenv("USE_AZURE_BLOB_BACKET") == "true"

    def legacy_use_s3_bucket(self) -> bool:
        import os

        if self.use_s3_bucket:
            return True
        return os.getenv("USE_S3_BACKET") == "true"


@lru_cache
def get_settings() -> Settings:
    return Settings()  # type: ignore[call-arg]

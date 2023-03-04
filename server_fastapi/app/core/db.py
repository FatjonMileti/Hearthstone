"""Mongo connection. Port of server_node/src/data/index.ts (dbConnect)."""

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

_client: AsyncIOMotorClient | None = None


def build_connection_string(protocol: str, user: str, password: str, host: str, port: int) -> str:
    """Mirror Node local/stage/prod connectionString building (no dbName in URI)."""
    if user and password:
        return f"{protocol}://{user}:{password}@{host}:{port}"
    return f"{protocol}://{host}:{port}"


async def connect_db(connection_string: str) -> AsyncIOMotorClient:
    global _client
    _client = AsyncIOMotorClient(connection_string, uuidRepresentation="standard")
    return _client


async def close_db() -> None:
    global _client
    if _client is not None:
        _client.close()
        _client = None


def get_client() -> AsyncIOMotorClient:
    if _client is None:
        raise RuntimeError("DB not connected: call connect_db() on startup")
    return _client


def get_database(db_name: str) -> AsyncIOMotorDatabase:
    return get_client()[db_name]

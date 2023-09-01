"""Socket.IO realtime layer. Port of utils/socket.io.ts + bin/www.ts socket setup.

Events: join_room / send_message / view_property (+ disconnect cleanup).
Auth: handshake.auth.token verified like authorize() (HS256/iss/aud); invalid
tokens leave the socket unregistered (Node just returns — replicated).

Mount: main.py exposes `socket_app = socketio.ASGIApp(sio, other_asgi_app=app)`.
Run uvicorn against `app.main:socket_app` in stage/prod for websockets; plain
`app.main:app` keeps serving REST (tests use it).
"""

import logging
from typing import Any

import socketio

logger = logging.getLogger("hearthstone.socket")


def create_sio_server(settings: Any) -> socketio.AsyncServer:
    kwargs: dict[str, Any] = {"async_mode": "asgi", "cors_allowed_origins": settings.frontend_url}
    if settings.use_redis:
        kwargs["client_manager"] = socketio.AsyncRedisManager(settings.redis_url)
    return socketio.AsyncServer(**kwargs)


def register_handlers(sio: socketio.AsyncServer, get_db: Any) -> dict:
    """Wire events; returns the users registry {user_id: [sid]} (like socketApi.users)."""
    users: dict[str, list[str]] = {}

    @sio.event
    async def connect(sid: str, environ: dict, auth: Any = None) -> None:
        from app.core.security import decode_access_token

        logger.info("User Connected: %s", sid)
        token = (auth or {}).get("token") if isinstance(auth, dict) else None
        if not token:
            return
        # Settings are resolved lazily from the app via get_db's closure owner.
        from app.core.config import get_settings

        claims = decode_access_token(token, get_settings().jwt_secret)
        if not claims:
            return
        users.setdefault(claims["user_id"], []).append(sid)

    @sio.event
    async def join_room(sid: str, room: str) -> None:
        await sio.enter_room(sid, room)
        logger.info("User joined room %s", room)

    @sio.event
    async def send_message(sid: str, data: dict) -> None:
        from app.services.chat_service import handle_new_message

        async def emit(event: str, payload: Any, room: Any = None) -> None:
            if room:
                await sio.emit(event, payload, room=room)
            else:
                await sio.emit(event, payload, to=sid)

        message, notified = await handle_new_message(get_db(), emit, data)
        # Fan-out room details to the notified user's sockets (update_message_list).
        for socket_id in users.get(notified, []):
            await sio.emit("update_message_list", message, to=socket_id)

    @sio.event
    async def view_property(sid: str, data: dict) -> None:
        from app.services.chat_service import record_property_view

        await record_property_view(
            get_db(), property_id=data.get("propertyId"), user_id=data.get("userId")
        )

    @sio.event
    async def disconnect(sid: str) -> None:
        logger.info("User Disconnected %s", sid)
        for user_id in list(users):
            if sid in users[user_id]:
                users[user_id].remove(sid)
                if not users[user_id]:
                    del users[user_id]

    return users

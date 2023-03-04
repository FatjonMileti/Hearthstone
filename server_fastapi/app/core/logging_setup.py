"""Access logging. Port of server_node/src/app.log.ts.

Node morgan format (bodies masked on /login and /register):
  [:date[iso]] :remote-addr :remote-user :method :url HTTP/:http-version
  :status :res[content-length] :req-body - :response-time ms
"""

import json
import logging
import time
from pathlib import Path

from fastapi import Request

logger = logging.getLogger("hearthstone.access")

_MASKED_PATH_SUFFIXES = ("/login", "/register")


def _should_mask(path: str) -> bool:
    return any(path.endswith(suffix) for suffix in _MASKED_PATH_SUFFIXES)


def _body_for_log(path: str, body: bytes) -> str:
    if _should_mask(path) or not body:
        return ""
    try:
        return json.dumps(json.loads(body), separators=(",", ":"))[:2000]
    except (ValueError, TypeError):
        return ""


async def access_log_middleware(request: Request, call_next):  # type: ignore[no-untyped-def]
    start = time.perf_counter()
    # Read + cache body so downstream handlers still see it.
    body = await request.body()
    response = await call_next(request)
    elapsed_ms = (time.perf_counter() - start) * 1000
    content_length = response.headers.get("content-length", "-")
    logger.info(
        "%s %s %s %s HTTP/%s %s %s %s - %.1f ms",
        request.client.host if request.client else "-",
        "-",
        request.method,
        request.url.path,
        request.scope.get("http_version", "1.1"),
        response.status_code,
        content_length,
        _body_for_log(request.url.path, body),
        elapsed_ms,
    )
    return response


def configure_file_logging(log_dir: str = "logs") -> None:
    """Rotating access.log equivalent (Node: rotating-file-stream 10M / 5d)."""
    from logging.handlers import TimedRotatingFileHandler

    Path(log_dir).mkdir(parents=True, exist_ok=True)
    handler = TimedRotatingFileHandler(
        f"{log_dir}/access.log", when="D", interval=5, backupCount=30
    )
    handler.setFormatter(logging.Formatter("%(asctime)s %(message)s"))
    logger.addHandler(handler)
    logger.setLevel(logging.INFO)
    logger.propagate = False

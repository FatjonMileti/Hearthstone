import logging
from typing import Any

from slowapi import Limiter
from slowapi.util import get_remote_address

logger = logging.getLogger("hearthstone.ratelimit")

enabled: bool = False

limiter = Limiter(key_func=get_remote_address, default_limits=["10000/hour"])


def is_enabled() -> bool:
    return enabled


def apply_rate_limiting(app: Any) -> None:
    if not enabled:
        logger.info("rate limiter disabled")
        return
    from fastapi import FastAPI
    from slowapi import _rate_limit_exceeded_handler
    from slowapi.errors import RateLimitExceeded

    if not isinstance(app, FastAPI):
        raise RuntimeError("apply_rate_limiting expects a FastAPI app")
    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)  # type: ignore[arg-type]

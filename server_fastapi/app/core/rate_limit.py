"""Rate limiting.

Port of server_node/src/middleware/rateLimiter.ts — NOTE: in Node both
`consume()` calls are commented out, so the limiter is a no-op pass-through.
SlowAPI is wired below but DISABLED by default to preserve parity
(Task 26 decision: enable explicitly per-route when needed).

To enable globally: set `enabled = True` (or env RATE_LIMIT_ENABLED=true) and
call `apply_rate_limiting(app)` from the app factory.
"""

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
    """Attach SlowAPI middleware + 429 handler. No-op unless enabled."""
    if not enabled:
        logger.info("rate limiter disabled (parity with server_node)")
        return
    from fastapi import FastAPI
    from slowapi import _rate_limit_exceeded_handler
    from slowapi.errors import RateLimitExceeded

    if not isinstance(app, FastAPI):
        raise RuntimeError("apply_rate_limiting expects a FastAPI app")
    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)  # type: ignore[arg-type]

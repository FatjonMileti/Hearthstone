"""Rate limiting stub.

Port of server_node/src/middleware/rateLimiter.ts — NOTE: in Node both
`consume()` calls are commented out, so the limiter is a no-op pass-through.
We wire SlowAPI but keep it DISABLED by default to preserve parity.
Enable explicitly per-route when Task 26 decides.
"""

enabled: bool = False


def is_enabled() -> bool:
    return enabled

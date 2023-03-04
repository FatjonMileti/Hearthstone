"""JSON error helpers. Shape matches server_node/src/app.ts error handler:
{message, stack?} with stack hidden on stage/production.
"""

from fastapi import HTTPException


def invalid_id_error() -> HTTPException:
    return HTTPException(status_code=400, detail="invalid_id")

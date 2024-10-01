from fastapi import HTTPException


def invalid_id_error() -> HTTPException:
    return HTTPException(status_code=400, detail="invalid_id")

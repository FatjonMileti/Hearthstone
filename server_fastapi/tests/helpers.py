"""Shared test helpers for Phase 3+ router tests."""

from datetime import datetime
from typing import Any

from app import models
from app.core.security import hash_password

PASSWORD = "Hearthstone1234!"


async def make_user(db: Any, *, email: str, role: str, first_name: str = "Test") -> dict:
    doc = {
        "first_name": first_name,
        "last_name": "User",
        "email": email,
        "hash": hash_password(PASSWORD),
        "role": role,
        "is_disabled": False,
        "created_at": datetime.now(),
    }
    result = await db[models.USER].insert_one(doc)
    doc["_id"] = result.inserted_id
    return doc


def token_for(user: dict) -> str:
    from app.core.config import get_settings
    from app.core.security import generate_token_pair

    settings = get_settings()
    pair = generate_token_pair(
        user_id=str(user["_id"]),
        first_name=user.get("first_name", ""),
        role=user.get("role", ""),
        jwt_secret=settings.jwt_secret,
        refresh_secret=settings.refresh_secret,
        jwt_expire_seconds=7200,
        refresh_expire_seconds=172800,
        rules=[],
    )
    return pair["access_token"]


def auth(user: dict) -> dict:
    return {"Authorization": f"Bearer {token_for(user)}"}


FULL_ASSET = {
    "title": "Sunny flat",
    "description": "Nice place",
    "area_of_interest": "London",
    "radius": "5",
    "asset_address": {"latitude": 51.5, "longitude": -0.12},
    "status_string": "Live",
    "transaction_type_string": "Rent",
    "property_type": "Flats",
    "floor_size": 80,
    "floor_size_unit": "sq.m",
    "room_details": {"number_of_bathrooms": 1, "number_of_bedrooms": 2},
    "budget": {"min_budget": 500, "max_budget": 1500},
    "epc_rating": "B",
    "property_images": [],
}

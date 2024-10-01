"""
Clears and reseeds users -> properties -> criteria like the Node runner.
faker data mirrors user/property/criteria seeders (default role accounts
hearthstone@hearthstone.com / Hearthstone1234 plus generated docs).
"""

import asyncio
from datetime import UTC, datetime
from typing import Any

import typer
from faker import Faker

app = typer.Typer(help="Seed the database with faker data")
fake = Faker()

DEFAULT_PASSWORD = "Hearthstone1234"
DEFAULT_ROLES = ("Agent", "Tenant", "Landlord", "NewUser")


async def seed_users(db: Any, count: int = 10) -> list:
    from app import models
    from app.core.security import ahash_password

    for col in (
        models.USER,
        models.USER_LOG,
        models.ROOM,
        models.MESSAGE,
        models.DOCUMENT,
        models.MATCH,
        models.OFFER,
    ):
        await db[col].delete_many({})

    hashed = await ahash_password(DEFAULT_PASSWORD)
    now = datetime.now(UTC)
    docs = [
        {
            "first_name": "Hearthstone",
            "last_name": role,
            "email": f"{role}@Hearthstone.com",
            "role": role,
            "has_completed_initial_setup": role in ("Landlord", "Tenant"),
            "phone": fake.phone_number(),
            "is_disabled": False,
            "avatar": "Hearthstone" if role == "Agent" else fake.random_element("012345".split()),
            "hash": hashed,
            "created_at": now,
        }
        for role in DEFAULT_ROLES
    ]
    # Node's random-user batch is commented out; seed extra random tenants/landlords
    # up to `count` total to honor the CLI contract.
    for _ in range(max(count - len(docs), 0)):
        docs.append(
            {
                "first_name": fake.first_name(),
                "last_name": fake.last_name(),
                "email": fake.unique.email(),
                "role": fake.random_element(("Landlord", "Tenant")),
                "has_completed_initial_setup": True,
                "phone": fake.phone_number(),
                "is_disabled": False,
                "description": fake.sentence(),
                "avatar": fake.random_element("012345".split()),
                "address": fake.street_address(),
                "last_login": datetime.now(UTC),
                "hash": hashed,
                "created_at": now,
            }
        )
    result = await db[models.USER].insert_many(docs)
    print(f"{len(result.inserted_ids)} users seeded successfully.")
    return result.inserted_ids


async def seed_properties(db: Any, count: int = 10) -> list:
    from app import models

    for col in (models.PROPERTY, models.PROPERTY_DETAIL, models.PROPERTY_VIEW, models.PROPERTY_LOG):
        await db[col].delete_many({})

    landlord = await db[models.USER].find_one({"email": "Landlord@Hearthstone.com"})
    created_by = landlord["_id"] if landlord else None
    now = datetime.now(UTC)
    docs: list[dict] = [
        {
            "title": fake.sentence(nb_words=4),
            "description": fake.paragraph(),
            "area_of_interest": fake.street_address(),
            "radius": fake.random_element(("1", "5", "10", "50")),
            "asset_address": {
                "administrative_area_level_1": fake.country(),
                "latitude": float(fake.latitude()),
                "longitude": float(fake.longitude()),
                "text": fake.street_address(),
            },
            "budget": {
                "min_budget": fake.random_int(100, 500),
                "max_budget": fake.random_int(600, 5000),
            },
            "status_string": fake.random_element(("Live", "Draft")),
            "transaction_type_string": "Rent",
            "property_images": [],
            "created_by": created_by,
            "created_at": now,
        }
        for _ in range(count)
    ]
    result = await db[models.PROPERTY].insert_many(docs)
    # property-detail counters (score simplified; full getPropertyScore lands in Task 13).
    await db[models.PROPERTY_DETAIL].insert_many(
        [
            {"property": pid, "views": 0, "matches": 0, "property_score": 0}
            for pid in result.inserted_ids
        ]
    )
    print(f"{count} properties seeded successfully.")
    return result.inserted_ids


async def seed_criteria(db: Any, count: int = 5) -> list:
    from app import models

    await db[models.CRITERIA].delete_many({})
    await db[models.MATCH_LOG].delete_many({})

    async def _criteria_for(email: str, full: bool) -> dict | None:
        user = await db[models.USER].find_one({"email": email})
        if not user:
            return None
        base: dict[str, Any] = {
            "area_of_interest": fake.street_address(),
            "radius": fake.random_element(("1", "5", "10", "50")),
            "transaction_type_string": "Rent",
            "created_by": user["_id"],
            "created_at": datetime.now(UTC),
        }
        if full:
            base.update(
                {
                    "budget": {"min": 300, "max": 2000},
                    "property_features": ["Garden"],
                    "specific_property_features": ["Furnished"],
                    "floor_size": "50-100",
                    "room_details": {"number_of_bathrooms": "1-2", "number_of_bedrooms": "1-3"},
                    "looking_for": "Looking for a place",
                }
            )
        return base

    docs = [
        c
        for c in (
            await _criteria_for("Landlord@Hearthstone.com", False),
            await _criteria_for("Tenant@Hearthstone.com", True),
        )
        if c
    ]
    if docs:
        result = await db[models.CRITERIA].insert_many(docs)
        print(f"{count} criteria seeded successfully.")
        return result.inserted_ids
    return []


@app.command()
def run(users: int = 10, properties: int = 10, criteria: int = 5) -> None:
    """Seed users, properties and criteria (port of seeders/index.ts)."""
    from app.core.config import get_settings
    from app.core.db import close_db, connect_db, get_client

    async def _run() -> None:
        settings = get_settings()
        await connect_db(settings.db_connection_string)
        try:
            db = get_client()[settings.mongo_db_name]
            await seed_users(db, users)
            await seed_properties(db, properties)
            await seed_criteria(db, criteria)
        finally:
            await close_db()

    asyncio.run(_run())


if __name__ == "__main__":
    app()

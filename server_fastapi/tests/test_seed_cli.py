"""Phase 2 Task 12: CLI helper + seeders (mongomock, no live DB needed)."""

from typing import Any

from app import models
from app.cli import _create_agent
from app.seed import seed_criteria, seed_properties, seed_users


async def test_create_agent_helper_creates_enabled_agent(db: Any) -> None:
    user_id = await _create_agent(
        db,
        email="boss@example.com",
        password="Strong123!",
        first_name="Boss",
        last_name="Agent",
    )
    doc = await db[models.USER].find_one({"_id": user_id})
    assert doc["role"] == "Agent"
    assert doc["is_disabled"] is False
    assert doc["hash"] != "Strong123!"


async def test_seed_users_properties_criteria(db: Any) -> None:
    user_ids = await seed_users(db, 10)
    assert len(user_ids) == 10
    emails = {d["email"] for d in await db[models.USER].find().to_list(length=None)}
    assert "Landlord@Hearthstone.com" in emails
    assert "Tenant@Hearthstone.com" in emails

    prop_ids = await seed_properties(db, 4)
    assert len(prop_ids) == 4
    assert await db[models.PROPERTY_DETAIL].count_documents({}) == 4

    crit_ids = await seed_criteria(db, 5)
    assert len(crit_ids) == 2  # landlord-min + tenant-max, like Node's seeder

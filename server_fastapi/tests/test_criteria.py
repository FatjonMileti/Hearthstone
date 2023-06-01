"""Phase 3 Task 14: criteria create/get/update + role switch."""

from typing import Any

from httpx import AsyncClient

from tests.helpers import auth, make_user

CRITERIA = {
    "area_of_interest": "London",
    "radius": "5",
    "budget_for": "Month",
    "budget": {"min": 500, "max": 1500},
    "transaction_type_string": "Rent",
    "looking_for": "I’m looking for a place",
    "moving_time": "This month",
}


async def test_criteria_flow_and_role_switch(client: AsyncClient, db: Any) -> None:
    user = await make_user(db, email="n@example.com", role="NewUser")

    missing = await client.get("/api/criteria/", headers=auth(user))
    assert missing.status_code == 404

    created = await client.post("/api/criteria/", json=CRITERIA, headers=auth(user))
    assert created.status_code == 201, created.text
    assert created.json()["currency_code"] == "GBP"

    from app import models

    updated_user = await db[models.USER].find_one({"email": "n@example.com"})
    assert updated_user["role"] == "Tenant"
    assert updated_user["has_completed_initial_setup"] is True

    got = await client.get("/api/criteria/", headers=auth(user))
    assert got.status_code == 200

    patched = await client.patch(
        "/api/criteria/",
        json={"moving_time": "Next month", "radius": "10"},
        headers=auth(user),
    )
    assert patched.status_code == 200
    assert patched.json()["radius"] == "10"
    assert patched.json()["moving_time"] == "Next month"

    by_id = await client.get(f"/api/criteria/{created.json()['_id']}", headers=auth(user))
    assert by_id.status_code == 200

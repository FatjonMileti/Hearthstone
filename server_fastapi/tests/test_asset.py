"""Phase 3 Task 13: asset CRUD, validation, upload, applications, invitation."""

from typing import Any

from httpx import AsyncClient

from app import models
from tests.helpers import FULL_ASSET, auth, make_user


async def test_asset_crud_and_guards(client: AsyncClient, db: Any) -> None:
    landlord = await make_user(db, email="l@example.com", role="Landlord")
    tenant = await make_user(db, email="t@example.com", role="Tenant")

    # Tenant lacks Read Property ability -> 403 (Node parity).
    denied = await client.get("/api/asset/", headers=auth(tenant))
    assert denied.status_code == 403

    created = await client.post("/api/asset/", json=FULL_ASSET, headers=auth(landlord))
    assert created.status_code == 201, created.text
    assert created.json()["currency_code"] == "GBP"
    assert created.json()["status_string"] == "Live"
    prop_id = created.json()["_id"]
    assert await db[models.PROPERTY_DETAIL].count_documents({}) == 1

    # Full validation: missing required fields -> 400 (Node Joi behavior).
    bad = await client.post("/api/asset/", json={"title": "x"}, headers=auth(landlord))
    assert bad.status_code == 400

    # Draft allows everything.
    draft = await client.post("/api/asset/draft", json={"title": "draft"}, headers=auth(landlord))
    assert draft.status_code == 201

    listed = await client.get("/api/asset/?status=published", headers=auth(landlord))
    assert listed.status_code == 200
    assert listed.json()["totalDocs"] == 1  # draft is not Live
    assert listed.json()["totalDocsUnfiltered"] == 2
    all_assets = await client.get("/api/asset/", headers=auth(landlord))
    assert all_assets.json()["totalDocs"] == 2

    got = await client.get(f"/api/asset/{prop_id}", headers=auth(landlord))
    assert got.status_code == 200

    patched = await client.patch(
        f"/api/asset/{prop_id}", json={"title": "Renamed"}, headers=auth(landlord)
    )
    assert patched.status_code == 200
    assert patched.json()["title"] == "Renamed"

    last = await client.get("/api/asset/last", headers=auth(landlord))
    assert last.status_code == 200
    assert last.json()["property"]["_id"] == prop_id
    assert "details" in last.json()

    deleted = await client.request("DELETE", f"/api/asset/{prop_id}", headers=auth(landlord))
    assert deleted.status_code == 204
    assert await db[models.PROPERTY].count_documents({}) == 1  # draft remains

    bad_id = await client.get("/api/asset/nope", headers=auth(landlord))
    assert bad_id.status_code == 400


async def test_upload_and_applications(client: AsyncClient, db: Any) -> None:
    landlord = await make_user(db, email="l@example.com", role="Landlord")
    tenant = await make_user(db, email="t@example.com", role="Tenant")
    prop = await client.post("/api/asset/", json=FULL_ASSET, headers=auth(landlord))
    prop_id = prop.json()["_id"]

    up = await client.post(
        "/api/asset/upload",
        headers=auth(landlord),
        files=[("files", ("a.png", b"data", "image/png"))],
    )
    assert up.status_code == 200, up.text
    assert up.json()[0]["isNew"] is True
    assert up.json()[0]["link"].endswith(f"/api/file/{up.json()[0]['key']}")

    sent = await client.post(
        f"/api/asset/{prop_id}/send-application",
        headers=auth(tenant),
        json={"adults_number": 2, "participants": [], "documents": []},
    )
    assert sent.status_code == 200, sent.text
    assert sent.json()["application_status"] == "In Proccess"

    mine = await client.get(f"/api/asset/{prop_id}/application", headers=auth(tenant))
    assert mine.status_code == 200

    all_apps = await client.get(f"/api/asset/{prop_id}/get-applications", headers=auth(landlord))
    assert all_apps.json()["totalDocs"] == 1

    updated = await client.patch(
        f"/api/asset/{prop_id}/update-application",
        headers=auth(tenant),
        json={"documents": [{"key": "k"}]},
    )
    assert updated.status_code == 200

    inv = await client.post(
        f"/api/asset/{prop_id}/send-invitation",
        headers=auth(landlord),
        json={
            "first_name": "Bob",
            "last_name": "B",
            "email": "bob@example.com",
            "phone": "123",
            "invite_reason": "viewing",
            "invite_type": "viewing",
        },
    )
    assert inv.status_code == 200
    assert inv.json() == {"message": "invitation_send"}

    viewers = await client.get(f"/api/asset/{prop_id}/viewed-by", headers=auth(landlord))
    assert viewers.status_code == 200
    assert viewers.json()["totalDocs"] == 0

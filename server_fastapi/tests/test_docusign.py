"""Phase 5 Task 21: docusign local flows (SDK mocked, no network)."""

from typing import Any

from httpx import AsyncClient

from app import models
from app.services import docusign as ds_mod
from tests.helpers import FULL_ASSET, auth, make_user


class FakeDsClient:
    def __init__(self, settings: Any, db: Any) -> None:
        self.calls: list = []

    async def create_envelope(self, definition: dict) -> dict:
        self.calls.append(definition)
        return {
            "envelopeId": "env-123",
            "status": "sent",
            "statusDateTime": "2024-01-01T00:00:00Z",
            "uri": "/uri",
        }

    async def recipient_view(self, envelope_id: str, view_request: dict) -> str:
        return f"https://docusign/view/{envelope_id}"

    async def download_document(self, envelope_id: str, document_id: str = "1") -> bytes:
        if envelope_id == "missing":
            raise RuntimeError("not found")
        return b"%PDF-signed"


async def test_consent_and_callback_redirects(client: AsyncClient) -> None:
    consent = await client.get("/api/docusign/get-consent", follow_redirects=False)
    assert consent.status_code == 302
    assert "oauth/auth" in consent.headers["location"]
    callback = await client.get("/api/docusign/callback", follow_redirects=False)
    assert callback.status_code == 302


async def test_create_envelope_and_gates(client: AsyncClient, db: Any, monkeypatch: Any) -> None:
    monkeypatch.setattr(ds_mod, "get_client", lambda settings, db: FakeDsClient(settings, db))
    landlord = await make_user(db, email="l@example.com", role="Landlord")
    tenant = await make_user(db, email="t@example.com", role="Tenant")
    prop = await client.post("/api/asset/", json=FULL_ASSET, headers=auth(landlord))
    prop_id = prop.json()["_id"]

    # Tenant lacks Create SignGenerator -> 403 (Node parity).
    denied = await client.post(
        "/api/docusign/create-envelope",
        headers=auth(tenant),
        json={
            "tenant": str(tenant["_id"]),
            "landlord": str(landlord["_id"]),
            "property_id": prop_id,
        },
    )
    assert denied.status_code == 403

    created = await client.post(
        "/api/docusign/create-envelope",
        headers=auth(landlord),
        json={
            "tenant": str(tenant["_id"]),
            "landlord": str(landlord["_id"]),
            "property_id": prop_id,
        },
    )
    assert created.status_code == 200, created.text
    assert created.json()["envelope_id"] == "env-123"
    assert created.json()["sign_url_tenant"].startswith("https://docusign/view/")

    listed = await client.get("/api/docusign/envelope", headers=auth(landlord))
    assert listed.status_code == 200
    assert listed.json()["totalDocs"] == 1

    # NewUser has no SignGenerator rights -> 403.
    newbie = await make_user(db, email="n@example.com", role="NewUser")
    assert (await client.get("/api/docusign/envelope", headers=auth(newbie))).status_code == 403

    by_id = await client.get(
        f"/api/docusign/envelope/{created.json()['_id']}", headers=auth(landlord)
    )
    assert by_id.status_code == 200
    assert by_id.json()["can_download"] is False

    by_filter = await client.get(
        "/api/docusign/?document_type=Rent Contract", headers=auth(landlord)
    )
    assert by_filter.status_code == 200

    # Public download streams the PDF; unknown envelope redirects to frontend.
    pdf = await client.get("/api/docusign/envelope/env-123/download?fileName=signed.pdf")
    assert pdf.status_code == 200
    assert pdf.content == b"%PDF-signed"
    gone = await client.get("/api/docusign/envelope/missing/download", follow_redirects=False)
    assert gone.status_code == 302
    assert "file_is_not_signed" in gone.headers["location"]


async def test_success_sign_flow(client: AsyncClient, db: Any) -> None:
    landlord = await make_user(db, email="l@example.com", role="Landlord")
    tenant = await make_user(db, email="t@example.com", role="Tenant")
    doc = {
        "envelope_id": "env-9",
        "status": "sent",
        "document_type": "Rent Contract",
        "land_lord": landlord["_id"],
        "tenant": tenant["_id"],
        "signed_by_landlord": False,
        "signed_by_tenant": False,
    }
    await db[models.ENVELOPE].insert_one(doc)

    done = await client.get(
        f"/api/docusign/success?userId={tenant['_id']}&userType=Tenant"
        "&envelopId=env-9&event=signing_complete",
        follow_redirects=False,
    )
    assert done.status_code == 302
    assert "signing_complete" in done.headers["location"]
    updated = await db[models.ENVELOPE].find_one({"envelope_id": "env-9"})
    assert updated["signed_by_tenant"] is True

    expired = await client.get("/api/docusign/success?event=ttl_expired", follow_redirects=False)
    assert "link_exipired" in expired.headers["location"]

    plain = await client.get("/api/docusign/success", follow_redirects=False)
    assert plain.status_code == 302


async def test_transaction_envelope_links_user(
    client: AsyncClient, db: Any, monkeypatch: Any
) -> None:
    monkeypatch.setattr(ds_mod, "get_client", lambda settings, db: FakeDsClient(settings, db))
    tenant = await make_user(db, email="t@example.com", role="Tenant")
    res = await client.post("/api/docusign/create-transaction-envelope", headers=auth(tenant))
    assert res.status_code == 200, res.text
    me = await db[models.USER].find_one({"_id": tenant["_id"]})
    assert "download" in (me.get("transaction_agreement_link") or "")

"""Phase 4 Task 19: documents + file serving."""

from typing import Any

from bson import ObjectId
from httpx import AsyncClient

from tests.helpers import auth, make_user


async def test_document_flow_and_approval_gate(client: AsyncClient, db: Any) -> None:
    landlord = await make_user(db, email="l@example.com", role="Landlord")
    tenant = await make_user(db, email="t@example.com", role="Tenant")

    # PARITY QUIRK: GET /api/document always returns [] (Node's unset req.user).
    assert (await client.get("/api/document/", headers=auth(tenant))).json() == []

    up = await client.post(
        "/api/document/upload",
        headers=auth(tenant),
        files=[("files", ("id.pdf", b"data", "application/pdf"))],
    )
    assert up.status_code == 200

    created = await client.post(
        "/api/document/",
        headers=auth(tenant),
        json={
            "file": [{"key": up.json()[0]["key"], "approved": False}],
            "participant": str(landlord["_id"]),
        },
    )
    assert created.status_code == 201, created.text
    assert created.json()["tenant"] == str(tenant["_id"])
    assert created.json()["landlord"] == str(landlord["_id"])
    doc_id = created.json()["_id"]

    by_user = await client.get(
        f"/api/document/by-user?participant={landlord['_id']}", headers=auth(tenant)
    )
    assert by_user.status_code == 200
    assert (await client.get("/api/document/by-user", headers=auth(tenant))).status_code == 404

    # Tenant cannot approve file.approved (CASL cannot rule).
    patched = await client.patch(
        f"/api/document/{doc_id}",
        headers=auth(tenant),
        json={
            "file": [{"key": up.json()[0]["key"], "approved": False}],
            "fileDoc": {"key": up.json()[0]["key"], "approved": True},
        },
    )
    assert patched.status_code == 200
    assert patched.json()["file"][0]["approved"] is False

    # Landlord fails the subject-only Update-Documents gate (their only Update
    # rule is field-scoped to file.approved, which does not match a blanket
    # ability.can(Update, Documents) check) — Node parity: 403.
    forbidden = await client.patch(
        f"/api/document/{doc_id}",
        headers=auth(landlord),
        json={"fileDoc": {"key": up.json()[0]["key"], "approved": True}},
    )
    assert forbidden.status_code == 403

    deleted = await client.request("DELETE", f"/api/document/{doc_id}", headers=auth(tenant))
    assert deleted.status_code == 200
    assert deleted.json() == {"message": "Document deleted successfully"}
    assert (await client.get(f"/api/document/{doc_id}", headers=auth(tenant))).status_code == 404


async def test_file_serving(client: AsyncClient, db: Any) -> None:
    tenant = await make_user(db, email="t@example.com", role="Tenant")
    up = await client.post(
        "/api/document/upload",
        headers=auth(tenant),
        files=[("files", ("doc.pdf", b"pdf-bytes", "application/pdf"))],
    )
    key = up.json()[0]["key"]

    # Public: no auth needed.
    served = await client.get(f"/api/file/{key}")
    assert served.status_code == 200
    assert served.content == b"pdf-bytes"
    assert served.headers["content-type"] == "application/pdf"

    assert (await client.get("/api/file/does-not-exist")).status_code == 404
    assert (
        await client.get(f"/api/document/{ObjectId()}", headers=auth(tenant))
    ).status_code == 404

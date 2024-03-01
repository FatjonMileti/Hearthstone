"""Docusign router. Port of Docusign/docusign-test.controller.ts route table.

Static paths are declared before /envelope/:id so they are not shadowed.
GET /envelope/:id/download stays PUBLIC with no ObjectId guard (Node parity —
flagged in PORTING_NOTES/Task 26 as a risk to revisit).
"""

import tempfile
from pathlib import Path
from typing import Annotated, Any

from fastapi import APIRouter, Depends, HTTPException, Query, Request
from fastapi.responses import FileResponse, RedirectResponse

from app import models
from app.api.deps import CurrentUser, Paging, validate_object_id
from app.core.config import Settings, get_settings
from app.core.permissions import Action, can_on_object
from app.services import docusign as ds
from app.services.mongo_helpers import serialize_doc, to_oid

router = APIRouter(prefix="/docusign", tags=["docusign"])


def _db(request: Request) -> Any:
    return request.app.state.db


@router.get("/", status_code=200)
async def by_user_filter(
    request: Request,
    user: CurrentUser,
    settings: Annotated[Settings, Depends(get_settings)],
    document_type: Annotated[str | None, Query()] = None,
):  # type: ignore[no-untyped-def]
    doc = await _db(request)[models.ENVELOPE].find_one(
        {"created_by": to_oid(user["user_id"]), "document_type": document_type}
    )
    if not doc:
        raise HTTPException(status_code=404, detail="not_found")
    populated = await ds.populate_envelope(_db(request), doc)
    me = populated["land_lord"] if user["role"] == "Landlord" else populated["tenant"]
    refreshed = await ds.refresh_recipient_url(
        _db(request),
        envelope=populated,
        user=me if isinstance(me, dict) else {},
        client=ds.get_client(settings, _db(request)),
        api_url=settings.absolute_url,
    )
    return refreshed


@router.get("/get-consent", include_in_schema=False)
async def consent(settings: Annotated[Settings, Depends(get_settings)]):  # type: ignore[no-untyped-def]
    return RedirectResponse(ds.get_consent_url(settings), status_code=302)


@router.get("/callback", include_in_schema=False)
async def callback(settings: Annotated[Settings, Depends(get_settings)]):  # type: ignore[no-untyped-def]
    return RedirectResponse(settings.frontend_url, status_code=302)


@router.get("/success", include_in_schema=False)
async def success(
    request: Request,
    settings: Annotated[Settings, Depends(get_settings)],
    userId: Annotated[str | None, Query()] = None,
    userType: Annotated[str | None, Query()] = None,
    envelopId: Annotated[str | None, Query()] = None,
    event: Annotated[str | None, Query()] = None,
):  # type: ignore[no-untyped-def]
    try:
        url, _ = await ds.apply_success_sign(
            _db(request),
            user_id=userId,
            user_type=userType,
            envelope_ref=envelopId,
            event=event,
            frontend_url=settings.frontend_url,
        )
        return RedirectResponse(url, status_code=302)
    except HTTPException as exc:
        raise HTTPException(status_code=400, detail=str(exc.detail)) from None


@router.get("/envelope", status_code=200)
async def envelope_list(
    request: Request,
    user: CurrentUser,
    paging: Paging,
    document_type: Annotated[str | None, Query()] = None,
    property: Annotated[str | None, Query()] = None,  # noqa: A002
    getDataFor: Annotated[str | None, Query()] = None,
    participant: Annotated[str | None, Query()] = None,
):  # type: ignore[no-untyped-def]
    if not can_on_object(user["user_id"], user["role"], Action.read, "SignGenerator", None):
        raise HTTPException(status_code=403, detail="forbidden")
    query: dict[str, Any] = {}
    if document_type and document_type == ds.TRANSACTION_AGREEMENT:
        if getDataFor == "Tenant":
            query["tenant"] = to_oid(user["user_id"])
        if getDataFor == "Landlord":
            query["land_lord"] = to_oid(user["user_id"])
    else:
        if getDataFor == "Tenant":
            query["land_lord"] = to_oid(participant)
            query["tenant"] = to_oid(user["user_id"])
        if getDataFor == "Landlord":
            query["tenant"] = to_oid(participant)
            query["land_lord"] = to_oid(user["user_id"])
        if property:
            query["property"] = {"$eq": to_oid(property)}
    if document_type:
        query["document_type"] = {"$eq": document_type}
    return await ds.list_envelopes(
        _db(request),
        query=query,
        page=paging.page if paging.pagination_enabled else None,
        page_size=paging.page_size if paging.pagination_enabled else None,
    )


@router.post("/create-envelope", status_code=200)
async def create_envelope(
    body: dict,
    request: Request,
    user: CurrentUser,
    settings: Annotated[Settings, Depends(get_settings)],
):  # type: ignore[no-untyped-def]
    if not can_on_object(user["user_id"], user["role"], Action.create, "SignGenerator", None):
        raise HTTPException(status_code=403, detail="forbidden")
    db = _db(request)
    landlord = await db[models.USER].find_one({"_id": to_oid(body.get("landlord"))})
    tenant = await db[models.USER].find_one({"_id": to_oid(body.get("tenant"))})
    prop = await db[models.PROPERTY].find_one({"_id": to_oid(body.get("property_id"))})
    if not landlord or not tenant:
        raise HTTPException(status_code=404, detail="User not found")
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")
    offer = await db[models.OFFER].find_one(
        {
            "property": to_oid(body.get("property_id")),
            "created_by": to_oid(body.get("tenant")),
            "created_for": to_oid(body.get("landlord")),
            "refused": False,
            "accepted.status": True,
        }
    )
    client = ds.get_client(settings, db)
    try:
        summary = await client.create_envelope(
            ds.build_contract_envelope(
                settings,
                serialize_doc(landlord),
                serialize_doc(tenant),
                serialize_doc(prop),
                serialize_doc(offer) if offer else None,
            )
        )
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from None
    await ds.create_envelope_doc(
        db,
        summary,
        landlord=body.get("landlord"),
        tenant=body.get("tenant"),
        property_id=body.get("property_id"),
    )
    landlord_url = await client.recipient_view(
        summary["envelopeId"],
        ds.recipient_view_request(
            serialize_doc(landlord), summary["envelopeId"], settings.absolute_url
        ),
    )
    tenant_url = await client.recipient_view(
        summary["envelopeId"],
        ds.recipient_view_request(
            serialize_doc(tenant), summary["envelopeId"], settings.absolute_url
        ),
    )
    return await ds.set_sign_urls(db, summary["envelopeId"], landlord_url, tenant_url)


@router.post("/create-transaction-envelope", status_code=200)
async def create_transaction_envelope(
    request: Request,
    user: CurrentUser,
    settings: Annotated[Settings, Depends(get_settings)],
):  # type: ignore[no-untyped-def]
    db = _db(request)
    me = await db[models.USER].find_one({"_id": to_oid(user["user_id"])})
    if not me:
        raise HTTPException(status_code=404, detail="user_not_found")
    client = ds.get_client(settings, db)
    try:
        summary = await client.create_envelope(
            ds.build_transaction_envelope(settings, serialize_doc(me))
        )
        await ds.create_agreement_doc(
            db, summary, user=serialize_doc(me), document_type=ds.TRANSACTION_AGREEMENT
        )
        url = await client.recipient_view(
            summary["envelopeId"],
            ds.recipient_view_request(
                serialize_doc(me), summary["envelopeId"], settings.absolute_url
            ),
        )
        updated = await ds.set_sign_url(db, summary["envelopeId"], url, me.get("role", ""))
        await db[models.USER].update_one(
            {"_id": me["_id"]},
            {
                "$set": {
                    "transaction_agreement_link": f"{settings.absolute_url}/api/docusign/envelope/"
                    f"{summary['envelopeId']}/download"
                }
            },
        )
        return updated
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from None


@router.get("/envelope/{id}/download", include_in_schema=False)
async def download(
    id: str,
    request: Request,
    settings: Annotated[Settings, Depends(get_settings)],
    fileName: Annotated[str | None, Query()] = None,
):  # type: ignore[no-untyped-def]
    # PUBLIC + no ObjectId guard (Node parity — see Task 26).
    try:
        content = await ds.get_client(settings, _db(request)).download_document(id)
    except Exception:
        return RedirectResponse(f"{settings.frontend_url}?file_is_not_signed", status_code=302)
    if not content:
        return RedirectResponse(f"{settings.frontend_url}?file_is_not_signed", status_code=302)
    try:
        tmp = Path(tempfile.mkdtemp()) / (fileName or "signed_document.pdf")
        tmp.write_bytes(bytes(content))
        return FileResponse(
            path=str(tmp),
            filename=fileName or "signed_document.pdf",
            media_type="application/pdf",
            background=None,
        )
    except OSError:
        raise HTTPException(
            status_code=500, detail="Error retrieving the signed document."
        ) from None


@router.get("/envelope/{id}", status_code=200)
async def envelope_by_id(
    id: str,
    request: Request,
    user: CurrentUser,
    settings: Annotated[Settings, Depends(get_settings)],
):  # type: ignore[no-untyped-def]
    oid = validate_object_id(id)
    envelope = await ds.get_envelope_by_id(_db(request), oid)
    if not envelope:
        raise HTTPException(status_code=404, detail="not_found")
    try:
        client = ds.get_client(settings, _db(request))
        role = user["role"]
        if role == "Landlord" and not envelope.get("signed_by_landlord"):
            land_lord = envelope.get("land_lord")
            envelope = await ds.refresh_recipient_url(
                _db(request),
                envelope=envelope,
                user=land_lord if isinstance(land_lord, dict) else {},
                client=client,
                api_url=settings.absolute_url,
            )
        # PARITY QUIRK: agent branch refreshes with envelope.land_lord (not agent).
        if (
            role == "Agent"
            and not envelope.get("sign_url_agent")
            and envelope.get("document_type") == ds.TRANSACTION_AGREEMENT
        ):
            land_lord = envelope.get("land_lord")
            envelope = await ds.refresh_recipient_url(
                _db(request),
                envelope=envelope,
                user=land_lord if isinstance(land_lord, dict) else {},
                client=client,
                api_url=settings.absolute_url,
            )
        if role == "Tenant" and not envelope.get("signed_by_tenant"):
            tenant = envelope.get("tenant")
            envelope = await ds.refresh_recipient_url(
                _db(request),
                envelope=envelope,
                user=tenant if isinstance(tenant, dict) else {},
                client=client,
                api_url=settings.absolute_url,
            )
        return envelope
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=404, detail="Not found") from None

"""DocuSign service. Port of Docusign/services/{docusign,envelope,docusign.local}.service.ts
+ schemas/envelope.ts.

Structure mirrors Node: pure envelope builders + recipient-view payloads, a lazy
SDK client (docusign_esign imported only when used), JWT-grant token cached in
the docusign.token collection, and local envelope-mirror helpers.
"""

import logging
import time
from datetime import UTC, datetime
from pathlib import Path
from typing import Any

from bson import ObjectId
from fastapi import HTTPException

from app import models
from app.services.mongo_helpers import paginate_response, serialize_doc, to_oid

logger = logging.getLogger("hearthstone.docusign")

RENT_CONTRACT = "Rent Contract"
TRANSACTION_AGREEMENT = "Hearthstone transaction agreement"
PRIVACY_AGREEMENT = "Hearthstone privacy agreement"


def serialize_envelope(doc: dict) -> dict:
    out = serialize_doc(doc)
    out["can_download"] = bool(doc.get("signed_by_landlord") and doc.get("signed_by_tenant"))
    return out


# --- consent / token ----------------------------------------------------------


def get_consent_url(settings: Any) -> str:
    scopes = "signature+impersonation"
    redirect_uri = f"{settings.absolute_url}/api/docusign/callback"
    return (
        f"{settings.ds_oauth_server}/oauth/auth?response_type=code&"
        f"scope={scopes}&client_id={settings.ds_jwt_client_id}&"
        f"redirect_uri={redirect_uri}"
    )


async def get_cached_token(db: Any) -> str | None:
    cursor = db[models.DOCUSIGN_TOKEN].find().sort([("created_at", -1)]).limit(1)
    docs = await cursor.to_list(length=1)
    if docs and time.time() * 1000 < _to_ms(docs[0].get("expires_in")):
        return docs[0].get("token")
    return None


def _to_ms(value: Any) -> float:
    if isinstance(value, datetime):
        return value.timestamp() * 1000
    try:
        return float(value or 0)
    except (TypeError, ValueError):
        return 0


async def store_token(db: Any, token: str, expires_in_seconds: int) -> None:
    await db[models.DOCUSIGN_TOKEN].insert_one(
        {
            "token": token,
            "expires_in": datetime.now(UTC).timestamp() * 1000 + (expires_in_seconds - 60) * 1000,
            "created_at": datetime.now(UTC),
        }
    )


class DocusignClient:
    """Lazy docusign_esign wrapper (mirrors getEnvelopesApi/getToken in Node)."""

    def __init__(self, settings: Any, db: Any) -> None:
        self.settings = settings
        self.db = db
        self._api_client: Any = None

    def _sdk(self) -> Any:
        import docusign_esign  # deferred: SDK only needed for live calls

        return docusign_esign

    def _read_key(self) -> bytes:
        return Path("certs/docusign/private.key").read_bytes()

    async def access_token(self) -> str:
        cached = await get_cached_token(self.db)
        if cached:
            return cached
        docusign_esign = self._sdk()
        client = docusign_esign.ApiClient()
        client.set_base_path(self.settings.docusign_base_path or self.settings.base_path)
        results = client.request_jwt_user_token(
            client_id=self.settings.ds_jwt_client_id,
            user_id=self.settings.impersonated_user_guid,
            oauth_scope="signature",
            private_key_bytes=self._read_key(),
            expires_in=3600,
        )
        token = results.access_token
        await store_token(self.db, token, 3600)
        return token

    async def envelopes_api(self) -> Any:
        docusign_esign = self._sdk()
        token = await self.access_token()
        client = docusign_esign.ApiClient()
        client.set_base_path(self.settings.docusign_base_path or self.settings.base_path)
        client.add_default_header("Authorization", "Bearer " + token)
        return docusign_esign.EnvelopesApi(client)

    async def create_envelope(self, definition: dict) -> dict:
        api = await self.envelopes_api()
        docusign_esign = self._sdk()
        env_def = docusign_esign.EnvelopeDefinition(**definition)
        summary = api.create_envelope(self.settings.app_account_id, envelope_definition=env_def)
        return {
            "envelopeId": summary.envelope_id,
            "status": summary.status,
            "statusDateTime": summary.status_date_time,
            "uri": summary.uri,
        }

    async def recipient_view(self, envelope_id: str, view_request: dict) -> str:
        api = await self.envelopes_api()
        docusign_esign = self._sdk()
        req = docusign_esign.RecipientViewRequest(**view_request)
        result = api.create_recipient_view(
            self.settings.app_account_id, envelope_id, recipient_view_request=req
        )
        return result.url or ""

    async def download_document(self, envelope_id: str, document_id: str = "1") -> bytes:
        api = await self.envelopes_api()
        return api.get_document(self.settings.app_account_id, envelope_id, document_id, {})


def get_client(settings: Any, db: Any) -> DocusignClient:
    return DocusignClient(settings, db)


# --- pure builders (ports of envelope.service.ts) ------------------------------


def _today() -> str:
    return datetime.now().strftime("%d/%m/%Y")


def recipient_view_request(user: dict, envelope_id: str, api_url: str) -> dict:
    return {
        "return_url": (
            f"{api_url}/api/docusign/success?userId={user['_id']}"
            f"&userType={user.get('role')}&envelopId={envelope_id}"
        ),
        "authentication_method": "none",
        "email": user.get("email"),
        "user_name": f"{user.get('first_name')} {user.get('last_name')}",
        "client_user_id": str(user["_id"]),
    }


def build_contract_envelope(
    settings: Any, landlord: dict, tenant: dict, prop: dict, offer: dict | None
) -> dict:
    asset_address = (prop.get("asset_address") or {}).get("text", "")
    asset_rent = prop.get("asset_rent") or {}
    return {
        "template_id": settings.renting_template_id,
        "template_roles": [
            {
                "email": landlord.get("email"),
                "name": f"{landlord.get('first_name')} {landlord.get('last_name')}",
                "client_user_id": str(landlord["_id"]),
                "role_name": "Landlord",
                "tabs": {
                    "text_tabs": [
                        {"tab_label": "property_address", "value": asset_address},
                        {"tab_label": "document_sending_date", "value": _today()},
                        {"tab_label": "nr_of_months", "value": (offer or {}).get("warranty")},
                        {"tab_label": "starting_from_date", "value": _today()},
                        {
                            "tab_label": "renting_price",
                            "value": str((offer or {}).get("offering_price")),
                        },
                        {
                            "tab_label": "deposit_value",
                            "value": str(asset_rent.get("deposit_amount")),
                        },
                    ]
                },
            },
            {
                "email": tenant.get("email"),
                "name": f"{tenant.get('first_name')} {tenant.get('last_name')}",
                "client_user_id": str(tenant["_id"]),
                "role_name": "Tenant",
            },
        ],
        "status": "Sent",
    }


def build_transaction_envelope(settings: Any, user: dict, with_address_tabs: bool = False) -> dict:
    role: dict[str, Any] = {
        "email": user.get("email"),
        "name": f"{user.get('first_name')} {user.get('last_name')}",
        "client_user_id": str(user["_id"]),
        "role_name": "User",
    }
    if with_address_tabs:
        role["tabs"] = {
            "text_tabs": [
                {"tab_label": "creation_date", "value": _today()},
                {"tab_label": "user_address", "value": user.get("address") or "London, UK"},
            ]
        }
    return {
        "template_id": settings.Hearthstone_transaction_agreement_template_id,
        "template_roles": [role],
        "status": "Sent",
    }


# --- local envelope mirror ----------------------------------------------------


async def create_envelope_doc(
    db: Any, summary: dict, *, landlord: Any, tenant: Any, property_id: Any, created_by: Any = None
) -> dict:
    doc = {
        "envelope_id": summary.get("envelopeId"),
        "status": summary.get("status"),
        "document_type": RENT_CONTRACT,
        "status_date_time": summary.get("statusDateTime"),
        "uri": summary.get("uri"),
        "land_lord": to_oid(landlord),
        "tenant": to_oid(tenant),
        "property": to_oid(property_id),
        "created_by": to_oid(created_by if created_by is not None else landlord),
        "signed_by_landlord": False,
        "signed_by_tenant": False,
        "signed_by_agent": False,
        "created_at": datetime.now(UTC),
    }
    result = await db[models.ENVELOPE].insert_one(doc)
    created = await db[models.ENVELOPE].find_one({"_id": result.inserted_id})
    if created is None:
        raise HTTPException(status_code=500, detail="unexpected_empty_result")
    return serialize_envelope(created)


async def create_agreement_doc(db: Any, summary: dict, *, user: dict, document_type: str) -> dict:
    doc: dict[str, Any] = {
        "envelope_id": summary.get("envelopeId"),
        "status": summary.get("status"),
        "document_type": document_type,
        "status_date_time": summary.get("statusDateTime"),
        "uri": summary.get("uri"),
        "created_by": to_oid(user["_id"]),
        "signed_by_landlord": False,
        "signed_by_tenant": False,
        "signed_by_agent": False,
        "created_at": datetime.now(UTC),
    }
    if user.get("role") == "Landlord":
        doc["land_lord"] = to_oid(user["_id"])
    if user.get("role") == "Tenant":
        doc["tenant"] = to_oid(user["_id"])
    result = await db[models.ENVELOPE].insert_one(doc)
    created = await db[models.ENVELOPE].find_one({"_id": result.inserted_id})
    if created is None:
        raise HTTPException(status_code=500, detail="unexpected_empty_result")
    return serialize_envelope(created)


async def set_sign_url(db: Any, envelope_id: str, url: str, role: str) -> dict | None:
    doc = await db[models.ENVELOPE].find_one({"envelope_id": envelope_id})
    if not doc:
        return None
    field = (
        "sign_url_landlord"
        if role == "Landlord"
        else "sign_url_tenant"
        if role == "Tenant"
        else "sign_url_agent"
    )
    await db[models.ENVELOPE].update_one({"_id": doc["_id"]}, {"$set": {field: url or ""}})
    updated = await db[models.ENVELOPE].find_one({"_id": doc["_id"]})
    if updated is None:
        raise HTTPException(status_code=500, detail="unexpected_empty_result")
    return serialize_envelope(updated)


async def set_sign_urls(db: Any, envelope_id: str, landlord_url: str, tenant_url: str) -> dict:
    doc = await db[models.ENVELOPE].find_one({"envelope_id": envelope_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Envelope not found")
    await db[models.ENVELOPE].update_one(
        {"_id": doc["_id"]},
        {"$set": {"sign_url_landlord": landlord_url or "", "sign_url_tenant": tenant_url or ""}},
    )
    updated = await db[models.ENVELOPE].find_one({"_id": doc["_id"]})
    if updated is None:
        raise HTTPException(status_code=500, detail="unexpected_empty_result")
    return serialize_envelope(updated)


async def populate_envelope(db: Any, doc: dict) -> dict:
    out = serialize_envelope(doc)
    for key in ("land_lord", "tenant", "agent"):
        person = await db[models.USER].find_one({"_id": to_oid(doc.get(key))})
        out[key] = serialize_doc(person) if person else doc.get(key)
    return out


async def get_envelope_by_id(db: Any, envelope_id: ObjectId) -> dict | None:
    doc = await db[models.ENVELOPE].find_one({"_id": envelope_id})
    return await populate_envelope(db, doc) if doc else None


async def refresh_recipient_url(
    db: Any, *, envelope: dict, user: dict, client: DocusignClient, api_url: str
) -> dict:
    """Port of generateNewUrl: mint a fresh recipient view and persist by role."""
    url = await client.recipient_view(
        envelope["envelope_id"], recipient_view_request(user, envelope["envelope_id"], api_url)
    )
    field = (
        "sign_url_landlord"
        if user.get("role") == "Landlord"
        else "sign_url_tenant"
        if user.get("role") == "Tenant"
        else "sign_url_agent"
    )
    await db[models.ENVELOPE].update_one({"_id": to_oid(envelope["_id"])}, {"$set": {field: url}})
    updated = await db[models.ENVELOPE].find_one({"_id": to_oid(envelope["_id"])})
    if updated is None:
        raise HTTPException(status_code=500, detail="unexpected_empty_result")
    return await populate_envelope(db, updated)


async def find_envelope(db: Any, query: dict) -> dict | None:
    doc = await db[models.ENVELOPE].find_one(query)
    return serialize_envelope(doc) if doc else None


async def list_envelopes(db: Any, *, query: dict, page: int | None, page_size: int | None) -> dict:
    total = await db[models.ENVELOPE].count_documents(query)
    cursor = db[models.ENVELOPE].find(query)
    if page and page_size:
        docs = await cursor.skip((page - 1) * page_size).limit(page_size).to_list(length=page_size)
    else:
        docs = await cursor.to_list(length=None)
    populated = []
    for doc in docs:
        item = serialize_envelope(doc)
        for key in ("land_lord", "tenant", "agent"):
            person = await db[models.USER].find_one(
                {"_id": to_oid(doc.get(key))},
                {"first_name": 1, "last_name": 1},
            )
            item[key] = serialize_doc(person) if person else doc.get(key)
        populated.append(item)
    return paginate_response(populated, total=total, page=page, limit=page_size)


async def apply_success_sign(
    db: Any,
    *,
    user_id: str | None,
    user_type: str | None,
    envelope_ref: str | None,
    event: str | None,
    frontend_url: str,
) -> tuple[str, int]:
    """Port of successSignRedirect. Returns (redirect_url, status)."""
    if user_id:
        user = await db[models.USER].find_one({"_id": to_oid(user_id)})
        if not user:
            raise HTTPException(status_code=400, detail="user_not_found")
    if event == "signing_complete":
        doc = await db[models.ENVELOPE].find_one({"envelope_id": envelope_ref})
        if not doc:
            raise HTTPException(status_code=400, detail="Envelope not found")
        update: dict[str, Any] = {}
        if user_type == "Tenant":
            update["signed_by_tenant"] = True
        if user_type == "Landlord":
            update["signed_by_landlord"] = True
        if doc.get("document_type") == TRANSACTION_AGREEMENT and user_id:
            await db[models.USER].update_one(
                {"_id": to_oid(user_id)}, {"$set": {"signed_transaction_agreement": True}}
            )
        await db[models.ENVELOPE].update_one({"_id": doc["_id"]}, {"$set": update})
        updated = await db[models.ENVELOPE].find_one({"_id": doc["_id"]})
        if updated is None:
            raise HTTPException(status_code=500, detail="unexpected_empty_result")
        if updated.get("signed_by_landlord") and updated.get("signed_by_tenant"):
            await db[models.ENVELOPE].update_one(
                {"_id": doc["_id"]}, {"$set": {"status": "Signed"}}
            )
            await db[models.PROPERTY].update_one(
                {"_id": to_oid(updated.get("property"))}, {"$set": {"status_string": "Let"}}
            )
        return f"{frontend_url}?event=signing_complete", 302
    if event == "ttl_expired":
        return f"{frontend_url}/agreement?event=link_exipired", 302
    return f"{frontend_url}", 302

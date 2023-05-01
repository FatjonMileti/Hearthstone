"""Property/asset domain service. Port of Property/services/property.service.ts
+ property-detail.service.ts + asset-application.service.ts (application/invitation
persistence, upload passthrough, viewers, published helpers).
"""

from datetime import UTC, datetime
from typing import Any

from bson import ObjectId
from fastapi import HTTPException

from app import models
from app.services import property_helpers as helpers
from app.services.email_service import EmailService, MailOptions
from app.services.log_service import LogAction, write_entity_log
from app.services.mongo_helpers import paginate_response, serialize_doc, to_oid
from app.services.suggestions import PUBLISHED_STATUSES, calculate_similarity
from app.services.templates import send_application_html, send_invitation_html

STATUS_FILTERS = {
    "published": ["Live"],
    "draft": ["Draft"],
    "rented": ["Completed", "Let"],
}


# --- detail / view counters (property-detail.service.ts) ----------------------


async def create_property_detail(db: Any, property_id: ObjectId, score: Any = 0) -> None:
    await db[models.PROPERTY_DETAIL].insert_one(
        {"property": property_id, "views": 0, "matches": 0, "property_score": score}
    )


async def increment_detail(db: Any, property_id: Any, data: dict) -> None:
    await db[models.PROPERTY_DETAIL].update_one({"property": to_oid(property_id)}, {"$inc": data})


async def set_detail(db: Any, property_id: Any, data: dict) -> None:
    await db[models.PROPERTY_DETAIL].update_one({"property": to_oid(property_id)}, {"$set": data})


async def find_detail(db: Any, property_id: Any) -> dict | None:
    return await db[models.PROPERTY_DETAIL].find_one({"property": to_oid(property_id)})


# --- queries ------------------------------------------------------------------


def _serialize_property(doc: dict, api_url: str) -> dict:
    out = serialize_doc(doc)
    out["property_images"] = helpers.generate_links_for_one_asset(
        doc.get("property_images") or [], api_url
    )
    return out


async def find_all(
    db: Any,
    *,
    user_id: str,
    role: str,
    status: str | None,
    page: int | None,
    page_size: int | None,
    sort_field: str | None,
    sort_dir: int,
    api_url: str,
    log_days: int,
) -> dict:
    query: dict[str, Any] = {}
    # PARITY: only Tenant/Landlord are scoped to own assets; Agent + NewUser see all.
    if role in ("Tenant", "Landlord"):
        query["created_by"] = to_oid(user_id)
    if status and status in STATUS_FILTERS:
        query["status_string"] = {"$in": STATUS_FILTERS[status]}
    total_own = await db[models.PROPERTY].count_documents({"created_by": to_oid(user_id)})
    total = await db[models.PROPERTY].count_documents(query)
    cursor = db[models.PROPERTY].find(query).sort([(sort_field or "created_at", sort_dir)])
    if page and page_size:
        docs = await cursor.skip((page - 1) * page_size).limit(page_size).to_list(length=page_size)
    else:
        docs = await cursor.to_list(length=None)
    response = paginate_response(
        [_serialize_property(d, api_url) for d in docs],
        total=total,
        page=page,
        limit=page_size,
    )
    response["totalDocsUnfiltered"] = total_own
    await write_entity_log(
        db,
        collection=models.PROPERTY_LOG,
        user_id=to_oid(user_id),
        action=LogAction.Read,
        info=query,
        log_expiration_days=log_days,
    )
    return response


async def get_by_id(
    db: Any, prop_id: ObjectId, *, user_id: str, api_url: str, log_days: int
) -> dict:
    doc = await db[models.PROPERTY].find_one({"_id": prop_id})
    if not doc:
        raise HTTPException(status_code=404, detail="The item does not exist")
    out = _serialize_property(doc, api_url)
    await write_entity_log(
        db,
        collection=models.PROPERTY_LOG,
        user_id=to_oid(user_id),
        action=LogAction.Read,
        ref=prop_id,
        info=out,
        log_expiration_days=log_days,
    )
    return out


async def find_raw(db: Any, prop_id: Any) -> dict | None:
    return await db[models.PROPERTY].find_one({"_id": to_oid(prop_id)})


async def require_raw(db: Any, prop_id: Any) -> dict:
    doc = await find_raw(db, prop_id)
    if not doc:
        raise HTTPException(status_code=404, detail="The item does not exist")
    return doc


async def create_asset(
    db: Any, *, data: dict, user_id: str, api_url: str, log_days: int, maps: Any = None
) -> dict:
    data = dict(data)
    data["created_by"] = to_oid(user_id)
    data["currency_code"] = "GBP"
    data["master_asset_type_string"] = "Residential"
    addr = data.get("asset_address") or {}
    # PARITY QUIRK: Node checks `longitude && longitude` (twice) — intent is both set.
    if addr.get("latitude") and addr.get("longitude") and maps is not None:
        try:
            normalized = maps.get_address(float(addr["latitude"]), float(addr["longitude"]))
            if normalized:
                data["asset_address"] = normalized
        except (TypeError, ValueError):
            pass
    data["created_at"] = datetime.now(UTC)
    result = await db[models.PROPERTY].insert_one(data)
    doc = await db[models.PROPERTY].find_one({"_id": result.inserted_id})
    if doc is None:
        raise HTTPException(status_code=500, detail="property_not_created")
    await create_property_detail(db, doc["_id"], helpers.get_property_score(doc))
    await write_entity_log(
        db,
        collection=models.PROPERTY_LOG,
        user_id=to_oid(user_id),
        action=LogAction.Create,
        info=data,
        log_expiration_days=log_days,
    )
    return _serialize_property(doc, api_url)


UPDATABLE_FIELDS = (
    "name",
    "flat_details",
    "house_details",
    "parking_details",
    "floor_size_unit",
    "area_of_interest",
    "radius",
    "description",
    "asset_address",
    "title",
    "budget",
    "parking_spot",
    "epc_rating",
    "condition",
    "status_string",
    "transaction_type_string",
    "property_type",
    "asset_rent",
    "floor_size",
    "room_details",
    "property_features",
    "property_preference",
    "specific_property_features",
    "credit_score_requirements",
    "contract_details",
)


async def update_asset(
    db: Any,
    *,
    prop_id: ObjectId,
    data: dict,
    user_id: str,
    api_url: str,
    log_days: int,
    maps: Any = None,
    storage_delete: Any = None,
) -> dict:
    user = await db[models.USER].find_one({"_id": to_oid(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="not found")
    asset = await require_raw(db, prop_id)

    update: dict[str, Any] = {}
    for field in UPDATABLE_FIELDS:
        if field in data:
            update[field] = data[field]

    new_addr = data.get("asset_address") or {}
    old_addr = asset.get("asset_address") or {}
    if (
        new_addr.get("latitude")
        and new_addr.get("longitude")
        and (
            new_addr.get("latitude") != old_addr.get("latitude")
            or new_addr.get("longitude") != old_addr.get("longitude")
        )
        and maps is not None
    ):
        origin = {"lat": new_addr["latitude"], "lng": new_addr["longitude"]}
        for key, place_type in (
            ("distance_from_underground", "subway_station"),
            ("distance_from_schools", "school"),
            ("distance_from_gym", "gym"),
            ("distance_from_high_street", "store"),
        ):
            try:
                dist = maps.get_distance_from(origin, place_type)
                update[key] = {"value": dist["value"] / 1000} if dist else {}
            except (TypeError, ValueError, KeyError):
                update[key] = {}

    if "property_images" in data:
        update["property_images"] = helpers.handle_property_images(
            asset.get("property_images") or [],
            data["property_images"] or [],
            api_url,
            delete_fn=storage_delete,
        )

    if update:
        await db[models.PROPERTY].update_one({"_id": prop_id}, {"$set": update})
    asset = await require_raw(db, prop_id)
    await set_detail(db, prop_id, {"property_score": helpers.get_property_score(asset)})

    from app.services.user_service import set_trust_score

    await set_trust_score(db, to_oid(user_id))  # type: ignore[arg-type]
    await write_entity_log(
        db,
        collection=models.PROPERTY_LOG,
        user_id=to_oid(user_id),
        action=LogAction.Update,
        ref=prop_id,
        info=data,
        log_expiration_days=log_days,
    )
    return _serialize_property(asset, api_url)


async def delete_asset(db: Any, prop_id: ObjectId, *, user_id: str, log_days: int) -> None:
    await db[models.PROPERTY].delete_one({"_id": prop_id})
    await write_entity_log(
        db,
        collection=models.PROPERTY_LOG,
        user_id=to_oid(user_id),
        action=LogAction.Delete,
        ref=prop_id,
        log_expiration_days=log_days,
    )


async def find_last_with_details(db: Any, user_id: str, api_url: str) -> dict:
    cursor = (
        db[models.PROPERTY]
        .find({"status_string": "Live", "created_by": to_oid(user_id)})
        .sort([("created_at", -1)])
        .limit(1)
    )
    docs = await cursor.to_list(length=1)
    if not docs:
        raise HTTPException(status_code=404, detail="not_found")
    prop = docs[0]
    details = await find_detail(db, prop["_id"]) or {}
    details = serialize_doc(details)
    # Tenants suggested for this user (criteria authors), like getTenantsByUser.
    from app.services import suggestion_service as suggestions_mod

    tenants = await suggestions_mod.get_tenants_by_user(db, user_id)
    details["tenants"] = [
        item["criteria"]["created_by"] for item in tenants if item.get("criteria")
    ]
    details["my_chosen_matches"] = await db[models.MATCH].count_documents(
        {"created_by": to_oid(user_id), "property": prop["_id"]}
    )
    return {"property": _serialize_property(prop, api_url), "details": details}


async def send_invitation(
    db: Any, *, prop_id: ObjectId, body: dict, user_id: str, frontend_url: str
) -> dict:
    asset = await require_raw(db, prop_id)
    invitation = {
        "first_name": body.get("first_name"),
        "last_name": body.get("last_name"),
        "email": body.get("email"),
        "phone": body.get("phone"),
        "title": body.get("title"),
        "invite_reason": body.get("invite_reason"),
        "invite_type": body.get("invite_type"),
        "accepted": False,
        "asset": asset["_id"],
        "created_by": to_oid(user_id),
        "created_at": datetime.now(UTC),
    }
    await db[models.INVITATION].insert_one(invitation)
    try:
        await EmailService.get_instance().send_mail(
            MailOptions(
                to=body.get("email", ""),
                subject="Invitation to the property",
                html=send_invitation_html(
                    f"{frontend_url}/properties/{asset['_id']}/view",
                    asset.get("name", ""),
                    body.get("first_name", ""),
                ),
            )
        )
    except (RuntimeError, OSError):
        pass
    return {"message": "invitation_send"}


async def get_viewers(
    db: Any, *, prop_id: ObjectId, page: int | None, page_size: int | None, api_url: str
) -> dict:
    views = await db[models.PROPERTY_VIEW].find({"property": prop_id}).to_list(length=None)
    docs = []
    for view in views:
        user = await db[models.USER].find_one({"_id": view.get("created_by")}, {"hash": 0})
        if not user:
            continue
        criteria = await db[models.CRITERIA].find_one({"created_by": user["_id"]})
        prop = await db[models.PROPERTY].find_one({"_id": prop_id})
        entry = serialize_doc(user)
        entry["criteria"] = serialize_doc(criteria) if criteria else None
        entry["property"] = _serialize_property(prop, api_url) if prop else None
        entry["match_similarity"] = calculate_similarity(criteria or {}, prop or {}) if prop else 0
        docs.append(entry)
    total = len(docs)
    if page and page_size:
        docs = docs[(page - 1) * page_size : page * page_size]
        return {
            "docs": docs,
            "limit": page_size,
            "page": page,
            "totalDocs": total,
            "totalPages": max((total + page_size - 1) // page_size, 1),
        }
    return {"docs": docs, "limit": 10, "page": 1, "totalDocs": total, "totalPages": 1}


async def find_published_example(
    db: Any, *, user_id: str | None = None, property_id: str | None = None
) -> list[dict]:
    """Port of findPublishedPropertiesExample (used by tenant suggestions)."""
    query: dict[str, Any] = {"status_string": {"$in": PUBLISHED_STATUSES}}
    if user_id:
        query["created_by"] = {"$eq": to_oid(user_id)}
    if property_id:
        query["_id"] = {"$eq": to_oid(property_id)}
    try:
        return await db[models.PROPERTY].find(query).to_list(length=None)
    except Exception:
        return []


# --- applications (asset-application.service.ts) ------------------------------


def _serialize_application(doc: dict) -> dict:
    return serialize_doc(doc)


async def get_applications(
    db: Any, *, prop_id: ObjectId, page: int | None, page_size: int | None
) -> dict:
    query = {"asset": {"$eq": prop_id}}
    total = await db[models.APPLICATION].count_documents(query)
    cursor = db[models.APPLICATION].find(query)
    docs = await (
        cursor.skip((page - 1) * page_size).limit(page_size).to_list(length=page_size)
        if page and page_size
        else cursor.to_list(length=None)
    )
    out = []
    for doc in docs:
        item = _serialize_application(doc)
        applicant = await db[models.USER].find_one(
            {"_id": to_oid(doc.get("applicant"))},
            {"first_name": 1, "last_name": 1},
        )
        item["applicant"] = serialize_doc(applicant) if applicant else doc.get("applicant")
        prop = await db[models.PROPERTY].find_one({"_id": to_oid(doc.get("asset"))})
        item["property"] = serialize_doc(prop) if prop else doc.get("asset")
        out.append(item)
    return paginate_response(out, total=total, page=page, limit=page_size)


async def get_one_application(db: Any, *, prop_id: ObjectId, user_id: str) -> dict | None:
    doc = await db[models.APPLICATION].find_one({"asset": prop_id, "applicant": to_oid(user_id)})
    if not doc:
        return None
    item = _serialize_application(doc)
    prop = await db[models.PROPERTY].find_one({"_id": to_oid(doc.get("asset"))}, {"asset_rent": 1})
    item["property"] = serialize_doc(prop) if prop else None
    return item


async def send_application(
    db: Any, *, prop_id: ObjectId, body: dict, user_id: str, username: str, frontend_url: str
) -> dict:
    asset = await require_raw(db, prop_id)
    doc = {
        **{
            k: v
            for k, v in body.items()
            if k not in ("agreed_terms", "will_have_pets", "applicant", "asset", "created_by")
        },
        "created_by": to_oid(user_id),
        "asset": asset["_id"],
        "agreed_terms": body.get("agreed_terms") == "Yes",
        "have_pets": body.get("will_have_pets") == "Yes",
        "applicant": to_oid(user_id),
        "application_status": "In Proccess",
        "created_at": datetime.now(UTC),
    }
    result = await db[models.APPLICATION].insert_one(doc)
    created = await db[models.APPLICATION].find_one({"_id": result.inserted_id})
    if created is None:
        raise HTTPException(status_code=500, detail="application_not_created")
    logged = await db[models.USER].find_one({"_id": to_oid(user_id)})
    if not logged:
        raise HTTPException(status_code=404, detail="user_not_found")
    try:
        await EmailService.get_instance().send_mail(
            MailOptions(
                to=logged.get("email", ""),
                subject="Your rent application has been received: " + str(asset.get("name")),
                html=send_application_html(
                    f"{frontend_url}/properties/{asset['_id']}",
                    str(asset.get("name", "")),
                    username or "",
                ),
            )
        )
    except (RuntimeError, OSError):
        pass
    return _serialize_application(created)


async def update_application(db: Any, *, prop_id: ObjectId, body: dict, user_id: str) -> dict:
    application = await db[models.APPLICATION].find_one(
        {"applicant": to_oid(user_id), "asset": prop_id}
    )
    if not application:
        raise HTTPException(status_code=404, detail="application_not_found")
    update: dict[str, Any] = {}
    if "documents" in body:
        update["documents"] = body["documents"]
    if body.get("payment"):
        update["application_status"] = "Completed"
        await db[models.PROPERTY].update_one(
            {"_id": to_oid(application.get("asset"))}, {"$set": {"status_string": "Completed"}}
        )
    if update:
        await db[models.APPLICATION].update_one({"_id": application["_id"]}, {"$set": update})
    updated = await db[models.APPLICATION].find_one({"_id": application["_id"]})
    if updated is None:
        raise HTTPException(status_code=500, detail="application_not_updated")
    return _serialize_application(updated)


async def approve_application(
    db: Any,
    *,
    route_id: ObjectId,
    body: dict,
    user_id: str,
    username: str,
    frontend_url: str,
) -> dict:
    # PARITY QUIRK: Node looks up the APPLICATION by req.params.id (the asset id in
    # the route), not by application id — replicated.
    application = await db[models.APPLICATION].find_one({"_id": route_id})
    if not application:
        raise HTTPException(status_code=404, detail="application_not_found")
    asset = await require_raw(db, application.get("asset"))
    update: dict[str, Any] = {}
    pre_content, approve_content = "", ""
    if "pre_approve_status" in body:
        update["pre_approve_status"] = bool(body["pre_approve_status"])
        update["approve_type"] = "Approval"
        pre_content = f"You have been added as a party member for: {asset.get('name')}"
        approve_content = ".."
    approver = await db[models.USER].find_one({"_id": to_oid(user_id)})
    if not approver:
        raise HTTPException(status_code=401, detail="unauthorized_user")
    if "approve_status" in body:
        update["approve_status"] = bool(body["approve_status"])
        pre_content = f"Your request to rent: {asset.get('name')} has been approved"
        approve_content = "more content..."
        await db[models.PROPERTY].update_one(
            {"_id": asset["_id"]},
            {"$set": {"status_string": helpers.get_current_status_for_post("Let Agreed")}},
        )
        applicant = await db[models.USER].find_one({"_id": to_oid(application.get("applicant"))})
        if applicant:
            await db[models.PROPERTY].update_one(
                {"_id": asset["_id"]},
                {
                    "$push": {
                        "buyers": {
                            "client": {
                                "id": applicant["_id"],
                                "first_name": applicant.get("first_name"),
                                "surname": applicant.get("last_name"),
                                "email": applicant.get("email"),
                                "phone": applicant.get("phone"),
                            }
                        }
                    }
                },
            )
    if "documents" in body:
        update["documents"] = body["documents"]
    if update:
        await db[models.APPLICATION].update_one({"_id": application["_id"]}, {"$set": update})
    # PARITY: Node emails the APPROVER (res.locals user), not the applicant.
    try:
        from app.services.templates import general_template_html

        await EmailService.get_instance().send_mail(
            MailOptions(
                to=approver.get("email", ""),
                subject="Invitation to the property",
                html=general_template_html(
                    f"{frontend_url}/properties/{asset['_id']}",
                    str(asset.get("name", "")),
                    username or "",
                    pre_content,
                    approve_content,
                ),
            )
        )
    except (RuntimeError, OSError):
        pass
    updated = await db[models.APPLICATION].find_one({"_id": application["_id"]})
    if updated is None:
        raise HTTPException(status_code=500, detail="application_not_updated")
    return _serialize_application(updated)

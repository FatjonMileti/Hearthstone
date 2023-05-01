"""Property helpers. Port of Property/helpers.ts.

get_property_score replicates the 7-check formula exactly (returns str like Node's
toFixed(0)). Link helpers need the absolute API URL (config.apiUrl in Node).
"""

import logging
from typing import Any

logger = logging.getLogger("hearthstone.property")

STATUS_MAP = {
    "For Let": "Live",
    "Let Agreed": "Sale Agreed",
    "Let": "Exchanged",
    "Archived": "Archived",
    "Completed": "Completed",
    "Draft": "Draft",
    "Pre Draft": "Pre Draft",
}


def get_current_status_for_post(status: str) -> Any:
    return STATUS_MAP.get(status)


def get_property_score(prop: dict) -> str:
    budget = prop.get("budget") or {}
    room = prop.get("room_details") or {}
    checks = [
        bool(prop.get("title")),
        bool(prop.get("property_images")),
        bool(prop.get("area_of_interest")),
        bool(budget.get("min_budget")) and bool(budget.get("max_budget")),
        bool(prop.get("property_type"))
        and bool(room.get("number_of_bedrooms"))
        and bool(room.get("number_of_bathrooms"))
        and bool(prop.get("floor_size"))
        and bool(prop.get("parking_spot"))
        and bool(prop.get("epc_rating")),
        bool(prop.get("description")),
        True,
    ]
    return str(round((100 / 7) * sum(1 for c in checks if c)))


def _link_for(img: dict, api_url: str) -> dict:
    link = img.get("link") or ""
    if not link.startswith("https://"):
        link = f"{api_url}/api/file/{img.get('key')}"
    return {**img, "link": link}


def generate_links_for_images(docs: list[dict], api_url: str) -> list[dict]:
    for item in docs:
        item["property_images"] = generate_links_for_one_asset(
            item.get("property_images") or [], api_url
        )
    return docs


def generate_links_for_one_asset(images: list[dict], api_url: str) -> list[dict]:
    return [_link_for(dict(img), api_url) for img in (images or [])]


def generate_links_for_matches_images(docs: list[dict]) -> list[dict]:
    """Port of match.helper generateLinksForMatchesImages: keeps ONLY {key, link}."""
    for item in docs:
        prop = item.get("property")
        if isinstance(prop, dict):
            prop["property_images"] = [
                {"key": img.get("key"), "link": img.get("link")}
                for img in (prop.get("property_images") or [])
            ]
    return docs


def handle_property_images(
    existing: list[dict], incoming: list[dict], api_url: str, delete_fn: Any = None
) -> list[dict]:
    """Port of handlePropertyImages. delete_fn(key) removes orphaned blobs (best-effort)."""
    old = [img for img in incoming if "isNew" not in img]
    if _identical(existing, old):
        return generate_links_for_one_asset(incoming, api_url)
    removed = [img for img in existing if not any(n.get("key") == img.get("key") for n in incoming)]
    if removed and delete_fn is not None:
        for img in removed:
            try:
                delete_fn(img.get("key"))
            except Exception as exc:
                logger.info("orphaned image delete failed: %s", exc)
    return generate_links_for_one_asset(incoming, api_url)


def _identical(a: list, b: list) -> bool:
    return len(a) == len(b) and all(x in b for x in a) and all(x in a for x in b)

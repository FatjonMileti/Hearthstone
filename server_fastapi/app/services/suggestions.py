"""Suggestions engine. Port of Suggestions/suggestion.service.ts.

calculate_similarity replicates the Node formula EXACTLY, including quirks:
- flat bathroom check compares against `.min` twice (upper bound uses min, not max).
- non-sqm property size converts the CRITERIA min (not the property size).
- `budget_for` values other than Week/Month score nothing; Week branch needs
  property budget INSIDE the converted range.
Only the two console.log debug lines are dropped.
"""

import math
from typing import Any

PUBLISHED_STATUSES = ["Let", "Live", "For Let", "For Sale"]


def to_square_meters(surface: float) -> float:
    return surface * 0.092903


def haversine_m(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    radius = 6371000.0
    phi1, phi2 = math.radians(lat1 or 0), math.radians(lat2 or 0)
    dphi = math.radians((lat2 or 0) - (lat1 or 0))
    dlambda = math.radians((lon2 or 0) - (lon1 or 0))
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
    return 2 * radius * math.asin(math.sqrt(a))


def calculate_similarity(criteria: dict, prop: dict) -> float:
    if not criteria or not prop:
        return 0.0
    comparisons = 16
    matching = 0

    # Area of interest (+5, not +1 — Node weights it 5x)
    if criteria.get("area_of_interest") == prop.get("area_of_interest"):
        matching += 5

    # Radius: criteria radius (miles -> km) must cover haversine distance.
    c_addr = criteria.get("asset_address") or {}
    p_addr = prop.get("asset_address") or {}
    try:
        distance_km = (
            haversine_m(
                float(c_addr.get("latitude") or 0),
                float(c_addr.get("longitude") or 0),
                float(p_addr.get("latitude") or 0),
                float(p_addr.get("longitude") or 0),
            )
            / 1000
        )
    except (TypeError, ValueError):
        distance_km = float("inf")
    try:
        radius_km = float(criteria.get("radius") or 0) * 1.60934
    except (TypeError, ValueError):
        radius_km = 0
    if radius_km >= distance_km:
        matching += 5

    # Property type
    if (criteria.get("property_type") or []) and prop.get("property_type") in (
        criteria.get("property_type") or []
    ):
        matching += 1

    # Budget
    budget = criteria.get("budget") or {}
    min_b, max_b = budget.get("min"), budget.get("max")
    p_budget = prop.get("budget") or {}
    if criteria.get("budget_for") == "Week" and min_b is not None and max_b is not None:
        factor = 4.34524
        if (p_budget.get("min_budget") or 0) >= min_b * factor and (
            p_budget.get("max_budget") or 0
        ) <= max_b * factor:
            matching += 1
    elif criteria.get("budget_for") == "Month" and min_b is not None and max_b is not None:
        if (p_budget.get("min_budget") or 0) >= min_b and (
            p_budget.get("max_budget") or 0
        ) <= max_b:
            matching += 1

    # House specifics
    if prop.get("property_type") == "House":
        comparisons += 4
        house = criteria.get("house_details") or {}
        room = prop.get("room_details") or {}
        bedrooms = house.get("number_of_bedrooms") or {}
        bathrooms = house.get("number_of_bathrooms") or {}
        if (
            bedrooms
            and (room.get("number_of_bedrooms") or 0) >= (bedrooms.get("min") or 0)
            and (room.get("number_of_bedrooms") or 0) <= (bedrooms.get("max") or float("inf"))
        ):
            matching += 1
        if (
            bathrooms
            and (room.get("number_of_bathrooms") or 0) >= (bathrooms.get("min") or 0)
            and (room.get("number_of_bathrooms") or 0) <= (bathrooms.get("max") or float("inf"))
        ):
            matching += 1
        if house.get("parking") and (prop.get("parking_spot") or 0) > 0:
            matching += 1
            if prop.get("parking_details") and house.get("parking") == prop.get("parking_details"):
                matching += 1
            if prop.get("parking_details") and house.get("parking") == "All":
                matching += 1
        if house.get("preferred_size"):
            size = _size_in_sqm(
                prop.get("floor_size"),
                prop.get("floor_size_unit"),
                house["preferred_size"],
                criteria_side_default=house["preferred_size"],
            )
            if size is not None:
                prop_sqm, min_sqm, max_sqm = size
                if min_sqm <= prop_sqm <= max_sqm:
                    matching += 1

    # Flat specifics
    if prop.get("property_type") == "Flats":
        comparisons += 9
        flat = criteria.get("flat_details") or {}
        room = prop.get("room_details") or {}
        f_bed = flat.get("number_of_bedrooms") or {}
        f_bath = flat.get("number_of_bathrooms") or {}
        if (room.get("number_of_bedrooms") or 0) >= (f_bed.get("min") or 0) and (
            room.get("number_of_bedrooms") or 0
        ) <= (f_bed.get("max") or float("inf")):
            matching += 1
        # PARITY QUIRK: upper bound uses .min (not .max) — replicated from Node line 508.
        bath_min = f_bath.get("min")
        bath_upper: float = float(bath_min) if bath_min is not None else float("inf")
        if (room.get("number_of_bathrooms") or 0) >= (bath_min or 0) and (
            room.get("number_of_bathrooms") or 0
        ) <= bath_upper:
            matching += 1
        if flat.get("preferred_size"):
            size = _size_in_sqm(
                prop.get("floor_size"),
                prop.get("floor_size_unit"),
                flat["preferred_size"],
                criteria_side_default=flat["preferred_size"],
            )
            if size is not None:
                prop_sqm, min_sqm, max_sqm = size
                if min_sqm <= prop_sqm <= max_sqm:
                    matching += 1
        p_flat = prop.get("flat_details") or {}
        if flat.get("preferred_floor") and p_flat.get("floor"):
            if flat["preferred_floor"] == p_flat["floor"]:
                matching += 1
        if flat.get("property_purpose") and p_flat.get("property_purpose"):
            if flat["property_purpose"] == p_flat["property_purpose"]:
                matching += 1
        if p_flat.get("property_purpose") == "Purpose built":
            if isinstance(flat.get("lift"), bool) and flat["lift"] == p_flat.get("lift"):
                matching += 1
            if isinstance(flat.get("security"), bool) and flat["security"] == p_flat.get(
                "security"
            ):
                matching += 1
            if flat.get("parking_space") and (prop.get("parking_spot") or 0) > 0:
                matching += 1
            if flat.get("gym_spa") and prop.get("flat_details"):
                matching += 1

    # Furniture
    c_feat = criteria.get("specific_property_features") or []
    p_feat = prop.get("specific_property_features") or []
    for value in ("Unfurnished", "Partially furnished", "Fully furnished"):
        if value in c_feat and value in p_feat:
            matching += 1
            break

    # Distances (underground / schools / gym / high street)
    for key in (
        "distance_from_underground",
        "distance_from_schools",
        "distance_from_gym",
        "distance_from_high_street",
    ):
        c_dist = criteria.get(key) or {}
        p_dist = prop.get(key) or {}
        c_val = (c_dist.get("value") or {}) if isinstance(c_dist.get("value"), dict) else None
        p_val = p_dist.get("value") if isinstance(p_dist.get("value"), (int, float)) else None
        if c_val is not None and p_val is not None:
            limit = c_val.get("max", 0)
            if c_dist.get("unit") == "mi":
                limit = (limit or 0) * 1.6
            if p_val <= (limit or 0):
                matching += 1

    return (matching / comparisons) * 100


def _size_in_sqm(
    prop_size: Any, prop_unit: Any, criteria_size: dict, criteria_side_default: dict
) -> tuple[float, float, float] | None:
    """Returns (property_sqm, min_sqm, max_sqm).

    PARITY QUIRK: when the property is not in sqm, Node converts the CRITERIA min
    instead of the property size — replicated.
    """
    try:
        if prop_unit == "sq.m":
            prop_sqm = float(prop_size)
        else:
            prop_sqm = to_square_meters(float(criteria_side_default["size"]["min"]))
        inner = criteria_size.get("size") or {}
        if criteria_size.get("unit") == "sq.m":
            min_sqm, max_sqm = float(inner["min"]), float(inner["max"])
        else:
            min_sqm = to_square_meters(float(inner["min"]))
            max_sqm = to_square_meters(float(inner["max"]))
        return prop_sqm, min_sqm, max_sqm
    except (TypeError, ValueError, KeyError):
        return None

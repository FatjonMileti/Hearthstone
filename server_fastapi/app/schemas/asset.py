"""Asset validation models. Port of Property/property.validation.ts.

Full schema requires: asset_address{latitude, longitude in range}, status_string,
transaction_type_string, floor_size, budget{min_budget, max_budget}, epc_rating.
Draft schema allows everything (all optional). Extra fields pass through
(extra="allow") since assets/criteria are free-form dicts in Node.
"""

from pydantic import BaseModel, ConfigDict, Field


class _Lenient(BaseModel):
    model_config = ConfigDict(extra="allow")


class AssetAddressFull(BaseModel):
    model_config = ConfigDict(extra="allow")
    latitude: float = Field(ge=-90, le=90)
    longitude: float = Field(ge=-180, le=180)


class BudgetFull(BaseModel):
    model_config = ConfigDict(extra="allow")
    min_budget: float = Field(ge=0)
    max_budget: float = Field(ge=0)


class AssetCreateFull(_Lenient):
    asset_address: AssetAddressFull
    status_string: str
    transaction_type_string: str
    floor_size: float
    budget: BudgetFull
    epc_rating: str


class AssetDraft(_Lenient):
    pass


import pytest

from app.core.permissions import Action, can, can_on_object, pack_rules, rules_for


def test_agent_manages_all() -> None:
    assert can("agent-id", "Agent", Action.delete, "Property")
    assert can("agent-id", "Agent", Action.read, "Matches")
    assert rules_for("agent-id", "Agent") == [["manage", "all"]]


def test_tenant_matrix() -> None:
    me = "tenant-id"
    assert can_on_object(me, "Tenant", Action.manage, "User", me)
    assert not can_on_object(me, "Tenant", Action.manage, "User", "someone-else")
    assert can(me, "Tenant", Action.manage, "Chat")
    assert can(me, "Tenant", Action.manage, "Criteria")
    assert can(me, "Tenant", Action.read, "Matches")
    assert can(me, "Tenant", Action.read, "SignGenerator")
    # cannot approve file.approved, but can manage documents otherwise
    assert can(me, "Tenant", Action.manage, "Documents")
    assert not can_on_object(me, "Tenant", Action.update, "Documents", None, field="file.approved")


def test_landlord_matrix() -> None:
    me = "landlord-id"
    assert can(me, "Landlord", Action.manage, "Property")
    assert can(me, "Landlord", Action.manage, "SignGenerator")
    assert can(me, "Landlord", Action.read, "Matches")
    assert can_on_object(me, "Landlord", Action.update, "Documents", None, field="file.approved")
    assert not can(me, "Landlord", Action.manage, "Chat")


def test_newuser_matrix() -> None:
    me = "new-id"
    assert can(me, "NewUser", Action.manage, "Criteria")
    assert can_on_object(me, "NewUser", Action.manage, "User", me)
    assert not can(me, "NewUser", Action.read, "Matches")


def test_pack_rules_shape() -> None:
    packed = rules_for("x", "Tenant")
    assert ["read", "Matches"] in packed
    assert any(p[0] == "update" and p[1] == "Documents" for p in packed)
    assert pack_rules([]) == []


@pytest.mark.parametrize(
    ("role", "allowed"),
    [
        ("Agent", True),
        ("Tenant", False),
        ("Landlord", False),
        ("NewUser", False),
    ],
)
def test_only_agent_deletes_any_user(role: str, allowed: bool) -> None:
    assert can_on_object("me", role, Action.delete, "User", "other") is allowed

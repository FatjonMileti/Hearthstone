"""
Matrix (identical to Node defineAbilitiesFor):
- Agent: manage all
- Tenant (=Client in Node Role enum): manage own User + Chat + Client + Criteria +
  Documents (EXCEPT cannot Update Documents:file.approved); read SignGenerator,
  SignURL, Matches
- Landlord: manage own User + Property + SignGenerator; read SignURL, Matches;
  may Update Documents:file.approved
- NewUser: manage own User + Criteria; cannot read Matches

`pack_rules()` returns the same JSON shape as `@casl/ability/extra packRules`
(a list of [action, subject, ...] tuples) so login/me/refresh payloads match Node.
"""

from dataclasses import dataclass
from enum import StrEnum

from fastapi import HTTPException


class Role(StrEnum):
    Agent = "Agent"
    Tenant = "Tenant"  # Node: Role.Client = 'Tenant'
    Landlord = "Landlord"
    NewUser = "NewUser"


class Action(StrEnum):
    manage = "manage"
    create = "create"
    read = "read"
    update = "update"
    delete = "delete"


Subject = str  # 'User' | 'Property' | 'Chat' | 'all' | 'Agent' | 'Client' |
# 'SignGenerator' | 'SignURL' | 'Criteria' | 'Matches' | 'Documents'

ALL = "all"


@dataclass(frozen=True)
class Rule:
    action: Action
    subject: Subject
    conditions: dict | None = None  # e.g. {"_id": user_id} for own-User scoping
    fields: str | None = None  # e.g. "file.approved"
    inverted: bool = False  # `cannot` rule


def define_rules(user_id: str, role: str) -> list[Rule]:
    if role == Role.Agent:
        return [Rule(Action.manage, ALL)]
    if role == Role.Tenant:  # Node branch: Role.Client
        return [
            Rule(Action.manage, "User", {"_id": user_id}),
            Rule(Action.manage, "Chat"),
            Rule(Action.manage, "Client"),
            Rule(Action.read, "SignGenerator"),
            Rule(Action.read, "SignURL"),
            Rule(Action.manage, "Criteria"),
            Rule(Action.read, "Matches"),
            Rule(Action.manage, "Documents"),
            Rule(Action.update, "Documents", None, "file.approved", inverted=True),
        ]
    if role == Role.Landlord:
        return [
            Rule(Action.manage, "User", {"_id": user_id}),
            Rule(Action.manage, "Property"),
            Rule(Action.manage, "SignGenerator"),
            Rule(Action.read, "SignURL"),
            Rule(Action.read, "Matches"),
            Rule(Action.update, "Documents", None, "file.approved"),
        ]
    if role == Role.NewUser:
        return [
            Rule(Action.manage, "User", {"_id": user_id}),
            Rule(Action.manage, "Criteria"),
            Rule(Action.read, "Matches", inverted=True),
        ]
    return []


def pack_rules(rules: list[Rule]) -> list[list]:
    """Same shape as @casl/ability packRules: [action, subject, ...]."""
    packed: list[list] = []
    for r in rules:
        entry: list = [r.action.value, r.subject]
        if r.conditions is not None:
            entry.append(r.conditions)
        if r.fields is not None:
            entry.append(r.fields)
        if r.inverted:
            entry.append({"inverted": True})
        packed.append(entry)
    return packed


def rules_for(user_id: str, role: str) -> list[list]:
    return pack_rules(define_rules(user_id, role))


def _matches(rule: Rule, action: Action, subject: Subject, obj_id: str | None) -> bool:
    if rule.subject != ALL and rule.subject != subject:
        return False
    if rule.action != Action.manage and rule.action != action:
        return False
    if rule.conditions:
        cond_id = rule.conditions.get("_id")
        if cond_id is not None and cond_id != obj_id:
            return False
    return True


def can(user_id: str, role: str, action: Action, subject: Subject) -> bool:
    """Port of ability.can(action, subject) incl. `cannot` overrides."""
    return can_on_object(user_id, role, action, subject, None)


def can_on_object(
    user_id: str,
    role: str,
    action: Action,
    subject: Subject,
    obj_id: str | None,
    field: str | None = None,
) -> bool:
    allowed = False
    for rule in define_rules(user_id, role):
        if rule.fields is not None and rule.fields != field:
            continue
        if rule.fields is not None and field is None:
            # field-scoped rule only applies when checking that field
            continue
        if _matches(rule, action, subject, obj_id):
            if rule.inverted:
                return False
            allowed = True
    # Field-level `cannot Update Documents file.approved` must also block
    # generic Document updates that touch that field.
    if field == "file.approved":
        for rule in define_rules(user_id, role):
            if (
                rule.inverted
                and rule.action == Action.update
                and rule.subject == "Documents"
                and rule.fields == "file.approved"
            ):
                return False
    return allowed


def check_update_user_permission(
    logged_user_id: str, logged_role: str, target_user_id: str
) -> None:
    """Port of checkUpdateUserPermission: self-or-Agent may Update User:<id>."""
    if not can_on_object(logged_user_id, logged_role, Action.update, "User", target_user_id):
        raise HTTPException(
            status_code=403,
            detail="Unauthorized: You dont have permission to update this user",
        )

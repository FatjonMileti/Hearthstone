"""Collection names — must match Mongoose model names in server_node exactly.

Central registry so routers/services never hardcode a collection string.
Attribute/Condition are listed but intentionally unmounted (see PORTING_NOTES).
"""

USER = "user"
PROPERTY = "property"
PROPERTY_DETAIL = "property-detail"
PROPERTY_VIEW = "property-view"
CRITERIA = "criteria"
MATCH = "match"
ROOM = "room"
MESSAGE = "message"
NOTIFICATION = "notification"
OFFER = "offer"
DOCUMENT = "document"
ENVELOPE = "envelope"
FILE = "file"
LOGIN_LOG = "login.log"
USER_LOG = "user.log"
MATCH_LOG = "match.log"
PROPERTY_LOG = "property.log"
REVOKED_TOKEN = "revoked.token"
USED_REFRESH_TOKEN = "used.refresh.token"
DOCUSIGN_TOKEN = "docusign.token"
APPLICATION = "application"
INVITATION = "invitation"
ATTRIBUTE = "attribute"  # dead in Node (unmounted) — do not expose via API
CONDITION = "condition"  # dead in Node (unmounted) — do not expose via API

ALL_COLLECTIONS: tuple[str, ...] = (
    USER,
    PROPERTY,
    PROPERTY_DETAIL,
    PROPERTY_VIEW,
    CRITERIA,
    MATCH,
    ROOM,
    MESSAGE,
    NOTIFICATION,
    OFFER,
    DOCUMENT,
    ENVELOPE,
    FILE,
    LOGIN_LOG,
    USER_LOG,
    MATCH_LOG,
    PROPERTY_LOG,
    REVOKED_TOKEN,
    USED_REFRESH_TOKEN,
    DOCUSIGN_TOKEN,
    APPLICATION,
    INVITATION,
    ATTRIBUTE,
    CONDITION,
)

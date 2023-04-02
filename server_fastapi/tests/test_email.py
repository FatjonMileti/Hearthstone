"""Phase 1 Task 07: template link contracts + render snapshots."""

from app.core.config import Settings
from app.services.templates import (
    reset_password_html,
    reset_password_link,
    send_application_html,
    send_invitation_html,
    verify_email_html,
    verify_link,
)


def _settings() -> Settings:
    return Settings(_env_file=None, FRONTEND_URL="http://localhost:4000")  # type: ignore[call-arg]


def test_verify_link_contract() -> None:
    link = verify_link(_settings(), "tok-123")
    assert link == "http://localhost:4000/activate-account/tok-123"
    html = verify_email_html(link)
    assert link in html and "Confirm your account" in html


def test_reset_link_contract() -> None:
    link = reset_password_link(_settings(), "tok-abc")
    assert link == "http://localhost:4000?resetPasswordToken=tok-abc"
    html = reset_password_html(link, "Ada")
    assert link in html and "Ada" in html


def test_application_and_invitation_templates() -> None:
    app_html = send_application_html("http://x/asset/1", "Sunny Flat", "Bob")
    assert "Sunny Flat" in app_html and "Bob" in app_html and "http://x/asset/1" in app_html
    inv_html = send_invitation_html("http://x/asset/2", "Cozy House", "Cara")
    assert "Cozy House" in inv_html and "Cara" in inv_html and "View Property" in inv_html

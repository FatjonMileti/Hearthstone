import time

from app.core.security import (
    create_access_token,
    decode_access_token,
    decode_refresh_token,
    generate_token_pair,
    hash_password,
    is_password_strong,
    verify_password,
)


def test_password_round_trip_and_cost() -> None:
    hashed = hash_password("Hearthstone1234!")
    assert verify_password("Hearthstone1234!", hashed)
    assert not verify_password("wrong-pass", hashed)
    # bcrypt cost 12 like Node user.helpers hashPassword
    assert hashed.startswith("$2b$12$")


def test_password_strength_messages_match_node() -> None:
    assert is_password_strong("lowercase1!") == (False, "should_have_uppercase")
    assert is_password_strong("NoNumber!") == (False, "should_have_number")
    assert is_password_strong("NoSymbol1") == (False, "should_have_symbol")
    assert is_password_strong("Aa1!aaa") == (False, "password_length_less_than_eight")
    assert is_password_strong("Hearthstone1234!") == (True, "")


def test_token_pair_shape_and_claims() -> None:
    pair = generate_token_pair(
        user_id="abc123",
        first_name="Ada",
        role="Landlord",
        jwt_secret="s",
        refresh_secret="r",
        jwt_expire_seconds=7200,
        refresh_expire_seconds=172800,
        rules=[["manage", "all"]],
    )
    assert pair["token_type"] == "bearer"
    assert pair["expires_in"] == "7200"  # Node sends env string
    assert pair["refresh_expires_in"] == "172800"
    assert pair["rules"] == [["manage", "all"]]
    claims = decode_access_token(pair["access_token"], "s")
    assert claims is not None
    assert claims["iss"] == "lost.fish"
    assert claims["aud"] == "lost.fish:api"
    assert claims["user_id"] == "abc123"
    assert claims["role"] == "Landlord"
    rclaims = decode_refresh_token(pair["refresh_token"], "r")
    assert rclaims is not None and rclaims["aud"] == "lost.fish:token"


def test_wrong_aud_and_expiry_rejected() -> None:
    access = create_access_token(
        user_id="u", first_name="A", role="Agent", secret="s", expires_in_seconds=7200
    )
    assert decode_access_token(access, "wrong-secret") is None
    # cross-audience: access token must not verify as refresh
    assert decode_refresh_token(access, "s") is None
    expired = create_access_token(
        user_id="u", first_name="A", role="Agent", secret="s", expires_in_seconds=-1
    )
    time.sleep(0.01)
    assert decode_access_token(expired, "s") is None

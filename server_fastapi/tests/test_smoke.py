from httpx import AsyncClient


async def test_index_returns_title(client: AsyncClient) -> None:
    res = await client.get("/")
    assert res.status_code == 200
    assert res.json() == {"title": "Hearthstone Api"}


async def test_health_ok(client: AsyncClient) -> None:
    res = await client.get("/health")
    assert res.status_code == 200
    assert res.json() == {"status": "ok"}


async def test_unknown_route_json_404(client: AsyncClient) -> None:
    res = await client.get("/no-such-route-xyz")
    assert res.status_code == 404
    assert res.json() == {"message": "Not Found"}


async def test_security_headers_present(client: AsyncClient) -> None:
    res = await client.get("/health")
    assert res.headers["X-Content-Type-Options"] == "nosniff"
    assert res.headers["X-Frame-Options"] == "SAMEORIGIN"
    # No CSP in Node helmet subset -> no CSP here either.
    assert "content-security-policy" not in {k.lower(): v for k, v in res.headers.items()}


async def test_cors_open(client: AsyncClient) -> None:
    res = await client.options(
        "/health", headers={"Origin": "http://example.com", "Access-Control-Request-Method": "GET"}
    )
    assert res.headers.get("access-control-allow-origin") == "*"

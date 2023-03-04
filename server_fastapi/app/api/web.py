"""Web (non-API) routes. Port of server_node/src/routes/index.ts.

Node renders hbs views (index.hbs / form.hbs). FastAPI port returns JSON stubs
until Task 22 adds Jinja2 templates + signed-cookie session + CSRF for /form.
"""

from fastapi import APIRouter

web_router = APIRouter(tags=["web"])


@web_router.get("/", include_in_schema=False)
async def index() -> dict[str, str]:
    return {"title": "Hearthstone Api"}

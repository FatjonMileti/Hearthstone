"""Web (non-API) routes. Port of server_node/src/routes/index.ts + views/*.hbs.

GET / keeps the JSON title stub. /form renders the color form with a signed
CSRF token (itsdangerous, session-secret) and persists the color in a signed
cookie — the signed-cookie stand-in for express-session+Mongo, which Node used
only for this demo.
"""

import html

from fastapi import APIRouter, Form, Request
from fastapi.responses import HTMLResponse, JSONResponse
from itsdangerous import BadSignature, URLSafeSerializer

web_router = APIRouter(tags=["web"])


def _signer(request: Request) -> URLSafeSerializer:
    from app.core.config import get_settings

    return URLSafeSerializer(get_settings().session_secret, salt="Hearthstone-form")


def _form_html(color: str, csrf_token: str) -> str:
    return f"""<html lang='en'>
    <head><meta charset='UTF-8' /><title>Sample form</title></head>
    <body>
        <form action='/form' method='POST'>
            Current favorite color:
            {html.escape(color)}
            <br />
            <input type='hidden' name='_csrf' value='{html.escape(csrf_token)}' />
            Favorite color:
            <input type='text' name='favoriteColor' />
            <button type='submit'>Submit</button>
        </form>
    </body>
</html>"""


@web_router.get("/", include_in_schema=False)
async def index() -> JSONResponse:
    return JSONResponse({"title": "Hearthstone Api"})


@web_router.get("/form", include_in_schema=False)
async def get_form(request: Request) -> HTMLResponse:
    color = ""
    raw = request.cookies.get("fsdlm_color")
    if raw:
        try:
            color = str(_signer(request).loads(raw))
        except BadSignature:
            color = ""
    return HTMLResponse(_form_html(color, _signer(request).dumps("form")))


@web_router.post("/form", include_in_schema=False)
async def post_form(
    request: Request, favoriteColor: str = Form(""), csrf: str = Form("", alias="_csrf")
) -> HTMLResponse:
    try:
        if _signer(request).loads(csrf) != "form":
            return HTMLResponse("invalid csrf", status_code=403)
    except BadSignature:
        return HTMLResponse("invalid csrf", status_code=403)
    response = HTMLResponse(_form_html(favoriteColor, _signer(request).dumps("form")))
    response.set_cookie(
        "fsdlm_color", _signer(request).dumps(favoriteColor), httponly=True, samesite="lax"
    )
    return response

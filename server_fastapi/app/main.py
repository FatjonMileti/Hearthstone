"""App factory. Port of server_node/src/app.ts middleware order + error handling.

Node order replicated (adapted to FastAPI):
1. gzip (compression) -> 2. CORS open * -> 3. security headers (helmet subset, no CSP)
4. access log w/ body masking -> 5. sessions stub (API is stateless JWT; cookie only for /form demo)
6. routers (/ + /api) -> 7. JSON 404 -> 8. JSON error handler {message, stack?}.
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.api.v1.router import api_router
from app.api.web import web_router
from app.core.config import get_settings
from app.core.db import close_db, connect_db, get_database
from app.core.logging_setup import access_log_middleware, configure_file_logging
from app.services.email_service import EmailService


async def _http_exception_handler(request: Request, exc: StarletteHTTPException) -> JSONResponse:
    settings = get_settings()
    payload: dict[str, str | None] = {"message": str(exc.detail)}
    if settings.stage not in ("stage", "production"):
        payload["stack"] = None
    return JSONResponse(status_code=exc.status_code, content=payload)


async def _unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    settings = get_settings()
    payload: dict[str, str | None] = {"message": "Internal Server Error"}
    if settings.stage not in ("stage", "production"):
        payload["stack"] = repr(exc)
    return JSONResponse(status_code=500, content=payload)


async def _validation_exception_handler(
    request: Request, exc: RequestValidationError
) -> JSONResponse:
    # PARITY: Node Joi validator returns 400, not FastAPI's default 422.
    return JSONResponse(status_code=400, content={"message": "validation_error"})


async def _not_found_handler(request: Request, exc: Exception) -> JSONResponse:
    return JSONResponse(status_code=404, content={"message": "Not Found"})


def create_app() -> FastAPI:
    settings = get_settings()

    @asynccontextmanager
    async def lifespan(app: FastAPI):  # type: ignore[no-untyped-def]
        if settings.stage != "test":
            await connect_db(settings.db_connection_string)
            app.state.db = get_database(settings.mongo_db_name)
        EmailService.get_instance().configure(settings)
        # Port of app.ts MailService init: Ethereal in dev, SMTP in stage/prod.
        if settings.stage == "development":
            await EmailService.get_instance().create_local_connection()
        elif settings.stage in ("stage", "production"):
            EmailService.get_instance().create_connection()
        configure_file_logging("logs")
        yield
        await close_db()

    app = FastAPI(
        title="Hearthstone API (FastAPI port)",
        version="0.0.1",
        docs_url="/docs",
        lifespan=lifespan,
    )

    # 1. gzip ~ compression()
    app.add_middleware(GZipMiddleware, minimum_size=1000)
    # 2. CORS open (Node: cors() with no options)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=False,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # 3. helmet-subset security headers (Node lists dnsPrefetch/expectCt/frameguard/
    #    hidePoweredBy/hsts/ieNoOpen/noSniff/crossDomainPolicies/referrerPolicy/xssFilter; no CSP)
    @app.middleware("http")
    async def security_headers(request: Request, call_next):  # type: ignore[no-untyped-def]
        response = await call_next(request)
        response.headers.setdefault("X-DNS-Prefetch-Control", "off")
        response.headers.setdefault("X-Frame-Options", "SAMEORIGIN")
        response.headers.setdefault("X-Content-Type-Options", "nosniff")
        response.headers.setdefault("X-Download-Options", "noopen")
        response.headers.setdefault("X-XSS-Protection", "0")
        response.headers.setdefault("Referrer-Policy", "no-referrer")
        if settings.stage in ("stage", "production"):
            response.headers.setdefault(
                "Strict-Transport-Security", "max-age=15552000; includeSubDomains"
            )
        return response

    # 4. access log (masks /login and /register bodies like app.log.ts)
    @app.middleware("http")
    async def access_log(request: Request, call_next):  # type: ignore[no-untyped-def]
        return await access_log_middleware(request, call_next)

    # 6. routers
    app.include_router(web_router)  # GET / (+ /form in Task 22)
    app.include_router(api_router, prefix="/api")

    # 7/8. error handlers
    app.add_exception_handler(StarletteHTTPException, _http_exception_handler)  # type: ignore[arg-type]
    app.add_exception_handler(Exception, _unhandled_exception_handler)
    app.add_exception_handler(RequestValidationError, _validation_exception_handler)  # type: ignore[arg-type]
    app.add_exception_handler(404, _not_found_handler)  # type: ignore[arg-type]

    @app.get("/health", include_in_schema=False)
    async def health() -> dict[str, str]:
        return {"status": "ok"}

    return app


app = create_app()

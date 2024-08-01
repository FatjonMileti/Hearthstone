# Hearthstone API — FastAPI port

Python + FastAPI port of `../server_node` (Express + Mongoose). Same MongoDB data,
same REST + Socket.IO contract so `../client` works unchanged.

Task plan: `TODO.md` · agent rules: `AGENTS.md` · porting decisions: `PORTING_NOTES.md`.

## Run (dev)

```bash
cp .env.example .env   # fill secrets (JWT/refresh/session, DB, mail, maps, docusign)
pip install -e ".[dev]"
uvicorn app.main:app --reload --port 3000
# REST + Swagger: http://localhost:3000/ http://localhost:3000/docs
# With websockets (prod-like): uvicorn app.main:socket_app --port 3000
```

Needs MongoDB (`DB_CONNECTION_STRING`) — or `docker compose up` for api + mongo + redis.
`GET /health` is the container healthcheck.

## Test / lint / types

```bash
pytest -q
ruff check . && ruff format --check . && mypy .
```

Tests use mongomock-motor (no live DB needed). The client-contract parity suite lives in
`tests/parity/test_client_contract.py`.

## Seed / CLI

```bash
python -m app.seed --users 10 --properties 10 --criteria 5
python -m app.cli --email boss@example.com --first-name Boss --last-name Agent
# (prompts for anything omitted; creates an enabled Agent user)
```

## Env highlights

| Key | Purpose |
|---|---|
| `DB_CONNECTION_STRING` / `DB_DATABASE` | Mongo (name falls back to URI path) |
| `JWT_SECRET` / `REFRESH_SECRET` (+ `*_EXPIRE_SECONDS`) | HS256 tokens, `iss=lost.fish`, compat with Node-issued JWTs |
| `HEARTHSTONE_API_ACCESS_TOKEN` | static `token` header guarding `GET /api/v1/*` |
| `USE_AZURE_BLOB_BUCKET` (legacy typo `USE_AZURE_BLOB_BACKET` accepted) / `USE_S3_BUCKET` | storage backend: Azure → S3 → local `uploads/` |
| `GOOGLE_MAP_KEY` | enrichment + `/api/map/*` (skipped when empty) |
| `TWITTER_AUTH_CLIENT_ID/SECRET`, `DS_*` + `certs/docusign/private.key`, `IMAGE_GENERATOR_KEY` | Twitter OAuth, DocuSign JWT grant, DiffusionMaster images |

## Docker

```bash
docker compose up   # api + mongo + redis; mounts uploads/, logs/
```

## Notes

- Validation errors return **400** (Node/Joi parity), not 422.
- Rate limiting is wired (SlowAPI) but **disabled** by default — Node's limiter is a no-op.
- `Attribute`/`Condition` routers were never mounted in Node and are not ported (404).
- No workers/cron exist in Node (verified) — none here either.

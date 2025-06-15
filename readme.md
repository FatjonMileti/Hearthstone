# Hearthstone

Rental marketplace matching tenants with landlords (plus agents and onboarding users): landlords publish properties, tenants define search criteria, a similarity engine scores matches, and both sides negotiate over realtime chat with document exchange, offers and DocuSign e-signing.

## Repository layout

| Path | Description |
| --- | --- |
| `client_nextjs/` | Web client — Next.js 14 (App Router), TypeScript, MUI, zustand, socket.io-client |
| `server_fastapi/` | API — FastAPI, MongoDB, Socket.IO realtime, DocuSign, email |
| `tools/` | Deploy script (`deploy-script.sh`) |

The legacy Vite/react-router client (`client_react`) and the legacy Node server (`server_node`) have been replaced by `client_nextjs` and `server_fastapi` (port history is in each package's `PORTING_NOTES.md`).

## Development

Run backend (from `server_fastapi/`):

```bash
cp .env.example .env      # fill secrets (JWT, DB, mail, maps, docusign)
pip install -e ".[dev]"
uvicorn app.main:app --reload --port 3000        # or --port 3001 to match client default
# Swagger: http://localhost:3000/docs
```

Run frontend (from `client_nextjs/`):

```bash
cp .env.local.example .env.local
npm install
npm run dev               # http://localhost:3000
```

`docker compose up` in `server_fastapi/` starts api + mongo + redis.

## Quality gates

```bash
# client
cd client_nextjs && npm run lint && npm run type-check && npm run test && npm run build

# server
cd server_fastapi && pytest -q && ruff check . && mypy .
```

## Docs

- API reference, data model, request flows: `server_fastapi/README.md`
- Client architecture, route mapping, env mapping: `client_nextjs/README.md`, `client_nextjs/PORTING_NOTES.md`, `client_nextjs/TODO.md`

# Hearthstone API — FastAPI port

Python + FastAPI port of `../server_node` (Express + Mongoose). Same MongoDB data,
same REST contract so `../client` works unchanged.

## Run (dev)

```bash
cp .env.example .env   # fill secrets
pip install -e ".[dev]"
uvicorn app.main:app --reload --port 3000
# docs: http://localhost:3000/docs
```

## Test / lint / types

```bash
pytest -q
ruff check . && ruff format --check . && mypy .
```

## Seed / CLI (land in Phase 2 Task 12)

```bash
python -m app.seed --users 10 --properties 10 --criteria 5
python -m app.cli create-agent
```

## Docker

```bash
docker compose up   # api + mongo + redis
```

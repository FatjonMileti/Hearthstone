# Hearthstone API

## 1. What this project is

Hearthstone is a rental marketplace that matches **tenants** with
**landlords** (plus **agents** who administrate and **new users** onboarding):

- Landlords publish **properties/assets** (with photos, rent, rooms, features).
- Tenants fill in **search criteria** (area, budget, property type, distances, features).
- A **similarity engine** scores every property against every criteria set (match %).
- Both sides **like / dislike** each other (`matches`); mutual likes become chats.
- **Chat rooms** (REST + Socket.IO realtime) carry the negotiation, including
  **document exchange** (tenant ↔ landlord files + approvals), **rental offers**
  (price/warranty/duration → accept/cancel/refuse) and **DocuSign e-signing**
  (rent contracts, transaction agreements).
- **Notifications** fan out to chat participants; **email** covers verification,
  password recovery, applications and invitations.
- An **admin log explorer**, a static-token **partner feed** (`/api/v1/*`), a
  **maps proxy** and **image generation** round out the API.

## 2. Architecture

```
server_fastapi/
  app/
    main.py            # app factory: gzip → CORS(*) → security headers → access log
                       # → routers → JSON {message, stack?} errors; socket_app export
    realtime.py        # Socket.IO server (JWT handshake, users registry, 3 events)
    api/
      deps.py          # get_current_user (Bearer JWT + revocation), service token,
                       # require_ability, paging, ObjectId guard
      web.py           # GET / (title), GET|POST /form (signed-cookie CSRF demo)
      v1/              # one router module per domain, assembled in router.py
        account.py user.py asset.py criteria.py match.py suggestion.py
        chat.py notification.py offer.py document.py file.py
        map.py docusign.py admin.py external_feed.py video.py
    core/
      config.py        # pydantic-settings (all env keys, typo-tolerant storage flags,
                       # mongo_db_name, twitter/docusign helpers)
      db.py            # Motor client + connect/close/get_database
      security.py      # bcrypt-12, password strength, HS256 JWT (Node-compatible)
      permissions.py   # RBAC matrix replacing CASL + packRules-compatible rules
      errors.py logging_setup.py rate_limit.py
    models/            # exact Mongo collection names + TTL/pagination index bootstrap
    schemas/asset.py   # full (strict) vs draft (lenient) property validation
    services/          # domain logic: user/account/property/criteria/match/chat/…
      storage/         # FileService abstraction: local → S3 → Azure (same precedence)
      email_service.py templates.py google_maps.py image_generator.py docusign.py
      suggestions.py (similarity) suggestion_service.py (filters)
      log_service.py notification sender, admin_service.py
    cli.py seed.py     # create-agent CLI, faker seeders
  tests/               # per-router suites (mongomock-motor) + parity/test_client_contract.py
```

Stack: FastAPI · Motor (async MongoDB, no ODM — plain dicts keep field parity) ·
Pydantic v2 · python-socketio · python-jose · bcrypt · boto3 / azure-storage-blob /
googlemaps / docusign-esign (all lazily used) · typer · faker · pytest + httpx.

## 3. Request flows

### 3.1 Auth (JWT, stateless)

```
register → verify email (/activate-account/<token>) → invitation/:token (enables user)
login (email+password, bcrypt, is_disabled check) → {token_type, access_token,
  refresh_token, expires_in, refresh_expires_in, rules}
  │  access JWT:  HS256, iss=lost.fish, aud=lost.fish:api, {fname,user_id,username,role}
  │  refresh JWT: HS256, iss=lost.fish, aud=lost.fish:token, {user_id}
  ├─ GET /api/account/me → profile + packed RBAC rules
  ├─ POST /api/account/refresh → single-use rotation (replay → 401)
  └─ POST /api/account/logout → access→revoked.token, refresh→used.refresh.token
Google/Facebook: POST /login-social {provider, user} (find-or-create Tenant)
Twitter: GET /login-twitter-callback?code&state → OAuth2 exchange → oauth2_token
cookie → redirect FRONTEND_URL/twitter/redirect (fail → /login)
```

Tokens minted here verify against the Node backend and vice versa (same secrets/claims).

### 3.2 Users & roles

```
POST /api/user/register ─┐ same creation flow (strong password, uuid token,
POST /api/account/register┘ welcome Agent→user room+message+notification)
GET /api/user/?search&isDisabled&role&createdAtSince&createdAtUntil (+paging, no self)
GET|PATCH /api/user/:id (self-or-Agent) → trust score recomputed
DELETE /api/user → anonymize SELF → 204
forgot → email ?resetPasswordToken= → reset (fresh token pair) | change (auth, email)
```

Role matrix (`core/permissions.py`, ex-CASL):

| Role | Powers |
|---|---|
| `Agent` | manage everything |
| `Tenant` (= Node `Client`) | own User, Chat, Client, Criteria, Documents (**cannot** approve `file.approved`); read SignGenerator, SignURL, Matches |
| `Landlord` | own User, Property, SignGenerator; read SignURL, Matches; **may** approve `file.approved` |
| `NewUser` | own User, Criteria; **cannot** read Matches |

Login/me/refresh responses embed packed `rules` in `@casl/ability` shape.

### 3.3 Properties, criteria, matching

```
Landlord: POST /api/asset (strict) | /asset/draft (lenient) → geocode+distance
  enrichment → property-detail score row → AssetLog
  GET / (status=published|draft|rented, Read-Property gate), /last (+detail,
  suggested tenants, chosen-match count), GET|PATCH|DELETE /:id
  upload (multipart files[]) → storage → [{key,mimetype,originalName,link,isNew}]
  generate-images {prompt} → DiffusionMaster WS → {images}
  applications: POST :id/send-application → landlord email; GET list|mine;
    PATCH update (documents/payment→Completed) | approve (pre/approve_status)
  POST :id/send-invitation → invitation email {message: invitation_send}
  GET :id/viewed-by → tenant views + match_similarity
Tenant: GET|POST|PATCH /api/criteria (own doc; geocodes area; looking_for flips
  NewUser→Tenant/Landlord), GET /:id
Match: POST /properties|/dislikes/properties (tenant, landlord resolved from
  property, detail.matches++) | POST /tenants|/dislikes/tenants (landlord)
  | POST /tenant|/property (generic) → 201 + MatchLog
  GET / (own type, chosen/propertyId/matchRate filters) + enrichment
    {unread_messages, criteria, percentage, matched (reciprocal chosen), matchId}
  GET /property (others') | GET /count {number} | GET :id | PUT :id
  (chosen:false → delete → 204) | DELETE :id | PATCH :id/unmatched → 201
Suggestions: GET /suggestion/asset|tenant (scored, <20% dropped, chosen/disliked
  exclusion, string percentage, sugestion_id) | POST /without-account/properties
  (anonymous, limit 100) — similarity = area(5)+radius(5)+type+budget+house(+4)|
  flats(+9)+furniture+4 distances over 16+ comparisons
```

### 3.4 Chat, documents, offers, signing

```
Chat (global auth): POST /create (room + seed message) | GET / (+?property)
  | GET /started-conversations (distinct property cards)
  | GET /matches/:matchId (find-or-create from match pair)
  | GET /:id?pageSize&​page (messages) | PUT /read {room_id} (seen + viewed)
  | GET /room?participant&property | DELETE /:id → 204
  | GET /:id/contract-documents-status (landlord: {areDocumentsApproved,
    isContractCreated})
Socket.IO (app.main:socket_app): auth handshake token → users{userId:[sid]}
  join_room | send_message → persist + notify other party + receive_message +
    update_message_list | view_property → first-view record + views++
Documents: POST /upload | POST / (role assigns tenant/landlord) | GET /by-user
  | GET|PATCH|DELETE /:id (Update-Documents gate; approval is landlord-field-gated)
  | approved virtual = every file.approved
Offers (global auth): POST / (match → created_for=landlord) → 201
  GET /matches/:matchId/offer (USER vs PROPERTY branches) | PATCH :id/canceled
  | DELETE :id (refuse) | PATCH :id/accepted → all 201
Notifications (global auth): GET / (unviewed Chat) | GET /unread (room aggregate)
  | GET /:id + {viewed} body → 200
DocuSign: GET / (?document_type) | GET /get-consent|/callback|/success (public
  redirects; signing_complete flips signed flags → Signed → property Let)
  GET /envelope (Read-SignGenerator + filters) | POST /create-envelope
  (Create-SignGenerator: template roles + tabs + recipient views)
  POST /create-transaction-envelope (+user.transaction_agreement_link)
  GET /envelope/:id (role-based URL refresh) | GET /envelope/:id/download (public)
```

### 3.5 Platform routers

```
Map (public): GET /?lat&long (reverse geocode) | /station|/school|/places
  (top-3 + walking distance) | /address/:address[/radius/:radius] (radius ignored)
Admin (auth): GET /session|/property|/match (?search&action&type + paging)
  | GET /*-log/:id
Partner feed (header `token` == HEARTHSTONE_API_ACCESS_TOKEN):
  GET /api/v1/property/get | GET /api/v1/user/get (+criteria join)
Video: GET /api/video (404 unless Hearthstone.mp4 present) · Web: GET / · GET|POST /form
```

## 4. API reference (all routes)

Auth: 🔓 public · 🔑 Bearer JWT · 🎫 static `token` header. Ability gates in parentheses.

| Method & path | Auth | Description |
|---|---|---|
| `POST /api/account/login` | 🔓 | login → token pair + rules |
| `POST /api/account/refresh` | 🔓 | rotate pair (single-use) |
| `POST /api/account/logout` | 🔑 | revoke both tokens → `{success:true}` |
| `POST /api/account/login-social` | 🔓 | Google/Facebook find-or-create |
| `GET /api/account/login-twitter-callback` | 🔓 | OAuth2 → cookie + redirect |
| `GET /api/account/get-access-tokens` | 🔑 | re-mint pair |
| `GET /api/account/me` | 🔑 | profile + rules |
| `POST /api/account/register` | 🔓 | create user → 201 |
| `GET /api/account/invitation/:token` | 🔓 | enable user → token pair |
| `GET /api/user/` | 🔑 (Read User) | paginated list, filters |
| `GET /api/user/:id` | 🔑 (self/Agent) | single user minus hash |
| `PATCH /api/user/:id` | 🔑 (self/Agent) | patch + trust recompute |
| `DELETE /api/user` | 🔑 (Delete User) | anonymize self → 204 |
| `POST /api/user/register` | 🔓 | create user → 201 |
| `POST /api/user/forgot-password` | 🔓 | reset email → 201 `ok` |
| `POST /api/user/reset-password` | 🔓 | new password → token pair |
| `POST /api/user/change-password` | 🔑 | change email → 201 `ok` |
| `GET /api/asset/` | 🔑 (Read Property) | list + `?status=` + paging |
| `GET /api/asset/last` | 🔑 | latest Live + details |
| `POST /api/asset` | 🔑 | strict create → 201 |
| `POST /api/asset/draft` | 🔑 | lenient create → 201 |
| `POST /api/asset/generate-images` | 🔑 | `{prompt}` → `{images}` |
| `POST /api/asset/upload` | 🔑 | multipart `files[]` → metadata list |
| `GET /api/asset/:id` | 🔑 | single asset |
| `PATCH /api/asset/:id` | 🔑 | partial update |
| `DELETE /api/asset/:id` | 🔑 | delete → 204 |
| `GET /api/asset/:id/viewed-by` | 🔑 | viewers + similarity |
| `GET /api/asset/:id/get-applications` | 🔑 | applications list |
| `GET /api/asset/:id/application` | 🔑 | own application |
| `POST /api/asset/:id/send-application` | 🔑 | apply + landlord email |
| `PATCH /api/asset/:id/approve-application` | 🔑 | pre/approve + emails |
| `PATCH /api/asset/:id/update-application` | 🔑 | docs/payment |
| `POST /api/asset/:id/send-invitation` | 🔑 | invite email |
| `GET /api/criteria` | 🔑 | own criteria (404 if none) |
| `POST /api/criteria` | 🔑 | create + geocode → 201 |
| `PATCH /api/criteria` | 🔑 | update own |
| `GET /api/criteria/:id` | 🔑 | by id |
| `GET /api/match/` | 🔑 | own-type list + enrichment |
| `GET /api/match/property` | 🔑 | others' matches |
| `GET /api/match/count` | 🔑 | `{number}` |
| `POST /api/match/tenants` | 🔑 | landlord like → 201 |
| `POST /api/match/dislikes/tenants` | 🔑 | landlord dislike → 201 |
| `POST /api/match/properties` | 🔑 | tenant like → 201 |
| `POST /api/match/dislikes/properties` | 🔑 | tenant dislike → 201 |
| `GET /api/match/:id` | 🔑 | owner+type scoped + enrichment |
| `POST /api/match/tenant` | 🔑 | generic landlord create |
| `POST /api/match/property` | 🔑 | generic tenant create |
| `PUT /api/match/:id` | 🔑 | update (`chosen:false` → 204) |
| `DELETE /api/match/:id` | 🔑 | delete → 200 doc |
| `PATCH /api/match/:id/unmatched` | 🔑 | owner-only → 201 |
| `GET /api/suggestion/asset` | 🔑 | scored properties |
| `GET /api/suggestion/tenant` | 🔑 | scored tenants (`?propertyId`) |
| `POST /api/suggestion/without-account/properties` | 🔓 | anonymous scoring |
| `GET /api/chat/` | 🔑 | rooms (`?property`) |
| `POST /api/chat/create` | 🔑 | room + seed message |
| `GET /api/chat/started-conversations` | 🔑 | property cards |
| `GET /api/chat/matches/:matchId` | 🔑 | find-or-create from match |
| `PUT /api/chat/read` | 🔑 | mark seen `{room_id}` |
| `GET /api/chat/room` | 🔑 | existence check |
| `GET /api/chat/:id` | 🔑 | paginated messages |
| `DELETE /api/chat/:id` | 🔑 | delete → 204 |
| `GET /api/chat/:id/contract-documents-status` | 🔑 | landlord-only status |
| `GET /api/notification/` | 🔑 | unviewed Chat |
| `GET /api/notification/unread` | 🔑 | `{unread}` aggregate |
| `GET /api/notification/:id` | 🔑 | mark viewed (body) → 200 |
| `POST /api/offer/` | 🔑 | create → 201 |
| `GET /api/offer/matches/:matchId/offer` | 🔑 | fetch by match |
| `PATCH /api/offer/:offerId/canceled` | 🔑 | cancel → 201 |
| `DELETE /api/offer/:offerId` | 🔑 | refuse → 201 |
| `PATCH /api/offer/:offerId/accepted` | 🔑 | accept → 201 |
| `GET /api/document` | 🔑 | (parity: always `[]`) |
| `GET /api/document/by-user` | 🔑 | pair doc (`?participant=`) |
| `GET /api/document/:id` | 🔑 | by id |
| `POST /api/document/` | 🔑 | create → 201 |
| `POST /api/document/upload` | 🔑 | multipart upload |
| `PATCH /api/document/:id` | 🔑 (Update Documents) | merge + approval |
| `DELETE /api/document/:id` | 🔑 | delete → 200 message |
| `GET /api/file/:filename` | 🔓 | stream by filename/key |
| `GET /api/map/` | 🔓 | reverse geocode |
| `GET /api/map/station|/school|/places` | 🔓 | nearest places |
| `GET /api/map/address/:address[/radius/:radius]` | 🔓 | geocode |
| `GET /api/docusign/` | 🔑 | envelope by filter |
| `GET /api/docusign/get-consent|/callback|/success` | 🔓 | OAuth/signing redirects |
| `GET /api/docusign/envelope` | 🔑 (Read SignGenerator) | filtered list |
| `POST /api/docusign/create-envelope` | 🔑 (Create SignGenerator) | rent contract |
| `POST /api/docusign/create-transaction-envelope` | 🔑 | agreement + user link |
| `GET /api/docusign/envelope/:id` | 🔑 | by id + URL refresh |
| `GET /api/docusign/envelope/:id/download` | 🔓 | signed PDF |
| `GET /api/admin/session|/property|/match` | 🔑 | log explorer |
| `GET /api/admin/*-log/:id` | 🔑 | single log |
| `GET /api/v1/property/get` | 🎫 | partner property feed |
| `GET /api/v1/user/get` | 🎫 | partner user feed |
| `GET /api/video` | 🔓 | mp4 stream (404 if absent) |
| `GET /` · `GET|POST /form` · `GET /health` | 🔓 | title · CSRF demo · healthcheck |

Socket.IO events (`app.main:socket_app`): `join_room` · `send_message` →
`receive_message`/`receive_room_id`/`update_message_list` · `view_property`.

Conventions kept from Node: validation errors are **400** (never 422); paginated
responses are `{docs, totalDocs, limit, page, …}`; error bodies are
`{message, stack?}` (stack hidden in stage/prod); unknown routes are JSON 404.

## 5. Data model (Mongo collections)

`user` (+trust_score, soft-delete) · `property` · `property-detail` (views/matches/
score) · `property-view` · `criteria` (one per user) · `match` (tenant/landlord/
property, chosen/matched/unmatched/disliked, type Property|User) · `room` ·
`message` · `notification` · `offer` · `document` (+`approved` virtual) ·
`envelope` (+`can_download`) · `file` (upload metadata) · `application` ·
`invitation` · `login.log` / `user.log` / `match.log` / `property.log` (TTL
`LOG_EXPIRATION_DAYS`) · `revoked.token` / `used.refresh.token` /
`docusign.token` (TTL). Indexes are bootstrapped in `models/indexes.py`.

## 6. Run (dev)

```bash
cp .env.example .env   # fill secrets (JWT/refresh/session, DB, mail, maps, docusign)
pip install -e ".[dev]"
uvicorn app.main:app --reload --port 3000
# REST + Swagger: http://localhost:3000/ http://localhost:3000/docs
# With websockets (prod-like): uvicorn app.main:socket_app --port 3000
```

Needs MongoDB (`DB_CONNECTION_STRING`) — or `docker compose up` for api + mongo + redis.
`GET /health` is the container healthcheck.

## 7. Test / lint / types

```bash
pytest -q
ruff check . && ruff format --check . && mypy .
```

Tests use mongomock-motor (no live DB needed). The client-contract parity suite lives in
`tests/parity/test_client_contract.py`.

## 8. Seed / CLI

```bash
python -m app.seed --users 10 --properties 10 --criteria 5
python -m app.cli --email boss@example.com --first-name Boss --last-name Agent
# (prompts for anything omitted; creates an enabled Agent user)
```

## 9. Configuration highlights

| Key | Purpose |
|---|---|
| `DB_CONNECTION_STRING` / `DB_DATABASE` | Mongo (name falls back to URI path) |
| `JWT_SECRET` / `REFRESH_SECRET` (+ `*_EXPIRE_SECONDS`) | HS256 tokens, `iss=lost.fish`, compat with Node-issued JWTs |
| `HEARTHSTONE_API_ACCESS_TOKEN` | static `token` header guarding `GET /api/v1/*` |
| `USE_AZURE_BLOB_BUCKET` (legacy typo `USE_AZURE_BLOB_BACKET` accepted) / `USE_S3_BUCKET` | storage backend: Azure → S3 → local `uploads/` |
| `GOOGLE_MAP_KEY` | enrichment + `/api/map/*` (skipped when empty) |
| `TWITTER_AUTH_CLIENT_ID/SECRET`, `DS_*` + `certs/docusign/private.key`, `IMAGE_GENERATOR_KEY` | Twitter OAuth, DocuSign JWT grant, DiffusionMaster images |

## 10. Docker

```bash
docker compose up   # api + mongo + redis; mounts uploads/, logs/
```

## 11. Notes & known parity quirks

- Validation errors return **400** (Node/Joi parity), not 422.
- Rate limiting is wired (SlowAPI) but **disabled** by default — Node's limiter is a no-op.
- `Attribute`/`Condition` routers were never mounted in Node and are not ported (404).
- No workers/cron exist in Node (verified) — none here either.
- Deliberate Node-bug replicas (see `PORTING_NOTES.md`): `GET /api/document` → `[]`;
  landlord 403 on document PATCH; approve-application looked up by route id;
  `GET /api/notification/unread` 1-or-0 rule; random v1 percentages; `sugestion_id`
  typo; string suggestion percentages; double match logs; invitation `rules: []`.

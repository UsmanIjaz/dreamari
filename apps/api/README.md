# @dreamari/api

Node.js + TypeScript + **Fastify** + **Prisma** + **PostgreSQL**, with **Better Auth** for
authentication. Serves BUILD → MATCH → Career Report, plus the admin module (invite students,
view individual progress, analytics). The matching logic is the shared, transparent engine in
`@dreamari/dataset`, the same code the web app uses, so scoring can never drift between
client and server.

## Auth (Better Auth)

DB-backed, **revocable** sessions carried in an **httpOnly cookie** (the web app reaches the
API same-origin via a Vite proxy, so the cookie is never exposed to JS). Plugins:

- **anonymous**, guest sessions (the consumer onboarding); upgradeable to email/password later.
- **admin**, roles (`user` for students, `admin` for staff), enforced by the route guards.
- Built-in **rate limiting** on the auth endpoints.

Auth endpoints live at `/api/auth/*` (e.g. `POST /api/auth/sign-in/email`,
`POST /api/auth/sign-in/anonymous`, `GET /api/auth/get-session`, `POST /api/auth/sign-out`).

## Run it locally

```bash
# 1. Postgres (Docker): maps to host port 5434
docker compose -f apps/api/docker-compose.yml up -d

# 2. from apps/api:
pnpm db:push      # create the schema (or `pnpm db:reset-hard` for a clean reset)
pnpm db:seed      # 1 admin, 3 demo students (Maya/Sam/Theo), an invite code, via Better Auth
pnpm dev          # http://localhost:8080  ·  Swagger UI at /docs
```

Seed logins (password `dreamari123`): `admin@dreamari.test` (admin), `maya@demo.test`,
`sam@demo.test`, `theo@demo.test`. Pending invite code: `DRM-WELCOME`.

## Test it

- **Postman**, import `postman/Dreamari.postman_collection.json`. Run *Auth → Admin login* (or
  *Guest sign-in*) first; Better Auth sets a session **cookie** that Postman's cookie jar reuses
  automatically for the rest of the requests (no bearer token to manage).
- **Automated**, `pnpm test` (app wiring + RBAC + OpenAPI). The matching engine has its own
  suite in `packages/dataset` (`pnpm --filter @dreamari/dataset test`), and the web app has a
  Playwright smoke test (`pnpm --filter @dreamari/student e2e`).
- **OpenAPI**, `GET /openapi.json`, or the Swagger UI at `/docs`.

## Endpoints

Domain routes are versioned under **`/v1`**; auth is at `/api/auth/*`; meta (`/health`,
`/openapi.json`, `/docs`) is unversioned. Errors use a consistent envelope:
`{ "statusCode": 401, "error": "Unauthorized" }`.

| Area | Routes |
|---|---|
| auth | `/api/auth/*` (Better Auth: sign-in/email, sign-in/anonymous, get-session, sign-out); `POST /v1/auth/redeem` (invite → account) |
| build | `GET /v1/build`, `PUT /v1/build` (validates the "pick up to 3" rules) |
| match | `GET /v1/match` (top careers + majors, with breakdowns), `GET /v1/match/deck` |
| swipes | `POST /v1/swipes` (idempotent; stores the 5 facet answers + fit), `GET /v1/swipes` |
| report | `GET /v1/report`, `GET /v1/report/career/:code` |
| content | `GET /v1/careers`, `GET /v1/majors` |
| admin | `POST/GET/DELETE /v1/admin/invites`, `GET /v1/admin/students`, `GET /v1/admin/students/:id`, `GET /v1/admin/analytics` |

### Privacy note

Admin sees **progress, not psychology**, the roster returns completion, swipe/like counts,
last-active, and a broad "leaning" (top major), but **not** raw assessment answers. Those are
gated behind `GET /v1/admin/students/:id?includeAnswers=true`, a deliberate decision mirroring
the product's FERPA stance. Student deletion cascades to BUILD + swipes (right-to-deletion).

## Deploying (Railway)

Provision a Postgres plugin, set `DATABASE_URL`, `BETTER_AUTH_SECRET`, `API_URL`, and
`WEB_ORIGIN`, run `prisma migrate deploy` (generate a migration first with `prisma migrate dev`),
then `pnpm start`. Serve the web app so it reaches the API same-origin (proxy or shared domain)
for the session cookie.

# Dreamari

Career discovery for ages 13-18, *dream about who you could become*.

Implementation repo for the Dreamari engineering trial. A **monorepo** built on the
"one backend, many clients" architecture: a shared design system and a shared, transparent
matching engine, consumed by a student app, an admin dashboard, and the API.

## Workspace layout

```
apps/
  student/        # Vite + React, student web app, styled to feel native-mobile
  admin/          # Vite + React, admin dashboard (overview, roster, schools/cohorts, invites)
  api/            # Fastify + Prisma + Postgres, BUILD → MATCH → Report + admin, Better Auth
packages/
  design-tokens/  # Mint Fresh · Bold Sticker, shared Tailwind preset + base/motion CSS
  dataset/        # the career/major dataset + the transparent matching engine (client & server)
```

## Architecture

- **Shared matching engine** (`@dreamari/dataset`), careers, majors, scoring, and the Career
  Report builder live in one TypeScript package used by the API (and reused for the admin
  "leaning" calc), so scoring can never drift. It's pure and unit-tested (16 tests).
- **Shared design tokens** (`@dreamari/design-tokens`), one OKLCH "Mint Sticker" token family;
  the student app uses the expressive register, the admin app the calmer one.
- **Auth**, **Better Auth** with DB-backed, revocable sessions in an **httpOnly cookie**. Each
  web app reaches the API **same-origin via a Vite proxy**, so the cookie is never exposed to JS.
  Plugins: anonymous (student guest sessions, upgradeable) + admin (roles) + rate limiting.

## Running locally

Requires Node 20+, pnpm, and Docker.

```bash
pnpm install

# 1. database + API
docker compose -f apps/api/docker-compose.yml up -d          # Postgres on :5434
pnpm --filter @dreamari/api db:push                          # schema
pnpm --filter @dreamari/api db:seed                          # admin + 3 demo students
pnpm --filter @dreamari/api dev                              # API on :8080  (/docs)

# 2. the two web apps (separate terminals)
pnpm --filter @dreamari/student dev                          # :5173
pnpm --filter @dreamari/admin dev                            # :5174
```

Seed logins (password `dreamari123`): `admin@dreamari.test` (admin dashboard), and
`maya@ / sam@ / theo@demo.test` (students). Students normally arrive as anonymous guests
through onboarding, or via an emailed school invite; the admin issues invites from the dashboard.

## What's built

- **Student app**, landing → onboarding (gamified 9-step BUILD) → the **Dream Map** (5 worlds,
  vibe-check swipes) → **Career Report** (path ladder, action plan, universities, certs), inside
  a mobile-style tabbed shell. Cookie-auth via Better Auth.
- **Admin dashboard**, sign in, **Overview** (analytics), **Students** roster (progress, not
  psychology; raw answers gated behind an audit-logged reveal; paginated and searchable),
  **Schools** (schools to cohorts to invites, with CSV roster upload and emailed links), and
  **Invites** (create / copy / revoke).
- **API**, see [`apps/api/README.md`](./apps/api/README.md). Versioned `/v1`, OpenAPI at `/docs`,
  Postman collection, consistent error envelope.

## Testing

```bash
pnpm --filter @dreamari/dataset test     # matching engine (16 tests)
pnpm --filter @dreamari/api test         # API wiring + RBAC + OpenAPI (4 tests)
pnpm --filter @dreamari/student e2e      # Playwright: student journey
pnpm --filter @dreamari/admin e2e        # Playwright: admin login → roster → invite
```

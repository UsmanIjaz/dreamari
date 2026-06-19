# Dreamari, Engineering Trial Submission

A plain-language walkthrough of what I built, how people use it, how the matching works, the design and stack decisions I made, and how another engineer could pick it up. Written for the reviewers.

| | |
|---|---|
| **Student app** | https://dreamari.app |
| **Admin / counselor dashboard** | https://admin.dreamari.app |
| **Live API + interactive docs** | https://dreamari-production.up.railway.app/docs |
| **GitHub** | https://github.com/UsmanIjaz/dreamari |
| **Postman collection** | `apps/api/postman/Dreamari.postman_collection.json` |

**Seed logins** (password `dreamari123`): `admin@dreamari.test` (admin), and `maya@`, `sam@`, `theo@demo.test` (students with demo data). A student can also just open the app and start as a guest.

---

## 1. What I built (the short version)

The full student journey the brief describes, BUILD then MATCH then Career Report, plus the pieces a real product needs around it:

- A **student web app** that deliberately feels like a **native mobile app** (phone frame, bottom tab bar, swipe gestures, haptics, a companion mascot that grows). Landing, then a gamified 9-step BUILD, then a **Dream Map** of 5 major "worlds" you explore with vibe-check swipes, then a full **Career Report**.
- An **admin / counselor dashboard**: an analytics overview, a student roster (progress, not raw psychology), and the full invite system (schools, then grades / cohorts, then invites) with CSV roster upload and emailed invite links.
- An **API-first backend** that serves both, with **versioned `/v1` endpoints**, live OpenAPI docs, and a Postman collection.
- **Two ways in**: a student can start instantly as a guest and upgrade into an account later, or arrive through a school invite. Both are covered in section 5.
- **Config-as-code deployment**: push to GitHub, and Railway redeploys the API and Postgres while Vercel redeploys both web apps. Live on the real domain `dreamari.app`.
- **Hardened for review**: CORS locked to the known web origins, per-client rate limiting, **atomic** invite redemption, **audit-logged** access to a student's raw answers, **paginated and searchable** admin lists, and a **calibrated, explainable** match score.

---

## 2. Architecture at a glance

A **pnpm + Turborepo monorepo**, "one backend, many clients", so the scoring logic and the design system can never drift between apps.

```
apps/
  student/   Vite + React + Tailwind, the student app (native-mobile feel)
  admin/     Vite + React + Tailwind, the counselor dashboard
  api/       Fastify + Prisma + PostgreSQL, BUILD then MATCH then Report + admin + auth
packages/
  dataset/         the career/major data + the transparent matching engine (pure, unit-tested)
  design-tokens/   one shared OKLCH design system
```

- **The matching engine lives in one shared package** (`@dreamari/dataset`). Careers, majors, scoring, and the report builder are pure TypeScript, unit-tested, and imported by the API (and reused for the admin "leaning" calc). Scoring cannot diverge because there is only one copy.
- **Auth and cookies:** each web app reaches the API **same-origin** through a proxy (Vite locally, Vercel rewrites in prod), so the session cookie stays first-party and httpOnly, never exposed to JavaScript. That is why both apps proxy `/v1` and `/api` to the API instead of calling it cross-origin.

---

## 3. Design, and the Duolingo question

The brief gave no design direction, so I treated that as an opportunity rather than a gap, and made three calls.

1. **A design system built for the audience.** Students aged 13 to 18 respond to something that feels like an app they already use, not an enterprise form. So I built a small design language (codenamed "Mint Sticker"): an OKLCH mint-and-jade palette, thick ink outlines with soft sticker shadows, Plus Jakarta Sans for warmth and JetBrains Mono for the data bits, and a companion mascot ("Dreamy") that grows as the student progresses. It lives in one shared package so the student app and the admin dashboard draw from the same tokens (the admin uses a calmer register of the same system).
2. **A simple marketing website.** A short landing page frames the product before a student commits, the way a real consumer app earns the first tap.
3. **Onboarding modeled on Duolingo.** The BUILD assessment is gamified the way a language app is: one question at a time, a progress bar, XP and affirmations, haptics, and the mascot reacting. That format keeps a teenager moving through a multi-step flow without it feeling like a test, which the brief explicitly says it must not.

### Linear learning vs open exploration

The team leaned toward a Duolingo-style linear path. I want to be explicit about where I agreed and where I deliberately did not.

Duolingo's linearity works because **language learning is sequential and cumulative**: there is a correct order, each skill builds on the last, and "progress" is a single line you advance along. Career discovery is the opposite. A 15-year-old is not advancing along one correct track; they are **wandering a space**, comparing options and finding what resonates. If I forced that into a linear path, the product would quietly tell the student "there is one route, and here it is", which is exactly the anxiety it is meant to remove, and it would strip the sense of agency that makes exploration feel like yours.

So I split the experience by layer:

- **Discovery is exploratory.** After BUILD, the student lands on a "Dream Map": the top majors appear as worlds they can visit in any order, look around, and react to. No fixed sequence, no single path, no wrong turn. This matches how figuring out who you want to be actually feels.
- **Depth is linear.** The place Duolingo's model genuinely fits is *inside* a chosen major or career. Once a student commits to a direction, the deep dive (focused assessments, day-in-the-life simulations, skill checks, milestones) is naturally sequential and benefits from a guided, gamified track. That is where a streak, a path, and a "next lesson" belong.

So the answer is not linear *or* exploratory. It is **exploratory to find a direction, then linear to go deep on the direction you chose.** The current build implements the exploration layer fully and stubs the linear deep dive (the "Play" tab and the simulations) as the next phase, which is the honest state of it.

---

## 4. How the matching logic works (plain language)

It is a **transparent, deterministic, weighted-overlap scorer**. No LLM, no black box, every score is inspectable item by item. All of it is in [`packages/dataset/src/match.ts`](packages/dataset/src/match.ts).

**The flow:**

1. **Pull the BUILD profile** and normalize the labels to the dataset's canonical labels (for example `English` to `English/Literature`).
2. **Score each of the 16 careers** by counting how the student overlaps with that career and multiplying by fixed weights:

   | Dimension | Points |
   |---|---|
   | each matched **subject** | x3 |
   | each matched **strength** | x3 |
   | each matched **day activity** | x2 |
   | each matched **value** | x2 |
   | **education fit** | exactly fits +4, willing to study longer +2, not long enough -2 |
   | **finance** | cost-sensitive on a long, expensive path -3, cost-sensitive with a shorter route +2, "somewhat" on a long path -1 |
   | **path preference** | Trades to a trade career +3 / non-trade -2, College to a degree career +1 (Both is neutral) |

3. **Rank the careers, take the top 5**, each with a one-sentence plain-language explanation built from *which* items matched ("Strong fit for your interest in Computer Science and Mathematics...").
4. **Rank the majors:** a major's score is its **best-matching linked career's** score, so a major surfaces because it leads somewhere that fits the student. The **top 5 majors** become the swipe deck (the Dream Map worlds).
5. **Swipe to like or pass:** each major is a quick **vibe check of 5 yes/no swipes** (Classes, Workstyle, Skills, Salary, Day-in-the-life). **3 or more "yes" means liked.** I store the binary like/pass the brief asks for, plus the 5 facet answers and a 0-to-5 "fit" for extra signal.
6. **Career Report:** for each liked major, gather its linked careers, rank them, and assemble the report: a path ladder with salaries, an action plan (Now, 1 to 2 years, 3 to 5 years), university options, certifications by timing, and a **conclusion paragraph generated per student** so it is personalized, not canned.

**Match percent:** the raw score maps to a friendly band that is **calibrated** so a strong profile reaches the top while a genuine mismatch reads visibly lower than a neutral one (rather than everything flooring at a single number). The one-line **explanation is built from the dimensions that actually scored**, so the headline tracks the math. Everything is tunable in one place, the `WEIGHTS` object, and `scoreCareer()` returns a full per-dimension `breakdown`, so any match can be explained line by line.

### Did I use your data or rewrite it?

| Data | Source |
|---|---|
| **16 careers** (subjects, strengths, day activities, values, education path) | **Yours, verbatim.** I added a `code`, a student-friendly description, a `trade` flag (only Electrician), and `educationTiers` encoding your education-path text. |
| **12 majors** (the 5 sub-cards, linked careers, salary outlook) | **Yours, verbatim.** I added a teaser, icon, and accent for the Dream Map visuals. |
| **Career Report detail** (per-level salaries, universities, certifications, action plans) | **Authored by me.** The brief specifies these fields but supplies no data, so the content is illustrative and reasonable, not yet sourced from O\*NET or BLS (see section 12). |

I did not reduce the dataset and extended only where the brief allows.

---

## 5. How students and schools join: direct signup and invites

There are two front doors, and both land in the same place.

**1. Direct, guest-first.** A student can open `dreamari.app` and start immediately as a **guest**, no account and no email, going straight into BUILD. Better Auth anonymous sessions hold their progress, and when they choose to save it the guest **upgrades into a real account** (email and password) without losing a single answer. This removes the signup wall that kills first-session completion for teenagers, you prove the value first and ask for the account second. Returning students sign in with email and password, and there is a password reset flow.

**2. By invite, from a school.** A counselor creates a school, then grades (cohorts), then invites students by **name and email**, one at a time or by uploading a CSV roster. Each invite emails the student a personal link (through Resend, on `dreamari.app`) that drops them into the same guest-first flow, **already tied to their school and cohort**, so their progress shows up on the counselor's roster. Redemption is **atomic**: a link works once, and a double-click cannot create two accounts.

A lightweight **13-plus age gate** sits in front of both, since the audience is minors.

---

## 6. The counselor / admin side, and why it matters

The student app is what a teenager sees, but the admin dashboard is what makes Dreamari **deployable to a school**, which is where the brief's real customers live (116 partner schools, the JPMorgan and EY relationships). It matters for three reasons.

**Distribution.** Schools are how students arrive at scale. The school to cohort to invite flow, plus CSV roster upload, is the mechanism a counselor uses to bring a whole grade on board in a few minutes, instead of students finding the app one by one.

**Counselor value, with student privacy.** A counselor sees **progress** (who started, who finished BUILD, where a cohort is stuck), not a student's raw psychology. Reaching an individual student's answers is deliberately a **separate, audit-logged action**: every reveal records who looked, when, and at whose record, and the API projects only the intended fields rather than shipping the whole profile. That is the FERPA-minded posture a school expects before it will let an outside product near minors' data.

**Accountability and scale.** The lists are **paginated and searchable** so a 500-student roster stays usable, invite lists never leak recipient emails to the client, and every admin action is access-controlled on the server. This is the difference between a demo and something a district would actually run.

---

## 7. The tech stack

A **pnpm + Turborepo monorepo**, one backend serving many clients, so the scoring engine and the design system are shared packages that cannot fall out of sync between apps.

- **API: Fastify + TypeScript.** Built schema-first, so the same JSON schemas that validate every request also generate the OpenAPI and Postman docs the brief asks for. It is light and fast for a focused API.
- **Data: PostgreSQL through Prisma.** Postgres is the right relational store for this model; Prisma keeps types end to end and makes the schema read like the product.
- **Auth: Better Auth.** DB-backed, **revocable** sessions in an httpOnly cookie, with built-in rate limiting and a clean guest-to-account upgrade. For an app handling minors I wanted revocable server-side sessions rather than a hand-rolled token, which is easy to get subtly wrong.
- **Web: Vite + React + TypeScript + Tailwind.** Two single-page apps, fast to build and fast to load.
- **Email: Resend.** Transactional invite and password-reset email on the verified `dreamari.app` domain.
- **Matching: a transparent rules engine** in its own package, no LLM, fully unit-tested and explainable.
- **Hosting: config-as-code.** The API and PostgreSQL on **Railway**, the two web apps on **Vercel**, each redeploying automatically on every push to `master`.

---

## 8. The API

The full API is **browsable and runnable** at **https://dreamari-production.up.railway.app/docs**, an interactive Swagger UI generated from the live schemas, so the whole structure is visible the moment you open the link. Everything is versioned under `/v1`, cookie-authed, with a consistent error shape. Full request examples are in the Postman collection.

| Area | Endpoints |
|---|---|
| **Auth** (Better Auth) | `POST /api/auth/sign-up/email`, `/sign-in/email`, `/sign-in/anonymous`, `/sign-out`, `GET /api/auth/get-session`, password reset |
| **BUILD** | `GET /v1/build`, `PUT /v1/build` |
| **MATCH** | `GET /v1/match` (top 5 careers and majors, with breakdowns), `GET /v1/match/deck` (swipe deck with sub-cards), `GET/POST /v1/swipes` |
| **Career Report** | `GET /v1/report` (liked majors to careers), `GET /v1/report/career/:code` (full report) |
| **Content** | `GET /v1/careers`, `GET /v1/majors` |
| **Invites** | `GET /v1/invite/:code` (public), `POST /v1/invite/attach` (authed) |
| **Admin** (admin-only) | analytics, student roster and detail, invites CRUD, schools to cohorts to invites + bulk CSV, audit log |

This maps one to one to the brief: BUILD stores every field; MATCH stores path preference, each swipe, and the liked count, and returns the top 5 majors; the Career Report returns all six required sections.

Admin list endpoints are **paginated and searchable** (`?q=&limit=&offset=`, plus a status filter on invites); revealing a student's raw answers is **audit-logged** (`GET /v1/admin/audit`); the API has a **per-client rate limit** (`trustProxy` so it keys off the real client IP) and **CORS locked** to the known web origins. Invite redemption is an **atomic compare-and-swap**, and bulk roster upload is one `createMany` plus bounded-concurrency email, de-duped against the cohort.

---

## 9. How another engineer continues

**Run it locally** (Node 20+, pnpm, Docker):

```bash
pnpm install
docker compose -f apps/api/docker-compose.yml up -d      # Postgres on :5434
pnpm --filter @dreamari/api db:push                       # schema
pnpm --filter @dreamari/api db:seed                       # admin + 3 demo students
pnpm dev                                                  # API :8080 (/docs), student :5173, admin :5174
```

**Where to change things** (the map that matters most):

| To change | Edit |
|---|---|
| Match **weights / scoring rules** | [`packages/dataset/src/match.ts`](packages/dataset/src/match.ts) (`WEIGHTS`) |
| **Careers / majors** data | `packages/dataset/src/careers.ts`, `majors.ts` |
| **Career Report** content | `packages/dataset/src/reports.ts` |
| **BUILD** questions / options | `apps/student/src/onboarding/data.ts` |
| **Swipe** vibe-check questions | `apps/student/src/match/Match.tsx` |
| **API** endpoints | `apps/api/src/routes/*` (register in `app.ts`) |
| **Database** schema | `apps/api/prisma/schema.prisma` |
| **Auth** behavior | `apps/api/src/auth.ts` |
| **Email** templates / sending | `apps/api/src/lib/email.ts` |
| **Design** tokens | `packages/design-tokens` |

**Deployment is config-as-code:** a Dockerfile plus `railway.json` (API) and a `vercel.json` per web app. Push to `master`, and Railway and Vercel redeploy automatically; the deploy runs `db:push` so additive schema changes apply on their own. Environment variables (DB, auth secret, origins, Resend) live in the Railway and Vercel dashboards, never in the repo.

**Tests:**

```bash
pnpm --filter @dreamari/dataset test   # matching engine (16 tests: scoring, labels, branches, calibration)
pnpm --filter @dreamari/api test       # API wiring + RBAC + OpenAPI
pnpm --filter @dreamari/student e2e    # Playwright: student journey
pnpm --filter @dreamari/admin e2e      # Playwright: admin login, roster, invite
```

---

## 10. Decisions, assumptions, and how I handled ambiguity

The brief asks us to flag ambiguity rather than silently assume. Those calls, each with quick-pick options for the team, are in **[`Dreamari-Questions-and-Assumptions.md`](Dreamari-Questions-and-Assumptions.md)**. The headlines:

- **Swipe interaction (a deliberate deviation):** the brief implies one swipe per major; I made each major a 5-question vibe check that aggregates to like/pass (3 or more yes). It captures more signal and is more engaging, and I still store the binary like/pass. Open for the team to revert.
- **Exploration over a linear path:** see section 3. Discovery is exploratory; linearity is reserved for the per-major deep dive.
- **Calibrated match percent:** scores are mapped so strong fits reach the top and genuine mismatches read visibly lower than a neutral profile, rather than a raw 0 to 100.
- **Stored but not scored:** GPA, energy, team, interaction, and location are captured (as required) but do not influence the score, because the brief's scoring dimensions do not include them. Easy to fold in later.
- **Report content is illustrative,** not yet from an authoritative source.

---

## 11. What I would build next (with another week)

1. **Replace illustrative report data with sourced data.** Wire salaries, outlook, and certifications to O\*NET or BLS, and regionalize by the student's location. This is the highest-value correctness upgrade.
2. **Build the linear deep dive.** The "Play" tab is stubbed; this is the layer where Duolingo's model fits (section 3): one real day-in-the-life simulation per top career, as a guided, gamified track with milestones. The strongest engagement hook.
3. **Use more of the BUILD signal in matching.** Energy, team, and interaction as tie-breakers; location to tailor university options; GPA for reach and safety framing.
4. **Real gamification persistence.** Server-tracked streaks and a persisted companion (the placeholder streak was removed; this builds the real thing).
5. **Counselor depth.** Pagination and search are in; next is cohort-level analytics, exportable progress, and a privacy-respecting view of where a class is stuck.
6. **Engineering hardening.** GitHub Actions CI (tests and typecheck on every push), an initial Prisma migration instead of `db:push`, and an internationalization pass for the global audience. (The accessibility pass and the security, scale, and privacy hardening are already done.)

---

## 12. Honest limitations (so nothing surprises a reviewer)

- Career Report figures are **illustrative**, not sourced. Fine for the trial, must be replaced before real students rely on them.
- **Day-in-the-life simulations** are not built (the "Play" tab is a stub), and real streaks are not built yet (the fake one was removed).
- **GPA, energy, team, interaction, and location** are stored but not yet used by the matcher (by design, see section 10).

Everything else, BUILD, MATCH, the Career Report, the explainable scoring, the admin and invite system, auth, and the live deployment, is working end to end on `dreamari.app`.

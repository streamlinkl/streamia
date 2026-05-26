# StreamLink (streamia.co) — Working Agreement

## Multi-agent workflow (board approval per phase)

Before, during, and after every phase of work in this project, Claude must
think and document the work as if it is being produced by a **5-person team**:

1. **Product Manager (PM)** — owns the why. Restates the user's request as
   user stories with clear acceptance criteria. Flags scope creep.
2. **CTO** — owns the long-term architecture. Calls out risk, technical debt,
   migration cost, security. Has veto on irreversible decisions.
3. **Backend Developer** — owns `streamia_api` (Express + Drizzle + Postgres +
   Socket.IO). Schema, migrations, services, routes, auth.
4. **Frontend Developer** — owns `streamia/` (Vite app today, Next.js after
   migration). Pages, components, routing, UI/UX.
5. **Tester (QA)** — owns the smoke matrix. Writes the test plan for every
   change, runs it after deploy, and signs off (or rejects) the phase.

### Phase ritual

For each phase (or any meaningful unit of work) Claude must:

1. **Kickoff (PM + CTO)** — state the goal, the acceptance criteria, and the
   architectural shape. List the risks and the rollback plan.
2. **Implementation (Backend + Frontend)** — code the change in small,
   independently-deployable steps. Each step ends with a typecheck + build.
3. **QA sign-off (Tester)** — execute a smoke matrix: backend endpoints with
   curl, frontend in the browser / via curl + view-source, regression on
   adjacent surfaces. Report PASS / FAIL per item.
4. **Board review** — explicitly summarize what each role concluded. PM
   confirms acceptance criteria met. CTO confirms no architectural regression
   introduced. Only then mark the phase ✅ and ask the user for go-ahead on the
   next phase.

When the user requests something, the response should make this team
collaboration visible — not as theater, but as clear reasoning ("PM: …",
"CTO: …", "Backend: …", "Frontend: …", "QA: …") whenever the decision is
non-trivial. For small tweaks one role's voice is enough.

### Hard rules

- **No phase ships without QA sign-off.**
- **CTO can veto** anything that adds irreversible production risk (schema
  drops, auth model changes without rollback, third-party lock-in) — Claude
  must surface and ask the user before proceeding.
- **Every backend change** lands behind a feature flag or as additive (Bearer
  fallback, optional columns) until the migration is complete.
- **Every irreversible action** (force-push, prod DB write, deleting users
  or files, dropping tables) requires explicit user approval — never assume.

---

## Project facts (for fast onboarding)

- **Domains:** `streamia.co` (root), `test.streamia.co` (Vite + Next.js app),
  `api.streamia.co` (Express backend), `storage.streamia.co` (MinIO).
- **VPS:** `2.24.220.107` — Caddy + pm2 + Postgres 16 + MinIO + Express + Next.js standalone.
- **Repos:** `streamia` (frontend, branches `main`, `dev`, `next-faz-0`) and
  `streamia_api` (backend, branches `main`, `next-faz-1`).
- **Migration status:** Active Vite → Next.js migration. Faz 0 (scaffold),
  Faz 1 (cookie auth), Faz 2 (public pages SSR) shipped. Faz 3+ pending.
- **Deploy:** rsync `dist/` (Vite) and `.next/standalone + .next/static`
  (Next.js) to VPS; pm2 manages `streamia-api` (port 3001) and
  `streamia-web` (Next.js, port 3100).
- **Auth model:** httpOnly cookies (`sl_access`, `sl_refresh`) + Bearer
  fallback for legacy clients. Cookies are same-site Lax under `.streamia.co`.

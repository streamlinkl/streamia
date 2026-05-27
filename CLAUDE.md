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
4. **Frontend Developer** — owns `streamia/` (Next.js 14 App Router).
   Pages, components, routing, UI/UX.
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
non-trivial. Small tweaks may use one voice; phase work must use the full ritual.

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

## Project facts

### Infrastructure
- **Domains:** `streamia.co` (root, DNS only — no app), `test.streamia.co`
  (Next.js app, public-facing), `api.streamia.co` (Express backend),
  `storage.streamia.co` (MinIO S3-compatible).
- **VPS:** `2.24.220.107` (root login via SSH key at `~/.ssh/streamia_vps`,
  alias `streamia-vps` in `~/.ssh/config`).
- **Services on VPS (pm2):**
  - `streamia-api`  → port 3001 (Express, `/srv/streamia_api/`)
  - `streamia-web`  → port 3100 (Next.js standalone, `/srv/streamia-next/`)
  - Postgres 16 listening on localhost:5432 (SSH tunnel to localhost:5433 for dev)
  - MinIO on :9000 (S3 API) + :9001 (web console — not exposed)
- **Cloudflare:** proxy ON, SSL mode "Full". Caddy uses `tls internal` (self-signed) — works because CF accepts any cert in Full mode.

### Stack
- **Frontend:** Next.js 14 (App Router, React 18), Tailwind, Zustand, SWR,
  Socket.IO client, react-easy-crop, lucide-react. **No Vite, no
  react-router-dom** — `lib/router-shim.js` provides a small compat layer
  for any ported code that still imports the old names.
- **Backend:** Express + Drizzle ORM + Postgres 16 + Socket.IO + Stripe +
  MinIO (S3). All in `streamia_api/` (separate repo).
- **Auth model:** httpOnly cookies (`sl_access`, `sl_refresh`) on
  `.streamia.co` (so Next middleware on test.streamia.co reads them) +
  `Authorization: Bearer` fallback for legacy / non-browser clients.
  SameSite=Lax. Backend accepts either.

### Repos & branches
- `streamia` (frontend) — github.com/streamlinkl/streamia, branch **main**.
  Old `dev` and `next-faz-0` branches still exist but are stale; main is canonical.
- `streamia_api` (backend) — github.com/serkoceyhan/streamia_api, branch **main**.

### Deploy quick-reference

**Backend (streamia_api):**
```
cd /Users/osmanceyhan/Desktop/serko/streamia_api
rsync -az -e ssh --exclude 'node_modules' --exclude 'dist' --exclude '.env*' \
  src/ streamia-vps:/srv/streamia_api/src/
ssh streamia-vps 'cd /srv/streamia_api && npm run build && pm2 restart streamia-api'
```

**Frontend (streamia, Next.js):**
```
cd /Users/osmanceyhan/Desktop/serko/streamia
rm -rf .next && npm run build
rsync -az --delete --exclude '.env' -e ssh \
  .next/standalone/ streamia-vps:/srv/streamia-next/
rsync -az --delete -e ssh \
  .next/static/ streamia-vps:/srv/streamia-next/.next/static/
ssh streamia-vps 'pm2 restart streamia-web'
```

**Critical:** the `--exclude '.env'` on the Next.js rsync is mandatory —
`/srv/streamia-next/.env` holds the prod env (NEXT_PUBLIC_API_URL etc.)
and `rsync --delete` will wipe it without that flag.

### Test accounts (production)

- **Admin:** `serkoceyhan@gmail.com` / `Streamia2026!` (handle `serko`)
- **Demo user:** `demo@streamia.co` / `Demo2026!` (handle `demo`)
- **Lara (test customer):** `laraadrianalps@gmail.com` / `LaraTemp2026!`

DB access from local Mac:
```
ssh -L 5433:localhost:5432 -N -f streamia-vps
PGPASSWORD='98UUbwPsF9zohvLCPj8HfcwYABKdppX6' \
  psql -h localhost -p 5433 -U streamia_migrator -d streamia
```
(`streamia_migrator` = DDL user; `streamia_app` with password `U8zMHs7KTFDVRi2NN4dnEBFsTKwwBtOa` is the runtime CRUD user.)

### Caddyfile (minimal)
```
api.streamia.co     → localhost:3001 (Express)
test.streamia.co    → localhost:3100 (Next.js, everything)
storage.streamia.co → localhost:9000 (MinIO, 50 MB body limit)
```
Backup at `/etc/caddy/Caddyfile.bak.before-faz6` on the VPS.

### Migration history (Vite → Next.js, complete)

| Phase | Outcome |
|---|---|
| **Faz 0** | Next.js 14 scaffold alongside Vite; both dev servers run side-by-side |
| **Faz 1** | httpOnly cookie auth (`sl_access` / `sl_refresh` on `.streamia.co`); Bearer fallback kept |
| **Faz 2** | `/`, `/pricing`, `/u/[handle]` SSR'd in Next.js (real HTML in view-source, OG cards) |
| **Faz 3** | `middleware.js` edge auth + `app/(app)/layout.jsx` server check + `AppShell` client component |
| **Faz 4** | Feed + Profile + Network ported (SSR initial + client SWR + cookie-auth Socket.IO) |
| **Faz 5** | Remaining 12 pages mass-ported via `router-shim` + `i18n-stub`; Caddy switched to Next-default |
| **Faz 6** | Vite removed; one codebase. `src/`, `vite.config.js`, `index.html`, `pages/`, `supabase/`, `vercel.json` deleted; package.json trimmed |
| **Faz 7** | Lazy-load `ImageCropModal` (saves ~7-8 kB First Load JS on pages with upload UI); `/u/[handle]` ISR 5 min → 2 min |

### Known gotchas (debugged the hard way)

- **`acceptSession is not a function` (minified: `t is not a function`)** —
  Login/Register/RegisterCompany call `useAuthStore(s => s.acceptSession)`.
  The store MUST expose `acceptSession()` that re-fetches `/auth/me` after
  the API has set the cookies. Fixed; do not remove.
- **`postcss.config.js` must exist (CommonJS form).** Without it Next won't
  process Tailwind directives and every page renders unstyled. Same for
  `tailwind.config.js` — use `module.exports`, not `export default`,
  since package.json no longer has `"type": "module"`.
- **`rsync --delete` wipes `/srv/streamia-next/.env`** unless you pass
  `--exclude '.env'`. Always include the exclude when deploying.
- **Next middleware redirects to `localhost:3100`** unless it builds the
  URL from `X-Forwarded-Host` (Caddy header). Already handled in
  `middleware.js`; don't simplify back to `req.nextUrl.clone()`.
- **Socket.IO handshake** accepts the access token from 3 places:
  `socket.handshake.auth.token` (legacy), `Authorization` header (legacy),
  or the `sl_access` cookie (current Next.js path). Don't drop any.
- **Vite `src/pages/` no longer exists.** Old code that imports from
  `@/src/...` or `@/components/ui/...` will break — those moved to
  `components/` (top-level under streamia/) during the migration.

### Roadmap (optional polish)

- **Faz 8** — Dynamic OG image generation with `@vercel/og` (per-profile and per-post share cards).
- **Faz 9** — Real i18n: replace `lib/i18n-stub.js` with `next-intl` (TR + EN, locale-aware routes).
- **Faz 10** — CI/CD via GitHub Actions: push to `main` → rsync + pm2 restart.
- **Faz 11** — Drop `lib/router-shim.js`: rewrite ported pages to import directly from `next/link` and `next/navigation`.
- **Faz 12** — Aşamalı TypeScript migration.

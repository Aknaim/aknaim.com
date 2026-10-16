# Security & Architecture Audit

**Last updated:** October 2026  
**Scope:** Repository / application code review of Next.js (App Router) on Cloudflare Workers (OpenNext), Neon Postgres, and Cloudflare R2.  
**Not verified live:** Cloudflare WAF rules, R2 CORS JSON in the dashboard, Neon role privileges, and whether Worker secrets are currently set.

Related docs:

- [Application architecture](./application-architecture.md)
- [Development & deployment](./development-and-deployment.md)
- [Database schema](./database-schema.md)

---

## Summary

| Severity | Count |
|----------|------:|
| Critical | 0 |
| High     | 2 open (+1 mitigated) |
| Medium   | 7 |
| Low      | 3 |

**No production credentials were found in git.** `.env` is gitignored; tracked `.env.example` / `.env.docker` use local Docker placeholders only. Wrangler config exposes binding IDs (expected), not API tokens.

---

## What is already solid

- **No client secret leakage** — zero `NEXT_PUBLIC_*` credentials; R2 / Neon / admin secrets come from `process.env` / Worker secrets only.
- **ORM-parameterized SQL** — Drizzle + `@neondatabase/serverless` (HTTP) / postgres-js; gallery JSON filter *keys* are allowlisted; *values* are bound parameters.
- **TLS to Neon** — production uses the neon-http driver over HTTPS; the browser never holds `DATABASE_URL`.
- **Admin gate on mutations** — `requireAdminAction` on media / travel / climbing / courses / interests; cookie is `httpOnly`, HMAC-signed, 8h TTL, `secure` in production.
- **Fail-closed admin secrets in production** — missing/weak `ADMIN_PASSWORD` / `SESSION_SECRET` refuse login (H1 mitigated); soft per-IP login throttle.
- **Local path traversal guard** — `src/app/media/[...path]/route.ts` resolves under `LOCAL_MEDIA_ROOT`; production returns 404.
- **Gallery pagination cap** — `getGalleryPage` clamps `limit` to ≤100.

---

## Findings

### High

#### H1 — Fail-open admin defaults — mitigated

**Location:** `src/lib/auth/admin.ts`

~~If `ADMIN_PASSWORD` / `SESSION_SECRET` are missing, login falls back to `"changeme"` and signing to `"dev-secret"`.~~  
**Mitigated (2026-10):** Production requires `ADMIN_PASSWORD` (≥12, not `changeme`) and `SESSION_SECRET` (≥24, not `dev-secret`); missing/weak values fail closed. Local still allows dev defaults. Soft per-IP login throttle lives in `login-rate-limit.ts` (pair with a CF WAF rule on `/admin/login`).

#### H2 — Revalidate secret in query string + `SESSION_SECRET` reuse

**Location:** `src/app/api/revalidate-public/route.ts`

Auth accepts `?secret=` and falls back to `SESSION_SECRET`. Query secrets appear in CDN/proxy/browser history and can forge `admin_session` HMAC cookies.

**Fix:** Require a dedicated `REVALIDATE_SECRET`; accept only `Authorization: Bearer`; reject query-string auth in production. Rotate `SESSION_SECRET` if it was ever used in a URL.

#### H3 — Security headers not defined in repo

**Location:** `next.config.ts` (no `headers()`); no `middleware.ts`

CSP, HSTS, `frame-ancestors` / `X-Frame-Options`, `Referrer-Policy`, and `Permissions-Policy` are not set in code. If equivalent Cloudflare Transform Rules are already in place, downgrade this finding.

**Fix:** Add Next `headers()` and/or Cloudflare Transform Rules, at minimum:

- `Strict-Transport-Security`
- `Content-Security-Policy` (include `media.aknaim.com` for `img` / `media`)
- `frame-ancestors 'none'` (or `X-Frame-Options: DENY`)
- `Referrer-Policy: strict-origin-when-cross-origin`
- Sensible `Permissions-Policy`

---

### Medium

#### M1 — No rate limiting

**Location:** `src/lib/actions/admin/auth.ts`, `/api/revalidate-public`, `/api/gallery/*`

No lockout on admin login; public APIs can amplify Neon / Worker load.

**Fix:** Cloudflare WAF rate rules (e.g. ~5/min on `/admin/login`, ~10/min on revalidate, soft limit on gallery).

#### M2 — Error messages leak infrastructure shape

**Location:** `src/lib/actions/admin/media.ts`, `src/app/api/gallery/[interest]/route.ts`, `src/app/api/revalidate-public/route.ts`

`error.message` is returned to clients (e.g. missing env names).

**Fix:** Log full errors server-side; return stable client strings.

#### M3 — Presigned PUT TTL and MIME allowlist

**Location:** `src/lib/media/r2.ts`, `src/lib/actions/admin/media.ts`

Presigned PUTs default to 30 minutes and accept arbitrary `Content-Type` (admin-gated). With a public-read bucket, a stolen admin session can host HTML/SVG/JS on `media.aknaim.com`.

**Fix:** Allowlist `image/*` + `video/mp4` / `video/webm`; `expiresIn` ≤ 300s; block `text/html`; prefer `X-Content-Type-Options: nosniff` on the media origin.

#### M4 — Finalize accepts any `https://` URL

**Location:** `src/lib/actions/admin/media.ts` (`finalizeMediaUpload`)

Only checks `url.startsWith("https://")`, not `R2_PUBLIC_BASE_URL`.

**Fix:** Assert hostname matches `getR2PublicHostname()` (and optional local `/media` in dev).

#### M5 — Public-only R2 model

**Location:** Architecture (`R2_PUBLIC_BASE_URL` + public bucket)

Published portfolio media is intentionally public. There is no private-object / short-lived GET presign path for drafts or originals.

**Fix:** Keep public bucket for published assets; use a private bucket + GetObject presigns (60–300s) if private drafts are needed later.

#### M6 — Large Server Action body limit

**Location:** `next.config.ts` (`experimental.serverActions.bodySizeLimit: "250mb"`)

Auth-gated, but a stolen admin cookie can amplify Worker CPU/memory.

**Fix:** Cap server-action body to ~5–8mb in production; keep large uploads on R2 direct PUT only.

#### M7 — Single Neon role

**Location:** `DATABASE_URL` Worker secret

One connection string; least-privilege role split is not documented or enforced in-repo.

**Fix:** Split migrate/owner vs runtime DML roles; Worker secret = runtime only; run `db:push` with the owner URL locally/CI.

---

### Low

#### L1 — `sql.raw` for JSON filter keys

**Location:** `src/lib/db/queries/gallery.ts`

Keys are whitelisted via `JSON_FILTER_KEYS`; values are bound. Prefer a switch on known keys instead of `sql.raw` if the allowlist grows.

#### L2 — Ad hoc FormData validation

Admin actions parse strings manually; no Zod/Valibot at boundaries.

#### L3 — R2 CORS only in docs

CORS guidance lives in `.env.example`; lock `AllowedOrigins` to site origins in the R2 dashboard and document the JSON in this folder if it changes.

---

## Priority fix order

1. ~~Fail closed on missing `ADMIN_PASSWORD` / `SESSION_SECRET` in production.~~ Done (app-level); confirm Worker secrets meet length rules.
2. Dedicated `REVALIDATE_SECRET`; drop `?secret=`; rotate if ever logged.
3. Confirm or add HSTS + frame denial + CSP at Cloudflare or Next.
4. WAF rate limits on login + revalidate (app throttle is soft); sanitize API errors.
5. Harden R2 presign (TTL, MIME, finalize host check); shrink Server Action body limit.

---

## Pillar notes

### Cloudflare Workers & secrets

OpenNext Worker (`wrangler.jsonc`) uses secrets for DB/admin/R2 write keys; cache uses R2/D1/DO bindings. `global_fetch_strictly_public` is enabled. Gaps are fail-open defaults, query-string revalidate auth, and error leakage—not hardcoded production keys in the repo.

### Neon

`src/lib/db/index.ts` selects neon-http for `*.neon.tech` (TLS) and postgres-js for local Docker. Injection risk is low given Drizzle + allowlists; privilege separation is the main follow-up.

### R2

Admin → `prepareMediaUpload` → browser presigned PUT → `finalizeMediaUpload`. Direct-to-R2 is correct for video size limits. Public CDN hostname is appropriate for published media; harden upload constraints and finalize URL binding.

### Next.js / edge headers

Clean client/server split. Headers and rate limits are the main edge-hardening gap relative to the rest of the stack.

---

## Changelog

| Date | Note |
|------|------|
| 2026-10-16 | **H1 done** — production fail-closed admin secrets + soft login rate limit. Open High: H2, H3. |
| 2026-10 | Initial audit from codebase review. |

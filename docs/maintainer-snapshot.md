# Architecture & Maintainer’s Snapshot

**Last updated:** October 2026  
**Audience:** You, maintaining a small personal site built with AI assistance.

Related: [development-and-deployment](./development-and-deployment.md) · [application-architecture](./application-architecture.md) · [security-audit](./security-audit.md) · [database-schema](./database-schema.md)

**Hosting note:** Production is a **Cloudflare Worker** (OpenNext), not Cloudflare Pages. DNS/TLS are on Cloudflare; the Worker serves `aknaim.com` / `www`.

---

## 1. System map

### High-level architecture (ASCII)

```
                         Cloudflare edge (DNS + TLS)
                                    |
                    +---------------v----------------+
                    |  Worker: aknaim-com (OpenNext) |
                    |  = your Next.js App Router app |
                    +--+----------+----------+-------+
                       |          |          |
           +-----------+   +------+---+   +--+------------------+
           |               |          |   |                    |
           v               v          v   v                    v
      Neon Postgres    R2 media   R2 cache   KV INTEREST_     D1 + Durable
      (content DB)   media.aknaim  (ISR)     SETTINGS         Object queue
                     .com          binding   (cupboard shell) (OpenNext tags)
```

**What talks to what**

| Piece | Role |
|--------|------|
| Browser | HTML/JS; never holds DB or R2 write keys |
| Worker (Next.js) | SSR, Server Actions, API routes |
| Neon | Recipes, gallery rows, climbing, travel, courses, interest settings |
| R2 media bucket | Photos/videos; public URLs in `media_assets.url` |
| R2 cache / D1 / DO | OpenNext incremental cache — **not** your content DB |
| KV `INTEREST_SETTINGS` | Fast “active/dormant” shell for the home cupboard |

### Request lifecycle (ASCII sequence)

**A) Public page (e.g. `/travel` or `/gallery/travel`)**

```
Browser                Cloudflare              Worker (Next)           Neon / R2
   |                        |                        |                    |
   |-- HTTPS GET /travel -->|                        |                    |
   |                        |-- invoke Worker ------>|                    |
   |                        |                        |-- SQL (Drizzle) -->| Neon
   |                        |                        |<-- rows -----------|
   |                        |                        |  (HTML references  |
   |                        |                        |   media.aknaim.com)|
   |                        |<-- HTML response ------|                    |
   |<-- HTML ---------------|                        |                    |
   |-- GET image/video ---------------------------------------------->| R2 CDN
   |<-- bytes --------------------------------------------------------|
```

**B) Admin media upload (production)**

```
Browser (admin)         Worker                    R2                      Neon
   |                      |                        |                        |
   |-- login (password) ->| verify ADMIN_PASSWORD  |                        |
   |<- Set-Cookie --------| (HMAC session cookie)  |                        |
   |                      |                        |                        |
   |-- prepareMediaUpload |                        |                        |
   |   (Server Action) -->| requireAdmin           |                        |
   |                      |-- presign PUT -------->|                        |
   |<- uploadUrl + publicUrl                       |                        |
   |                      |                        |                        |
   |-- PUT file ---------------------------------->| (browser → R2 direct)  |
   |<- 200 ---------------|------------------------|                        |
   |                      |                        |                        |
   |-- finalizeMediaUpload|                        |                        |
   |--------------------->|-- INSERT media_assets ------------------------->|
   |                      |-- revalidatePath(...)  |                        |
```

Large videos **never** go through the Worker body; only the tiny prepare/finalize actions do.

### Where state lives

| State | Where |
|--------|--------|
| Page content (trips, recipes, gallery) | **Neon** |
| Media bytes | **R2** (`media.aknaim.com`); local disk in `next dev` |
| Interest “shell” (active/dormant note) | Neon + mirrored to **KV** for edge reads |
| Admin session | **Cookie** `admin_session` (HMAC, not in DB) |
| ISR / HTML cache | OpenNext **R2 cache + D1 tags + DO queue** |
| Nav / bag copy / some interest chrome | **Static TS** in `src/lib/data.ts` (still in code) |
| Chess / games / some course copy | Static modules under `src/lib/*` (not all DB-backed) |

### Secrets vs bindings

```
Worker secrets (wrangler secret put)     Worker bindings (wrangler.jsonc)
-------------------------------------    --------------------------------
DATABASE_URL  -----------------+         ASSETS                 (static)
ADMIN_PASSWORD                 |         WORKER_SELF_REFERENCE
SESSION_SECRET                 |         NEXT_INC_CACHE_R2_BUCKET
R2_ACCOUNT_ID                  |         INTEREST_SETTINGS (KV)
R2_ACCESS_KEY_ID               |         NEXT_TAG_CACHE_D1
R2_SECRET_ACCESS_KEY           |         NEXT_CACHE_DO_QUEUE
R2_BUCKET                      |
R2_PUBLIC_BASE_URL             |
REVALIDATE_SECRET (optional)   |
CACHE_PURGE_ZONE_ID (optional) |
CACHE_PURGE_API_TOKEN (opt.)   |
                               v
                    process.env inside Next/OpenNext
                    (never NEXT_PUBLIC_ for these)
```

Media R2 is accessed with **S3 API keys as secrets**, not an R2 *binding*. The R2 binding in `wrangler.jsonc` is only for **Next’s incremental cache**.

---

## 2. Codebase anatomy & “the magic”

### Directory map (what matters)

```
src/
  app/                 Routes (file-based). Server Components by default.
    api/               Thin HTTP: gallery paging, post-deploy revalidate
    admin/             Password admin UI + Server Actions
    gallery|travel|…   Public pages
  components/
    ui/                Small primitives (buttons, lightbox shell)
    sections/          Page-sized UI (gallery, travel, admin forms)
  lib/
    db/                Schema, Drizzle client, queries, seed  ← core data
    actions/admin/     Mutations (always call requireAdminAction)
    media/             Local vs R2 driver, presign, upload client
    cache/             Which paths to revalidate after saves
    auth/              Admin cookie HMAC
    interests/         Cupboard shell (KV + Neon)
    data.ts            Static site chrome (bags, nav) — edit carefully
    courses|chess|…    Mostly static content modules
  hooks/               Few client hooks (e.g. lightbox)
scripts/               Deploy helpers, one-off DB/R2 tools (not runtime)
open-next.config.ts    Cloudflare cache adapters
wrangler.jsonc         Worker name, routes, bindings
```

### Core logic vs safe-to-ignore noise

| Treat as **core** (learn these) | Usually **boilerplate / ignore until broken** |
|---------------------------------|-----------------------------------------------|
| `src/lib/db/*` | `cloudflare-env.d.ts` (generated types) |
| `src/lib/actions/admin/*` | `.open-next/`, `.next/` build output |
| `src/lib/media/*` | Most of `.agents/skills/` (Neon docs, not your app) |
| `src/lib/cache/*` | Huge `node_modules/` |
| `src/app/**/page.tsx` for interests you edit | Sample recipe under `src/lib/data/recipes/sample-*` |
| `wrangler.jsonc`, `open-next.config.ts`, `.env.example` | One-off `scripts/_tmp-*` reports |

### Demystifying the “magic” (plain English)

| File / pattern | What it actually is |
|----------------|---------------------|
| `src/lib/db/index.ts` | Picks Neon HTTP driver if URL looks like Neon; else local Postgres TCP. Cached on the isolate so you don’t open a client per query. |
| `getCloudflareContext` + `INTEREST_SETTINGS` | Read/write Cloudflare KV from Next code when running on the Worker. Locally KV may be missing → falls back to `siteData`. |
| `prepareMediaUpload` / `finalizeMediaUpload` | Two-step upload: server signs a short-lived R2 PUT URL; browser uploads; server inserts the public URL into Neon. |
| `revalidatePath` + OpenNext cache | “Please regenerate this page.” Without R2/D1/DO cache config, revalidate is a no-op and every hit re-SSRs (Worker CPU → Error 1102). |
| `images.unoptimized: true` | Don’t run Cloudflare Images transforms through the Worker (that used to OOM galleries). Browsers load WebP/R2 URLs as-is. |
| `skip-image-optimizer` / `?v=` on URLs | Cache-bust when an asset row’s `createdAt` changes; CDN may still hold old bytes for a few hours. |
| `requireAdminAction` | Reads `admin_session` cookie; redirects to login if HMAC invalid/expired. |
| Gallery infinite scroll | First page from SSR; more via `GET /api/gallery/[interest]?offset=` (capped at 100). |
| `src/hooks/useImageLightbox.ts` | Client-only open/close/index for the lightbox — not data fetching. |

There is **little** deep custom hook architecture. Complexity is in **media + cache + admin Server Actions**, not in React state libraries.

---

## 3. Configuration & environment map

### Local (`npm run dev` + Docker Postgres)

| Variable | Required? | Purpose |
|----------|-----------|---------|
| `DATABASE_URL` | Yes | `postgresql://aknaim:aknaim@localhost:5432/aknaim` (WSL: `host.docker.internal`) |
| `ADMIN_PASSWORD` | Yes | Admin login |
| `SESSION_SECRET` | Yes | Cookie HMAC (use a long random string) |
| `POSTGRES_*` | Docker compose | Only if you use compose’s env |
| `LOCAL_MEDIA_ROOT` | Optional | Large media library outside `public/` |
| `MEDIA_DRIVER` | Optional | Force `local` or `r2` |
| `R2_*` | Only for sync/upload tests | Same names as prod; remove write keys when done |
| `WEB_PORT` | Optional | Compose web port |

Copy from `.env.example` → `.env`. Never point local `DATABASE_URL` at Neon unless you **intend** to mutate production.

### Production (Worker secrets)

| Secret | Required? | Purpose |
|--------|-----------|---------|
| `DATABASE_URL` | Yes | Neon **pooled** URL, bare (no quotes) |
| `ADMIN_PASSWORD` | Yes | Admin login |
| `SESSION_SECRET` | Yes | Cookie + optional revalidate fallback |
| `R2_ACCOUNT_ID` | Yes (media) | Account id for S3 endpoint |
| `R2_ACCESS_KEY_ID` | Yes | R2 API token |
| `R2_SECRET_ACCESS_KEY` | Yes | R2 API secret |
| `R2_BUCKET` | Yes | e.g. `aknaim-media` |
| `R2_PUBLIC_BASE_URL` | Yes | e.g. `https://media.aknaim.com` |
| `REVALIDATE_SECRET` | Recommended | Bearer for `/api/revalidate-public` |
| `SITE_URL` | For deploy refresh script | e.g. `https://aknaim.com` |
| `CACHE_PURGE_ZONE_ID` | Optional | Zone purge after revalidate |
| `CACHE_PURGE_API_TOKEN` | Optional | Cache Purge API token |

### Bindings (not secrets — in `wrangler.jsonc`)

| Binding | Resource |
|---------|----------|
| `ASSETS` | OpenNext static assets |
| `WORKER_SELF_REFERENCE` | Self-fetch for OpenNext |
| `NEXT_INC_CACHE_R2_BUCKET` | Bucket `aknaim-next-cache` |
| `INTEREST_SETTINGS` | KV namespace |
| `NEXT_TAG_CACHE_D1` | D1 `aknaim-next-tag-cache` |
| `NEXT_CACHE_DO_QUEUE` | Durable Object queue class |

### Useful commands

```bash
npm run docker:up      # local Postgres
npm run db:push        # apply Drizzle schema to DATABASE_URL
npm run db:seed        # seed content
npm run dev
npm run deploy         # OpenNext build + deploy + refresh:public
```

---

## 4. Troubleshooting & gotchas runbook

### Gotcha 1 — Worker Error 1102 / React #412 on heavy pages

**Why:** Worker CPU/memory limit. Often: gallery SSR loading too much, CF Images transforms (removed), or cache miss storms re-SSR’ing big pages after uploads.

**Debug**

1. Reproduce URL (travel gallery, after admin upload).
2. Cloudflare → Workers → `aknaim-com` → Logs / Metrics (CPU time).
3. Confirm gallery uses paging (`getGalleryPage` / `/api/gallery/...`), not a full dump.
4. Confirm `images.unoptimized` still true; no `IMAGES` binding in `wrangler.jsonc`.
5. After admin saves, avoid blasting `revalidatePath` on every unrelated interest.

**Fix direction:** Keep pages lean; paginate; revalidate only needed paths; don’t reintroduce image optimization through the Worker.

---

### Gotcha 2 — “I saved in admin but the site still shows old content / old hero”

**Why:** Two caches: (1) OpenNext ISR (R2/D1), (2) CDN cache on `media.aknaim.com` (long `Cache-Control` on objects). Admin “refresh” revalidates HTML paths; it does **not** purge media CDN bytes. Same object key + immutable cache = stale image until URL changes (`?v=` or new key).

**Debug**

1. Check Neon row / admin list — is the DB updated?
2. Open the media URL directly — old or new bytes?
3. Hard-refresh HTML; try `/api/revalidate-public` with Bearer secret.
4. If image URL unchanged, bump via re-upload / new key or wait out CDN TTL.

**Fix direction:** New object keys for replacements; rely on `?v=` from `createdAt` where implemented; optional Cloudflare cache purge for media hostname if you need instant swaps.

---

### Gotcha 3 — Upload fails / “Network error uploading to R2” / CORS

**Why:** Browser PUTs straight to R2. Bucket CORS must allow your site origin. Wrong/missing `R2_*` secrets break presign. Worker body path still fails for large files (>~4MB guard).

**Debug**

1. Admin → upload → DevTools Network: does `prepareMediaUpload` return `uploadUrl`?
2. Does the PUT to `*.r2.cloudflarestorage.com` fail with CORS?
3. R2 bucket → Settings → CORS: origins `https://aknaim.com`, `https://www.aknaim.com` (and localhost for local R2 tests); methods `PUT, GET, HEAD`; header `Content-Type`.
4. Confirm Worker secrets include all five `R2_*` values; `R2_PUBLIC_BASE_URL` has no trailing slash issues.

**Fix direction:** Fix CORS JSON; use prepare → browser PUT → finalize; don’t route big videos through Server Actions.

---

### Bonus quick checks

| Symptom | Likely cause |
|---------|----------------|
| `Invalid URL string` in prod | `DATABASE_URL` secret wrapped in quotes |
| Admin login always fails | Wrong secret / `#` in password unquoted in `.env` |
| Local DB empty / wrong data | Pointed at Neon by mistake, or Docker not running |
| Interest bag status wrong locally | KV unavailable → static `data.ts` fallback |
| Deploy fails on AWS SDK / turbopack | Use webpack build (`next build --webpack`) as in `package.json` |

---

## Mental model (one paragraph)

You maintain **one Next.js app**. Locally it talks to **Docker Postgres** and **disk media**. In production the same code runs inside a **Cloudflare Worker**, talks to **Neon over HTTPS**, serves media from **public R2**, and uses **extra R2/D1/DO/KV bindings** only for caching and the cupboard shell. Edit content via **admin Server Actions** (or seed scripts); edit chrome/copy in **`src/lib/data.ts` and static modules**; deploy with **`npm run deploy`**. When something “doesn’t update,” ask: **DB? HTML cache? Media CDN?** — in that order.

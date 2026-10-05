# Development & Deployment

**Last updated:** October 2026

This guide explains how **aknaim.com** runs locally and in production, and how the pieces connect.

Related docs:

- [Application architecture](./application-architecture.md) — routes, data layer, admin
- [Database schema](./database-schema.md) — tables and relationships
- [DEPLOY.md](../DEPLOY.md) — short production checklist

---

## 1. Big picture

Two environments, **same Next.js app**, different hosting and database.

```mermaid
flowchart TB
  subgraph local [Local development]
    DevLaptop[Your laptop]
    NextDev["npm run dev<br/>Next.js on Node"]
    DockerPg[(Postgres in Docker)]
    PublicImages["public/images/"]
    DevLaptop --> NextDev
    NextDev --> DockerPg
    NextDev --> PublicImages
  end

  subgraph prod [Production]
    Browser[Visitor browser]
    CF[Cloudflare edge]
    Worker["Worker: aknaim-com<br/>OpenNext Next.js bundle"]
    Neon[(Neon Postgres)]
    Assets["Static assets<br/>bundled / ASSETS binding"]
    Browser -->|https://aknaim.com| CF
    CF --> Worker
    Worker -->|DATABASE_URL secret<br/>HTTP neon driver| Neon
    Worker --> Assets
  end
```

| Concern | Local | Production |
|--------|--------|------------|
| App runtime | Node (`next dev`) | Cloudflare Worker (`aknaim-com`) |
| Framework adapter | None | OpenNext (`@opennextjs/cloudflare`) |
| Database | **Docker Postgres** (`DATABASE_URL` in `.env`) | **Neon** (`DATABASE_URL` Worker secret only) |
| Env / secrets | `.env` — never point `DATABASE_URL` at Neon while developing | Wrangler secrets on the Worker |
| Domain | `http://localhost:3000` | `https://aknaim.com` + `www` |
| Images today | Admin uploads → `public/media` (local); seed/`public/images` still fine | Admin uploads → R2; `media_assets.url` is the public HTTPS URL |

**Rule:** `npm run db:seed` / `db:push` use whatever `DATABASE_URL` is in `.env`. Keep that on Docker locally. Production Neon is updated only when you intentionally set a Neon URL (or use Worker secrets + a one-off seed). See `.env.example`.

**Mental model:** Cloudflare does **not** host Node forever; OpenNext compiles the Next app into a Worker. Neon is a separate hosted Postgres. Domains are DNS + Worker custom domains, not something in React code.

---

## 2. What each piece does

```mermaid
flowchart LR
  subgraph code [This repo]
    NextApp[Next.js App Router]
    Drizzle[Drizzle schema + queries]
    WranglerCfg[wrangler.jsonc]
    NeonCfg[neon.ts]
  end

  subgraph cloudflare [Cloudflare]
    Worker[Worker aknaim-com]
    DNS[DNS + TLS]
    Secrets[Worker secrets]
  end

  subgraph neoncloud [Neon]
    Branch[Branch: production]
    PG[(Postgres)]
  end

  NextApp --> Worker
  WranglerCfg --> Worker
  Drizzle --> PG
  Secrets -->|DATABASE_URL| Worker
  Worker --> PG
  DNS --> Worker
  NeonCfg -.->|project link / policy| Branch
  Branch --> PG
```

- **Next.js** — pages, UI, server components, admin actions  
- **Drizzle** — TypeScript schema → SQL tables; queries in `src/lib/db/`  
- **OpenNext + Wrangler** — build and upload the Worker  
- **Neon** — hosted Postgres (schema via `db:push`, data via `db:seed`)  
- **Secrets** — `DATABASE_URL`, `ADMIN_PASSWORD`, `SESSION_SECRET` on the Worker  

---

## 3. Local development

### 3.1 Prerequisites

- Node.js **22.20+** (Neon CLI skills need this; app itself is fine on recent 22.x)
- npm
- Docker Desktop (for local Postgres), **or** use Neon `DATABASE_URL` from day one
- Optional: Neon CLI (`npm i -g neon@latest`) if you work against the cloud DB locally

### 3.2 One-time setup

```bash
git clone https://github.com/Aknaim/aknaim.com.git
cd aknaim.com
npm install
```

Create a **gitignored** `.env` (never commit it). Minimal shape:

```env
# Local Docker Postgres (default docker-compose.dev.yml)
POSTGRES_USER=aknaim
POSTGRES_PASSWORD=aknaim
POSTGRES_DB=aknaim
POSTGRES_PORT=5432
DATABASE_URL=postgresql://aknaim:aknaim@localhost:5432/aknaim

# Admin
ADMIN_PASSWORD=changeme-locally
SESSION_SECRET=long-random-string-here
```

**WSL note:** if Postgres runs in Docker Desktop and Next runs in WSL, use `host.docker.internal` instead of `localhost` in `DATABASE_URL`.

**Neon-as-dev:** you can put the Neon pooled `DATABASE_URL` in `.env` instead of Docker. Then skip Docker; still run `db:push` / `db:seed` against that URL.

### 3.3 Start database (Docker path)

```bash
npm run docker:up
npm run db:push
npm run db:seed
```

| Command | What it does |
|---------|----------------|
| `docker:up` | Starts Postgres 16 via `docker-compose.dev.yml` |
| `db:push` | Applies Drizzle schema to the DB in `DATABASE_URL` |
| `db:seed` | Upserts recipes, travel, climbing, gallery seed data |

### 3.4 Run the site

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```mermaid
sequenceDiagram
  participant You
  participant Next as next dev
  participant DB as Postgres Docker or Neon

  You->>Next: Edit src/... save
  Next->>Next: Hot reload
  You->>Next: GET /travel
  Next->>DB: Drizzle query
  DB-->>Next: Rows
  Next-->>You: HTML
```

### 3.5 Useful local commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Next.js dev server |
| `npm run build` / `npm start` | Production-like Node server (not Cloudflare) |
| `npm run preview` | Build with OpenNext and run **Workers** runtime locally |
| `npm run db:studio` | Drizzle Studio UI for the DB |
| `npm run db:seed` | Re-seed (safe to re-run; upserts / refreshes related rows) |
| `npm run docker:down` | Stop local Postgres |

### 3.6 Local vs Workers preview

- `npm run dev` — fastest edit loop (Node).  
- `npm run preview` — closer to production (Workerd). Use when debugging Cloudflare-only issues.

**Windows + OpenNext:** builds can be flaky. Prefer **PowerShell for Wrangler login/secrets/deploy** if WSL reuses Windows `node_modules` (workerd platform mismatch). Prefer a Linux-native `npm install` in WSL if you develop primarily there.

---

## 4. Production (Cloudflare + Neon)

### 4.1 Runtime path

```mermaid
sequenceDiagram
  participant User as Browser
  participant CF as Cloudflare
  participant W as Worker aknaim-com
  participant N as Neon Postgres

  User->>CF: https://aknaim.com/travel
  CF->>W: Invoke Worker custom domain
  Note over W: OpenNext populates process.env<br/>from Worker secrets
  W->>N: SQL over Neon HTTP
  N-->>W: Rows
  W-->>User: HTML / RSC payload
```

### 4.2 First-time production setup

Already done for this project once; keep as the checklist for a new machine/account.

```mermaid
flowchart TD
  A[Neon project + branch] --> B[db:push + db:seed using Neon URL]
  B --> C[wrangler login]
  C --> D[wrangler secret put DATABASE_URL<br/>ADMIN_PASSWORD SESSION_SECRET]
  D --> E[npm run deploy]
  E --> F[Custom domains aknaim.com + www]
  F --> G[Smoke test HTTPS pages]
```

1. **Neon** — project linked (`morning-art-…` / `production`). Pooled URL → `DATABASE_URL`.  
2. **Schema + seed** (from laptop against Neon):

   ```bash
   npm run db:push
   npm run db:seed
   ```

3. **Cloudflare auth:**

   ```bash
   npx wrangler login
   ```

4. **Worker secrets** (values only — no quotes, no `NAME=` prefix):

   ```bash
   npx wrangler secret put DATABASE_URL
   npx wrangler secret put ADMIN_PASSWORD
   npx wrangler secret put SESSION_SECRET
   ```

5. **Deploy:**

   ```bash
   npm run deploy
   ```

   This runs OpenNext build + `wrangler deploy`. Worker name: **`aknaim-com`**.

6. **Domains** — configured in `wrangler.jsonc` and the dashboard:

   - `aknaim.com`
   - `www.aknaim.com`

   Also enable **Always Use HTTPS** on the zone.

### 4.3 What `npm run deploy` builds

```mermaid
flowchart LR
  Src[src/ + public/] --> NextBuild[next build]
  NextBuild --> ON[OpenNext Cloudflare bundle]
  ON --> Out[".open-next/"]
  Out --> Wdeploy[wrangler deploy]
  Wdeploy --> Live[Worker aknaim-com]
  Cfg[wrangler.jsonc] --> Wdeploy
```

Important files:

| File | Role |
|------|------|
| `wrangler.jsonc` | Worker name, compatibility flags, assets, **custom domains** |
| `open-next.config.ts` | OpenNext Cloudflare adapter config |
| `neon.ts` | Neon project policy (empty `defineConfig({})` today) |
| `.open-next/` | Build output (gitignored) |

### 4.4 Secrets: local vs production

```mermaid
flowchart TB
  subgraph nevergit [Never commit]
    DotEnv[.env]
  end

  subgraph machine [Laptop]
    DotEnv --> Dev[npm run dev / db:*]
  end

  subgraph cf [Cloudflare Worker]
    Sec[Secrets store]
    Sec --> Prod[Deployed Worker]
  end

  NeonURL[Neon connection string] --> DotEnv
  NeonURL --> Sec
```

| Variable | Local | Production |
|----------|--------|------------|
| `DATABASE_URL` | `.env` | `wrangler secret put` |
| `ADMIN_PASSWORD` | `.env` | Worker secret |
| `SESSION_SECRET` | `.env` | Worker secret |

Updating a secret does **not** require a full code redeploy, but warm isolates may take a short time to pick up new values; a new deploy forces a clean start.

**Pitfall:** if `.env` wraps the URL in quotes (`"postgresql://..."`), strip quotes before pasting into Wrangler. Quoted secrets caused `Invalid URL string` in production.

### 4.5 Day-to-day production update

After code changes on `main`:

```bash
npm run deploy
```

Database changes:

```bash
# point DATABASE_URL at Neon
npm run db:push    # schema
npm run db:seed    # optional data refresh
```

GitHub is the source of truth for code; Cloudflare holds runtime secrets. GitHub auto-deploy (Workers Builds) is optional and not required for the site to stay live.

### 4.6 Smoke test

- https://aknaim.com  
- https://www.aknaim.com  
- `/travel`, `/climbing`, `/cooking` (need Neon + secret)  
- `/admin/login`  

---

## 5. End-to-end map (code → live page)

```mermaid
flowchart TB
  subgraph repo [GitHub Aknaim/aknaim.com]
    Pages["src/app/**/page.tsx"]
    Queries["src/lib/db/queries/*"]
    Schema["src/lib/db/schema"]
    Images["public/images"]
  end

  Pages --> Queries
  Queries --> Schema

  subgraph build [Deploy machine]
    DeployCmd["npm run deploy"]
  end

  repo --> DeployCmd
  DeployCmd --> Worker

  subgraph live [Internet]
    Domains["aknaim.com / www"]
    Worker[Worker]
    Neon[(Neon)]
  end

  Domains --> Worker
  Worker --> Queries
  Worker --> Neon
  Worker --> Images
  Schema -.->|db:push once / when schema changes| Neon
```

---

## 6. Troubleshooting

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| Travel/cooking 500, `Invalid URL string` | Bad `DATABASE_URL` secret (quotes / empty) | Re-put secret with bare `postgresql://…` URL |
| Travel/cooking 500, `Failed query` | Old TCP driver / unreachable DB | App uses Neon HTTP driver; confirm secret + Neon project awake |
| `workerd-windows` vs `linux` in WSL | Shared Windows `node_modules` | Use PowerShell deploy, or reinstall deps in Linux |
| `www` NXDOMAIN | No DNS for www | Custom domain on Worker (preferred) or DNS + redirect |
| `www` 522 | DNS exists but hostname not on Worker | Add `www.aknaim.com` custom domain |
| Browser “Not secure” | Visiting `http://` | Always Use HTTPS; open `https://` |
| OpenNext / OneDrive `.env` read errors | File lock / UNKNOWN read | Move `.env` aside for build only; secrets still from Wrangler at runtime |

---

## 7. What’s intentionally not production yet

- **R2 bucket + secrets** — admin upload code is in place (`R2_*` env vars); create the bucket, public URL, and Worker secrets before production uploads work  
- **GitHub → Cloudflare auto-deploy** — manual `npm run deploy` today  
- **Hyperdrive** — optional pooling layer in front of Neon  

When those land, update this doc’s diagrams in the production section.

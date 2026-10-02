# aknaim.com

Personal portfolio site — Next.js App Router, Neon Postgres, Cloudflare Workers (OpenNext).

## Documentation

| Doc | What it’s for |
|-----|----------------|
| **[Development & deployment](docs/development-and-deployment.md)** | **Start here** — local run, production deploy, end-to-end diagrams |
| [Application architecture](docs/application-architecture.md) | Routes, data layer, admin, media |
| [Database schema](docs/database-schema.md) | Tables, relationships, ER diagrams |
| [DEPLOY.md](DEPLOY.md) | Short production checklist |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Original UI / design blueprint |

## Quick start (local)

```bash
npm install
npm run docker:up    # local Postgres
npm run db:push
npm run db:seed
npm run dev          # http://localhost:3000
```

Use a gitignored `.env` for `DATABASE_URL`, `ADMIN_PASSWORD`, and `SESSION_SECRET`. Details and Neon-as-dev options: [development-and-deployment.md](docs/development-and-deployment.md).

## Production

Live at **https://aknaim.com** (Worker `aknaim-com` + Neon).

```bash
npx wrangler login
npx wrangler secret put DATABASE_URL   # etc.
npm run deploy
```

Full flow, secrets, domains, and diagrams: [development-and-deployment.md](docs/development-and-deployment.md).

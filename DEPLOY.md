# Deploy checklist (Cloudflare)

Short operational list. For diagrams and local vs production explanation, see **[docs/development-and-deployment.md](docs/development-and-deployment.md)**.

## Prerequisites

- Neon project linked; schema applied (`npm run db:push`) and seeded if needed
- Cloudflare account owning `aknaim.com`
- Node on Windows PowerShell recommended for Wrangler/OpenNext if WSL `node_modules` mismatch

## Steps

```bash
npx wrangler login

npx wrangler secret put DATABASE_URL    # bare URL, no quotes
npx wrangler secret put ADMIN_PASSWORD
npx wrangler secret put SESSION_SECRET

npm run deploy
```

Custom domains (`aknaim.com`, `www.aknaim.com`) are declared in `wrangler.jsonc` and applied on deploy.

Enable **Always Use HTTPS** on the Cloudflare zone.

## Smoke test

- https://aknaim.com / https://www.aknaim.com
- `/travel`, `/climbing`, `/cooking`
- `/admin/login`

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Local Next (Node) |
| `npm run preview` | Workers runtime locally |
| `npm run deploy` | OpenNext build + Cloudflare deploy |

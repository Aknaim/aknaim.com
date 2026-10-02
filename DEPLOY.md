# Deploy aknaim.com on Cloudflare

Goal: public site on Workers via OpenNext, domain `aknaim.com`, Postgres on Neon (free), media later on R2.

OpenNext on Windows can be flaky — prefer **WSL** for `npm run deploy` if builds fail.  
If `.env` is on OneDrive and builds fail with `UNKNOWN: read`, temporarily move `.env` aside for the build (runtime secrets go in Wrangler, not the build).

## Status in repo

- OpenNext + Wrangler configured (`wrangler.jsonc`, `npm run deploy`)
- Next.js upgraded for OpenNext peer range
- `next build` for Workers succeeds; **you** must log in and finish deploy

## 1. Hosted Postgres (required for travel/climbing/cooking)

Workers cannot use your laptop Docker DB.

1. Create a free project at [neon.tech](https://neon.tech).
2. Copy the connection string (`DATABASE_URL`).
3. Locally (with that URL in `.env`):

```bash
npm run db:push
npm run db:seed
```

## 2. Cloudflare login (your machine)

In a normal terminal (interactive):

```bash
npx wrangler login
```

Complete the browser auth for the account that owns `aknaim.com`.

## 3. Set Worker secrets

```bash
npx wrangler secret put DATABASE_URL
npx wrangler secret put ADMIN_PASSWORD
npx wrangler secret put SESSION_SECRET
```

Use a strong `ADMIN_PASSWORD` / `SESSION_SECRET` in production (not `changeme`).

## 4. Deploy

```bash
npm run deploy
```

Note the `*.workers.dev` URL Wrangler prints.

**Worker size:** Free plan allows ~3 MiB gzipped. If deploy fails on size, upgrade to **Workers Paid (~US$5/mo)** — common for Next.js apps.

## 5. Attach the domain

Cloudflare dashboard → **Workers & Pages** → `aknaim-com` → **Settings** → **Domains & Routes** / **Custom Domains**:

- Add `aknaim.com`
- Add `www.aknaim.com` (or redirect www → apex)

TLS is automatic.

## 6. Smoke-test

- `https://aknaim.com` — home
- `/about`
- `/travel`, `/climbing`, `/cooking` — need Neon seeded + `DATABASE_URL` secret

## Later

- R2 + admin upload for real media
- GitHub auto-deploy on push
- Hyperdrive in front of Neon

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Local Next (Node) |
| `npm run preview` | Workers runtime locally |
| `npm run deploy` | Build + deploy to Cloudflare |

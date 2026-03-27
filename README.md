# MbomSign Coming Soon

Under-construction landing page for **MbomSign** with email waitlist capture.

## Stack

- React + Vite (frontend)
- Express (API for email capture)
- JSON file persistence at `data/subscribers.json`
- Docker + Docker Compose (Dokploy friendly)

## Run locally

```bash
npm install
npm run dev
```

- Frontend: `http://localhost:5173`
- API: `http://localhost:4000/api/health`

Only **`/`** serves the coming-soon app; paths like `/anything-else` return **404** (same as production). API and `/waitlist-admin` still work via proxy.

## Build and run production

```bash
npm run build
npm start
```

## Make Commands (recommended)

```bash
make fresh
```

This runs all startup steps in one command:

- install dependencies
- ensure `data/subscribers.json` exists
- build frontend
- start production server

Other useful commands:

- `make dev` - local dev mode (frontend + API)
- `make lint` - run lint checks
- `make docker-up` - build and run with Docker Compose
- `make docker-down` - stop Docker Compose services
- `make docker-logs` - stream Docker logs

## Docker Compose

```bash
docker compose up -d --build
```

App runs on `http://localhost:4000`.

## Email storage

Captured emails are stored in:

- `data/subscribers.json`

Each record includes:

- `email`
- `createdAt`
- `source`

## Waitlist admin

Protected with **HTTP Basic Auth**. Set a long random value in **`SUBSCRIBERS_ADMIN_SECRET`** (that value is the **password**). Optional **`WAITLIST_ADMIN_USER`** defaults to **`admin`**.

| What | How |
|------|-----|
| **Dashboard** (table, refresh, reset) | Open **`/waitlist-admin`** in the browser — e.g. `https://mbomsign.com/waitlist-admin` or `http://localhost:4000/waitlist-admin` (with Vite dev, use `http://localhost:5173/waitlist-admin`; it is proxied to the API). |
| **List subscribers (JSON)** | `GET /api/waitlist-admin/subscribers` — same Basic Auth as above. |
| **Clear all subscribers** | `POST /api/waitlist-admin/reset` — same Basic Auth. Example: `curl -u admin:YOUR_SECRET -X POST https://mbomsign.com/api/waitlist-admin/reset` |

If **`SUBSCRIBERS_ADMIN_SECRET`** is unset, these routes respond with **503**. Wrong credentials get **401** and the browser or `curl` will ask again for user/password.

Generate a secret, for example: `openssl rand -base64 32`.

## SMTP Welcome Emails

When a user subscribes, MbomSign can send an automatic branded welcome email.

1. Copy `.env.example` into `.env` (or set env vars in Dokploy).
2. Fill in SMTP values:
   - `SMTP_HOST`
   - `SMTP_PORT`
   - `SMTP_USER`
   - `SMTP_PASS`
   - `SMTP_ENCRYPTION` (`TLS`, `SSL`, or leave empty for provider default)
   - `SMTP_FROM` (sender, e.g. `MbomSign <noreply@mbomsign.com>`)
   - Optional: `SMTP_SECURE`, `SMTP_REQUIRE_TLS`, `SMTP_DEBUG`
3. Restart the app.

If SMTP is not configured, subscriptions are still saved but email sending is skipped.

**SMTP2GO / verified senders:** Many providers return `550` if the address in `SMTP_FROM` uses a domain that is not verified. In SMTP2GO, open **Sending → Verified Senders** and verify **mbomsign.com** (or the domain you use in `SMTP_FROM`), or temporarily set `SMTP_FROM` to an address on a domain you have already verified (for example your company domain).

## Deploy with Dokploy + Cloudflare

1. Create app in Dokploy from this repo/folder.
2. Use `docker-compose.yml` as deployment source.
3. Ensure Traefik external network exists in Dokploy (default expected: `dokploy-network`).
4. Map custom domain `mbomsign.com` in Dokploy.
5. In Cloudflare, point DNS (A/AAAA/CNAME depending on your server) to Dokploy host.
6. Enable SSL in Cloudflare and ensure Dokploy has HTTPS enabled.

### Traefik notes

- In Dokploy, prefer the Domain UI for routing (Host + Path + Container Port).
- Do not duplicate custom Traefik router labels in `docker-compose.yml` when Domain UI is enabled.
- Container port for this app is `4000`.

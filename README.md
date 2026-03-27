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

## SMTP Welcome Emails

When a user subscribes, MbomSign can send an automatic branded welcome email.

1. Copy `.env.example` into `.env` (or set env vars in Dokploy).
2. Fill in SMTP values:
   - `SMTP_HOST`
   - `SMTP_PORT`
   - `SMTP_SECURE`
   - `SMTP_USER`
   - `SMTP_PASS`
   - `MAIL_FROM`
3. Restart the app.

If SMTP is not configured, subscriptions are still saved but email sending is skipped.

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

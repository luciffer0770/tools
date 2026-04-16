# CropBank

CropBank is a **mobile-first** web simulation where crops behave like tradable assets. Virtual cash, synthetic news, and a soft-capped price engine power the experience. This is a game, not a real trading platform.

## Stack

- **Frontend:** React (Vite), Tailwind CSS, Zustand, Recharts, PWA (vite-plugin-pwa)
- **Backend:** Node.js, Express, better-sqlite3, bcrypt, JWT, Socket.io

## Quick start

### 1. Install dependencies

```bash
npm run install:all
```

Or install each package:

```bash
cd backend && npm install
cd ../frontend && npm install
```

### 2. Run the API

```bash
cd backend
npm run dev
```

The API listens on **http://localhost:4000** and seeds sample crops on first boot. SQLite files are stored under `backend/data/`.

Optional environment variables:

- `PORT` — API port (default `4000`)
- `CLIENT_ORIGIN` — CORS origin(s), comma-separated (default `http://localhost:5173`)
- `CROPBANK_ALLOW_TUNNEL=1` — allow `*.trycloudflare.com` and `*.loca.lt` origins (dev tunnels)
- `JWT_SECRET` — signing secret for access tokens (**set in production**)
- `JWT_EXPIRES` — token lifetime (default `7d`)
- `BCRYPT_ROUNDS` — bcrypt cost factor (default `10`)

### 3. Run the web app

```bash
cd frontend
npm run dev
```

Open **http://localhost:5173**. The Vite dev server proxies `/api` and `/socket.io` to the backend.

**Guest / login returns 404:** The running Node process is probably an old build. Stop it, `cd backend && npm run dev` again from this repo. If you open the app without Vite’s proxy (e.g. `file://` or a static host), create `frontend/.env.local` with:

`VITE_API_URL=http://localhost:4000/api`

(copy from `frontend/.env.example`), restart `npm run dev` in `frontend/`, and ensure `CLIENT_ORIGIN` on the API includes your dev URL.

### 4. Production build (frontend)

```bash
npm run build:frontend
```

Serve the `frontend/dist` folder behind HTTPS for full PWA install support. Point `CLIENT_ORIGIN` at your deployed origin and configure your host to proxy `/api` and WebSocket traffic to the Node server.

## Database migrations

On every server start, `runMigrations()` in `backend/db/migrate.js` applies versioned schema upgrades to the existing SQLite file:

- Adds `email`, `password_hash`, `settings_json`, `last_daily_reward_at`, `tutorial_step` to `users` when missing.
- Adds `avg_cost_basis` to `holdings`.
- Creates `watchlist`, `portfolio_snapshots`, and `achievements` tables.

**Legacy installs** (users created before JWT): rows without email receive `migrated-<userId>@cropbank.local` and password **`CropBank2024!`** so they can sign in and then change credentials via a future profile flow.

## Game flow

1. **Register / Login** — email + password; JWT stored in `localStorage`.
2. **Tutorial** — guided overlay, $100 practice balance; finish or skip restores **$1000** and unlocks the app.
3. **Main app** — Dashboard, Markets, Trade (sidebar on desktop), Portfolio, Watchlist, News, Research, Settings. Floating **AI assistant** uses rule-based `/ai/query`.

## API

Base path: `/api`

| Method | Path | Auth |
|--------|------|------|
| POST | `/auth/register` | Body `{ email, password, username? }` → `{ token, user }` |
| POST | `/auth/login` | Body `{ email, password }` → `{ token, user }` |
| POST | `/auth/guest` | No body — creates a throwaway guest user → `{ token, user }` |
| GET | `/me` | `Authorization: Bearer <jwt>` |
| GET | `/crops` | Public |
| GET | `/crops/:id` | Public |
| GET | `/history/:cropId` | Public |
| GET | `/portfolio` | Bearer |
| POST | `/buy` | Bearer, `{ cropId, quantity }` |
| POST | `/sell` | Bearer, `{ cropId, quantity }` |
| GET | `/watchlist` | Bearer |
| POST | `/watchlist/add` | Bearer, `{ cropId }` |
| POST | `/watchlist/remove` | Bearer, `{ cropId }` |
| GET | `/research` | Public |
| POST | `/ai/query` | Bearer, `{ message }` |
| GET | `/settings` | Bearer (returns user incl. settings) |
| PATCH | `/settings` | Bearer, `{ theme?, soundEnabled?, notificationsEnabled? }` |
| POST | `/settings/reset-game` | Bearer |
| POST | `/settings/daily-reward` | Bearer |
| GET | `/news` | Public |
| POST | `/tutorial/start` | Bearer |
| POST | `/tutorial/complete` | Bearer |
| POST | `/tutorial/skip` | Bearer |
| POST | `/tutorial/step` | Bearer, `{ step }` |

Socket.io: connect with `auth: { token: "<jwt>" }` (or Bearer header) for future user-scoped channels; public broadcasts still emit `crops` and `news`.

## Project layout

```
backend/   Express API, SQLite, engines, services
frontend/  Vite React client, PWA, Zustand
```

## License

Provided as sample application code for the CropBank exercise.

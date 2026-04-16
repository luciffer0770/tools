# CropBank

CropBank is a **mobile-first** web simulation where crops behave like tradable assets. Virtual cash, synthetic news, and a soft-capped price engine power the experience. This is a game, not a real trading platform.

## Stack

- **Frontend:** React (Vite), Tailwind CSS, Zustand, Recharts, PWA (vite-plugin-pwa)
- **Backend:** Node.js, Express, better-sqlite3, Socket.io

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
- `CLIENT_ORIGIN` — CORS origin for browser clients (default `http://localhost:5173`)

### 3. Run the web app

```bash
cd frontend
npm run dev
```

Open **http://localhost:5173**. The Vite dev server proxies `/api` and `/socket.io` to the backend.

### 4. Production build (frontend)

```bash
npm run build:frontend
```

Serve the `frontend/dist` folder behind HTTPS for full PWA install support. Point `CLIENT_ORIGIN` at your deployed origin and configure your host to proxy `/api` and WebSocket traffic to the Node server.

## Game flow

1. **Landing** — mock login (creates a SQLite user).
2. **Tutorial** — practice balance **$100**; finishing resets to **$1000** and unlocks the app.
3. **Dashboard / Markets / Trade / News / Profile** — bottom navigation on phones, sidebar on large screens.

## API

Base path: `/api`

| Method | Path | Notes |
|--------|------|--------|
| POST | `/login` | Body `{ "username": "..." }` — returns `user` with `id` |
| GET | `/me` | Header `X-User-Id` |
| GET | `/crops` | All crops |
| GET | `/crops/:id` | Single crop |
| GET | `/history/:cropId` | Price ticks |
| GET | `/portfolio` | Header `X-User-Id` |
| POST | `/buy` | `{ cropId, quantity }` + `X-User-Id` |
| POST | `/sell` | `{ cropId, quantity }` + `X-User-Id` |
| GET | `/news` | Recent headlines |
| POST | `/tutorial/start` | Sets balance to $100 (once) |
| POST | `/tutorial/complete` | Sets balance to $1000, marks tutorial done |

Real-time crop and news updates are pushed over **Socket.io** (`crops`, `news` events).

## Project layout

```
backend/   Express API, SQLite, engines
frontend/  Vite React client, PWA, Zustand
```

## License

Provided as sample application code for the CropBank exercise.

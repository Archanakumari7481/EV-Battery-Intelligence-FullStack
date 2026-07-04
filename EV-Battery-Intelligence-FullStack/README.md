# EV Battery Intelligence Dashboard — Full Stack Application

A production-ready fleet diagnostics platform for monitoring EV battery health, charging behavior, predictive maintenance, and real-time telemetry across a vehicle fleet.

```
EV-Battery-Intelligence-FullStack/
├── frontend/     React (Vite) dashboard — connected to the backend
└── backend/      Node.js + Express + MongoDB + Socket.io API
```

---

## Prerequisites

1. **Node.js** v18 or later — [nodejs.org](https://nodejs.org)
2. **MongoDB** — either:
   - **MongoDB Atlas** (recommended) — free cloud database, only a connection string is required
   - **Local MongoDB** — [MongoDB Community Server](https://www.mongodb.com/try/download/community)

---

## Getting Started

Open this folder in VS Code (`File → Open Folder → EV-Battery-Intelligence-FullStack`). You will need two terminal sessions — use `Ctrl + Shift + \`` in VS Code to split the terminal.

### Terminal 1 — Backend

```bash
cd backend
npm install
cp .env.example .env
```

Open `backend/.env` and set `MONGO_URI` to your MongoDB Atlas connection string (or leave the default if running MongoDB locally).

```bash
npm run seed
npm run dev
```

Expected output:
```
✅ MongoDB Connected
🚀 EV Battery Intelligence API running on http://localhost:5000
📘 Swagger docs available at http://localhost:5000/api-docs
```

### Terminal 2 — Frontend

```bash
cd frontend
npm install
npm run dev
```

Open the printed local URL (typically `http://localhost:5173`) in your browser.

---

## Login

- **Email:** `admin@evfleet.com`
- **Password:** `admin123`

This account is created automatically by `npm run seed` in the backend.

Once logged in, the dashboard loads live data from the backend, with health, temperature, and alert metrics updating in real time via Socket.io.

---

## Architecture Notes

No existing page component (`Dashboard`, `BatteryHealth`, `ChargeHistory`, `FleetMap`, `Maintenance`, `RangePredictor`, `Settings`, `Layout`) was modified, to avoid any risk of breaking existing UI or logic.

The following were added to connect the frontend to the backend:

| File | Purpose |
|---|---|
| `src/lib/api.js` | REST client with JWT token handling |
| `src/lib/socket.js` | Socket.io connection for real-time updates |
| `src/lib/transform.js` | Maps backend response shapes to the shapes the existing pages expect |
| `src/Login.jsx` | Login screen for backend JWT authentication |
| `.env` | Backend URLs (`VITE_API_URL`, `VITE_SOCKET_URL`) |

`src/App.jsx` was modified to:
- Fetch live data from `/api/vehicles`, `/api/alerts`, `/api/settings`, and `/api/maintenance/recommendations` instead of the static `mockData.js`
- Remove the client-side `setInterval` simulations (health/temperature/alert fluctuation) — this simulation now runs on the backend and is pushed via Socket.io
- Add login/logout flow

---

## Troubleshooting

| Problem | Solution |
|---|---|
| "Could not connect to backend" screen | Confirm the backend is running (`npm run dev` in the `backend` terminal, no errors) |
| MongoDB connection error | Verify `MONGO_URI` in `backend/.env` |
| Login fails | Confirm `npm run seed` was run in the backend |
| CORS error in browser console | `backend/.env`'s `CLIENT_ORIGIN` must match the frontend's actual port |
| Port already in use | Change `PORT` in `backend/.env`, and update `VITE_API_URL` / `VITE_SOCKET_URL` in `frontend/.env` accordingly |

For the full API reference, Swagger documentation, and Postman collection, see `backend/README.md`.

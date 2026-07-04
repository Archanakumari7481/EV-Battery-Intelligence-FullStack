# EV Battery Intelligence Dashboard — Backend API

Production-level backend banaya gaya hai tumhare **EV Battery Intelligence Dashboard** React frontend ke liye.
Node.js + Express + MongoDB + JWT Auth + Socket.io (real-time) + Swagger Docs + Postman Collection — sab ready hai.

---

## 📁 Folder Structure

```
ev-battery-backend/
├── server.js                      # Entry point (yahi se sab start hota hai)
├── package.json
├── .env.example                   # copy this to .env
├── EV-Battery-Intelligence.postman_collection.json   # import this in Postman
├── src/
│   ├── app.js                     # Express app setup (middleware + routes)
│   ├── config/
│   │   ├── db.js                  # MongoDB connection
│   │   └── swagger.js             # Swagger/OpenAPI config
│   ├── models/                    # Mongoose schemas (database tables)
│   │   ├── User.js
│   │   ├── Vehicle.js
│   │   ├── Alert.js
│   │   ├── ChargeSession.js
│   │   ├── Recommendation.js
│   │   └── Settings.js
│   ├── controllers/                # Business logic
│   ├── routes/                     # API endpoints + Swagger docs
│   ├── middleware/
│   │   ├── auth.js                # JWT protect + role check
│   │   ├── error.js               # Central error handler
│   │   └── asyncHandler.js
│   ├── sockets/
│   │   ├── index.js                # Socket.io connection handler
│   │   └── telemetryEngine.js      # Live telemetry simulation (real-time push)
│   ├── utils/
│   └── seed/
│       └── seed.js                # Fills DB with the same demo data your frontend had
```

---

## 🧠 STEP 1 — Maine tumhara frontend analyze kiya (Summary)

Tumhara frontend abhi **pure client-side** hai — `src/data/mockData.js` se data aata hai aur
`setInterval()` se fake real-time simulate hota hai. Koi `fetch`/`axios` call nahi thi.

Maine yeh cheeze identify ki:

| Frontend Page | Data Needed | Backend Module |
|---|---|---|
| Dashboard | Fleet summary, avg health, alerts count | `/vehicles/summary`, `/alerts` |
| BatteryHealth | Per-vehicle SOH, temp, voltage, cycles, degradation chart | `/vehicles`, `/vehicles/:id/degradation` |
| ChargeHistory | Session logs, weekly frequency, duration trend | `/charge-sessions/*` |
| RangePredictor | SOC/temp → predicted range | `/range-predictions` |
| FleetMap | Vehicle GPS location | `/vehicles` (has `location.lat/lng`) |
| Maintenance | AI repair recommendations | `/maintenance/recommendations` |
| Settings | Thresholds + toggles form, CSV/PDF export | `/settings`, `/reports/csv`, `/reports/pdf` |
| (New) Login | Tumne mangwaya tha, frontend mein abhi nahi tha | `/auth/register`, `/auth/login` |

Har ek ke liye maine real REST API + MongoDB model bana diya hai — bilkul same field names jo
tumhare `mockData.js` mein the, taaki frontend connect karna easy ho.

---

## 🛠 STEP 2 — Apne computer mein setup karo (ekdum easy steps)

### 2.1 — MongoDB install karo (agar nahi hai)
- **Easy option (recommended):** [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) pe free account banao,
  ek free cluster banao, aur "Connect → Drivers" se connection string copy karo.
- **Local option:** [MongoDB Community Server](https://www.mongodb.com/try/download/community) install karo apne PC pe.

### 2.2 — Backend folder kholo terminal mein
```bash
cd ev-battery-backend
npm install
```
Yeh sab packages (express, mongoose, jwt, socket.io, swagger, etc.) install kar dega.

### 2.3 — `.env` file banao
`.env.example` file ko copy karke naam `.env` rakho:
```bash
cp .env.example .env
```
Ab `.env` file kholo aur yeh values apni values se replace karo:
```
MONGO_URI=mongodb://127.0.0.1:27017/ev_battery_dashboard
JWT_SECRET=koi_bhi_lambi_random_secret_string_daal_do
CLIENT_ORIGIN=http://localhost:5173
```
(Agar MongoDB Atlas use kar rahe ho, to `MONGO_URI` wahan se copy kiya hua connection string daalo)

### 2.4 — Database mein demo data daalo (seed)
```bash
npm run seed
```
Yeh EV-001 se EV-004 tak sab vehicles, alerts, charge sessions, aur ek demo login
(`admin@evfleet.com` / `admin123`) database mein daal dega — bilkul tumhare frontend jaisa data.

### 2.5 — Server start karo
```bash
npm run dev
```
Agar sab sahi hua to terminal mein dikhega:
```
✅ MongoDB Connected
🚀 EV Battery Intelligence API running on http://localhost:5000
📘 Swagger docs available at http://localhost:5000/api-docs
```

---

## 📘 STEP 3 — Swagger API Documentation dekho

Server chalu hone ke baad browser mein kholo:
```
http://localhost:5000/api-docs
```
Yahan tumhe sab APIs interactive form mein dikhenge — directly test bhi kar sakte ho, "Try it out" button se.
(Sabse pehle `/auth/login` chalao, token copy karo, upar "Authorize" button mein paste karo, phir baaki APIs try karo.)

---

## 📮 STEP 4 — Postman Collection import karo

1. Postman kholo
2. **Import** button dabao
3. Is file ko select karo: `EV-Battery-Intelligence.postman_collection.json`
4. Sabse pehle **Auth → Login** request chalao — token automatically save ho jayega baaki requests ke liye
5. Ab koi bhi API try kar sakte ho — Vehicles, Alerts, Charge History, Range Predictor, Maintenance, Settings, Reports

---

## 🔌 STEP 5 — Frontend already connected hai ✅

Tumhara **frontend project already modified** hai (`App.jsx` + naye `src/lib/api.js`, `src/lib/socket.js`,
`src/lib/transform.js`, `src/Login.jsx` files) — tumhe kuch bhi manually likhna ya copy-paste karna
**NAHI** hai. Bas frontend folder mein jaake:

```bash
cd EV-battery-intelligence-dashboard-main
npm install
npm run dev
```

Frontend `.env` (already bana hua hai, `EV-battery-intelligence-dashboard-main/.env`):
```
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

Frontend kholte hi ek **Login page** dikhega — demo credentials already fill kiye hue hain
(`admin@evfleet.com` / `admin123`, jo `npm run seed` se backend mein bana hai). Login karte hi
poora dashboard **real backend data** se load hoga, aur Socket.io se live updates (health, temp,
alerts) automatically aate rahenge — bilkul pehle jaise dikhta tha, bas ab data fake nahi, real hai.

Neeche bottom-left corner mein ek chhota **"Logout"** button bhi hai.

---

## 🔑 API Endpoints — Full List

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | New account banao |
| POST | `/api/auth/login` | Login + JWT token lo |
| GET | `/api/auth/me` | Apna profile dekho |
| GET | `/api/vehicles` | Sab vehicles list |
| GET | `/api/vehicles/summary` | Fleet dashboard stats |
| GET | `/api/vehicles/:id` | Ek vehicle ka detail |
| POST | `/api/vehicles` | Naya vehicle add karo |
| PATCH | `/api/vehicles/:id` | Telemetry update karo |
| PATCH | `/api/vehicles/:id/isolate` | Vehicle ko grid se isolate karo |
| DELETE | `/api/vehicles/:id` | Vehicle remove karo |
| GET | `/api/vehicles/:id/degradation` | 12-month capacity trend |
| GET | `/api/alerts` | Live alerts feed |
| POST | `/api/alerts` | Naya alert banao |
| GET | `/api/alerts/stats` | Severity-wise count |
| PATCH | `/api/alerts/:id/acknowledge` | Alert acknowledge karo |
| POST | `/api/alerts/notify-technician` | Technician ko notify karo |
| GET | `/api/charge-sessions` | Charging logs |
| POST | `/api/charge-sessions` | Naya session log karo |
| GET | `/api/charge-sessions/frequency` | Weekly charge frequency |
| GET | `/api/charge-sessions/duration-trend` | DC vs AC duration trend |
| GET | `/api/range-predictions` | Har vehicle ka predicted range |
| POST | `/api/range-predictions/calculate` | Custom range calculate karo |
| GET | `/api/maintenance/recommendations` | AI maintenance suggestions |
| POST | `/api/maintenance/recommendations` | Naya suggestion add karo |
| PATCH | `/api/maintenance/recommendations/:id` | Update karo |
| DELETE | `/api/maintenance/recommendations/:id` | Delete karo |
| GET | `/api/settings` | Alert thresholds dekho |
| PUT | `/api/settings` | Thresholds save karo |
| GET | `/api/reports/csv` | Fleet report CSV download |
| GET | `/api/reports/pdf` | Fleet report PDF download |

Sab routes (auth ke alawa) `Authorization: Bearer <token>` header maangte hain.

---

## ⚡ Real-time (Socket.io) Events

Backend har 5-8 second mein automatically data update karta hai (jaise pehle frontend ke andar
`setInterval` karta tha) aur yeh events emit karta hai:

| Event | Kab fire hota hai |
|---|---|
| `vehicle:update` | Kisi vehicle ki SOH/temp/SOC change hui |
| `alert:new` | Naya alert generate hua |
| `technician:notified` | Technician ko notify kiya gaya |
| `recommendation:new` / `recommendation:update` | Maintenance suggestion add/update hua |
| `settings:update` | Thresholds change hue |

`.env` mein `SIMULATE_TELEMETRY=false` karke isse band bhi kar sakte ho (agar real IoT devices se
data aayega to simulation ki zaroorat nahi).

---

## 🔒 Security Features Included

- Password hashing with **bcrypt**
- **JWT** authentication with expiry
- **helmet** for HTTP security headers
- **express-rate-limit** to prevent abuse
- Centralized error handling (no raw stack traces in production)
- Input validation on all models (Mongoose schema validation)
- Role-based access control (admin / fleet_manager / technician / viewer)

---

## 🚀 Deployment Tips

- Backend ko **Render**, **Railway**, ya **Vercel (serverless)** pe deploy kar sakte ho — sirf `.env`
  variables set karne honge (`MONGO_URI`, `JWT_SECRET`, `CLIENT_ORIGIN`).
- MongoDB ke liye **MongoDB Atlas** free tier production ke liye bhi kaafi hai shuru mein.
- Production mein `NODE_ENV=production` set karna mat bhoolna — isse error stack traces hide ho jayenge.

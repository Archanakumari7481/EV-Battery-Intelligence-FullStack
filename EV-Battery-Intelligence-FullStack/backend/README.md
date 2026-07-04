# EV Battery Intelligence Dashboard — Backend API

A production-level backend for the EV Battery Intelligence Dashboard. Built with Node.js, Express, MongoDB, JWT authentication, and Socket.io for real-time updates. Includes Swagger/OpenAPI documentation and a ready-to-use Postman collection.

---

## Folder Structure

```
backend/
├── server.js                      # Entry point
├── package.json
├── .env.example                    # copy to .env
├── EV-Battery-Intelligence.postman_collection.json
├── src/
│   ├── app.js                      # Express app setup (middleware + routes)
│   ├── config/
│   │   ├── db.js                   # MongoDB connection
│   │   └── swagger.js              # Swagger/OpenAPI config
│   ├── models/                     # Mongoose schemas
│   │   ├── User.js
│   │   ├── Vehicle.js
│   │   ├── Alert.js
│   │   ├── ChargeSession.js
│   │   ├── Recommendation.js
│   │   └── Settings.js
│   ├── controllers/                # Business logic
│   ├── routes/                     # API endpoints + Swagger docs
│   ├── middleware/
│   │   ├── auth.js                 # JWT protect + role check
│   │   ├── error.js                 # Central error handler
│   │   └── asyncHandler.js
│   ├── sockets/
│   │   ├── index.js                 # Socket.io connection handler
│   │   └── telemetryEngine.js       # Live telemetry simulation engine
│   ├── utils/
│   └── seed/
│       └── seed.js                  # Populates the database with demo fleet data
```

---

## Data Model Summary

The backend was designed by analyzing the original frontend (`Dashboard`, `BatteryHealth`, `ChargeHistory`, `RangePredictor`, `FleetMap`, `Maintenance`, `Settings` pages) and mapping each page's data requirements to a corresponding API module:

| Frontend Page | Data Required | Backend Module |
|---|---|---|
| Dashboard | Fleet summary, average health, alert counts | `/vehicles/summary`, `/alerts` |
| BatteryHealth | Per-vehicle SOH, temperature, voltage, cycles, degradation chart | `/vehicles`, `/vehicles/:id/degradation` |
| ChargeHistory | Session logs, weekly frequency, duration trend | `/charge-sessions/*` |
| RangePredictor | SOC/temperature → predicted range | `/range-predictions` |
| FleetMap | Vehicle status by ID (coordinates handled client-side) | `/vehicles` |
| Maintenance | AI-generated maintenance recommendations | `/maintenance/recommendations` |
| Settings | Alert thresholds, notification toggles, CSV/PDF export | `/settings`, `/reports/csv`, `/reports/pdf` |
| Login | JWT-based authentication | `/auth/register`, `/auth/login` |

---

## Setup

### 1. Install MongoDB
- **Recommended:** [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) — create a free cluster and copy the connection string from "Connect → Drivers"
- **Local:** [MongoDB Community Server](https://www.mongodb.com/try/download/community)

### 2. Install dependencies
```bash
cd backend
npm install
```

### 3. Configure environment variables
```bash
cp .env.example .env
```
Edit `.env`:
```
MONGO_URI=mongodb://127.0.0.1:27017/ev_battery_dashboard
JWT_SECRET=<a long random string>
CLIENT_ORIGIN=http://localhost:5173
```

### 4. Seed the database
```bash
npm run seed
```
This populates the database with sample vehicles (EV-001–EV-004), alerts, charge sessions, maintenance recommendations, and a demo account:
```
email: admin@evfleet.com
password: admin123
```

### 5. Start the server
```bash
npm run dev
```
```
✅ MongoDB Connected
🚀 EV Battery Intelligence API running on http://localhost:5000
📘 Swagger docs available at http://localhost:5000/api-docs
```

---

## API Documentation (Swagger)

With the server running, open:
```
http://localhost:5000/api-docs
```
All endpoints are documented and testable directly from the browser. Run `/auth/login` first, copy the returned token, click "Authorize" at the top of the page, and paste it in to test authenticated endpoints.

---

## Postman Collection

1. Open Postman
2. **Import** → select `EV-Battery-Intelligence.postman_collection.json`
3. Run **Auth → Login** first — the token is saved automatically to a collection variable
4. All other requests will then use that token automatically

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Create a new account |
| POST | `/api/auth/login` | Log in and receive a JWT |
| GET | `/api/auth/me` | Get current user profile |
| GET | `/api/vehicles` | List all vehicles |
| GET | `/api/vehicles/summary` | Fleet-wide dashboard stats |
| GET | `/api/vehicles/:id` | Get a single vehicle |
| POST | `/api/vehicles` | Add a new vehicle |
| PATCH | `/api/vehicles/:id` | Update vehicle telemetry |
| PATCH | `/api/vehicles/:id/isolate` | Isolate a vehicle from the grid |
| DELETE | `/api/vehicles/:id` | Remove a vehicle |
| GET | `/api/vehicles/:id/degradation` | 12-month capacity degradation history |
| GET | `/api/alerts` | Live alerts feed |
| POST | `/api/alerts` | Create a new alert |
| GET | `/api/alerts/stats` | Alert counts by severity |
| PATCH | `/api/alerts/:id/acknowledge` | Acknowledge an alert |
| POST | `/api/alerts/notify-technician` | Notify a technician |
| GET | `/api/charge-sessions` | Charging session logs |
| POST | `/api/charge-sessions` | Log a new session |
| GET | `/api/charge-sessions/frequency` | Weekly charge frequency |
| GET | `/api/charge-sessions/duration-trend` | DC Fast vs AC Slow duration trend |
| GET | `/api/range-predictions` | Predicted range for every vehicle |
| POST | `/api/range-predictions/calculate` | Calculate a custom range prediction |
| GET | `/api/maintenance/recommendations` | AI maintenance recommendations |
| POST | `/api/maintenance/recommendations` | Add a new recommendation |
| PATCH | `/api/maintenance/recommendations/:id` | Update a recommendation |
| DELETE | `/api/maintenance/recommendations/:id` | Delete a recommendation |
| GET | `/api/settings` | Get alert thresholds |
| PUT | `/api/settings` | Update alert thresholds |
| GET | `/api/reports/csv` | Download fleet report as CSV |
| GET | `/api/reports/pdf` | Download fleet report as PDF |

All routes except `/auth/register` and `/auth/login` require an `Authorization: Bearer <token>` header.

---

## Real-Time Events (Socket.io)

The backend simulates live telemetry every 5–8 seconds (mirroring the timers that previously ran client-side) and emits the following events:

| Event | Trigger |
|---|---|
| `vehicle:update` | A vehicle's SOH/temperature/SOC changed |
| `alert:new` | A new alert was generated |
| `technician:notified` | A technician was notified |
| `recommendation:new` / `recommendation:update` | A maintenance recommendation was added or updated |
| `settings:update` | Alert thresholds were changed |

Set `SIMULATE_TELEMETRY=false` in `.env` to disable this simulation (e.g. if real IoT device data will be used instead).

---

## Security

- Password hashing with **bcrypt**
- **JWT** authentication with configurable expiry
- **helmet** for HTTP security headers
- **express-rate-limit** to prevent abuse
- Centralized error handling (no stack traces leaked in production)
- Mongoose schema validation on all models
- Role-based access control (admin / fleet_manager / technician / viewer)

---

## Deployment

- Deploy to **Render**, **Railway**, or a similar Node.js host — set the environment variables (`MONGO_URI`, `JWT_SECRET`, `CLIENT_ORIGIN`) in the platform's dashboard
- **MongoDB Atlas**'s free tier is sufficient for initial production use
- Set `NODE_ENV=production` in production to suppress error stack traces in API responses
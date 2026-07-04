# EV Battery Intelligence Dashboard — Full Stack (Frontend + Backend)

Yeh **poora ready-to-run project** hai — frontend aur backend dono already connected hain.
Bas neeche diye steps follow karo, koi extra code likhne ki zaroorat nahi hai. 🚀

```
EV-Battery-Intelligence-FullStack/
├── frontend/     ← tumhara React (Vite) dashboard — already backend se connected
└── backend/      ← Node.js + Express + MongoDB + Socket.io API
```

---

## ✅ Pehle yeh install karo (agar nahi hai)

1. **Node.js** (v18 ya usse upar) → [nodejs.org](https://nodejs.org)
2. **MongoDB** — inme se koi ek:
   - **Easy (recommended):** [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) — free cloud database, sirf connection string chahiye
   - **Local:** [MongoDB Community Server](https://www.mongodb.com/try/download/community) apne PC pe install karo

---

## 🚀 Run karne ke 5 steps

VS Code mein is folder ko kholo (`File → Open Folder → EV-Battery-Intelligence-FullStack`).
Do terminal windows chahiye honge — VS Code mein `Ctrl + Shift + \`` se split terminal kar sakte ho.

### Terminal 1 — Backend

```bash
cd backend
npm install
cp .env.example .env
```

Ab `backend/.env` file kholo aur agar MongoDB Atlas use kar rahe ho to `MONGO_URI` line update kar do
(local MongoDB use kar rahe ho to kuch change karne ki zaroorat nahi, default already sahi hai).

```bash
npm run seed
npm run dev
```

Yeh terminal mein dikhna chahiye:
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

Terminal mein ek link milega (usually `http://localhost:5173`) — Ctrl+Click karke browser mein kholo.

---

## 🔑 Login karo

Browser khulte hi ek Login screen dikhegi — form pehle se fill hai:
- **Email:** `admin@evfleet.com`
- **Password:** `admin123`

(Yeh account `npm run seed` ne backend mein automatically bana diya hai.)

Login karte hi poora dashboard load hoga — **real backend data ke saath**, aur har few second mein
health/temperature/alerts **live update** hote rahenge (Socket.io ke through, backend se).

---

## 🧩 Maine frontend mein kya add/change kiya (transparency ke liye)

Maine tumhare **kisi bhi page file (Dashboard, BatteryHealth, ChargeHistory, FleetMap, Maintenance,
RangePredictor, Settings, Layout) ko touch nahi kiya** — sab bilkul waise hi hain jaise the, taaki
kuch bhi visually ya functionally break na ho.

Sirf yeh naya add kiya:
| File | Kaam |
|---|---|
| `src/lib/api.js` | Backend ko REST calls (fetch wrapper + JWT token handling) |
| `src/lib/socket.js` | Socket.io connection (real-time updates) |
| `src/lib/transform.js` | Backend response ko wahi shape mein convert karta hai jo pages already expect karte the |
| `src/Login.jsx` | Naya login screen (backend JWT auth ke liye) |
| `.env` | Backend ka URL (`VITE_API_URL`, `VITE_SOCKET_URL`) |

Aur sirf **`src/App.jsx` modify** kiya:
- `mockData.js` se data lena band karke, ab `/api/vehicles`, `/api/alerts`, `/api/settings`,
  `/api/maintenance/recommendations` se real data fetch hota hai
- Purane `setInterval()` simulation timers (health/temp/alerts fluctuation) hata diye — ab yeh
  simulation **backend** mein chalta hai aur Socket.io se live push hota hai
- Login/Logout flow add kiya

---

## ⚠️ Troubleshooting

| Problem | Solution |
|---|---|
| "Could not connect to backend" screen | Backend chal raha hai check karo (`npm run dev` terminal mein error to nahi) |
| MongoDB connection error | `.env` mein `MONGO_URI` sahi hai ya nahi check karo |
| Login fail ho raha hai | `npm run seed` chalaya tha ya nahi backend mein, check karo |
| CORS error browser console mein | `backend/.env` mein `CLIENT_ORIGIN=http://localhost:5173` match karna chahiye frontend ke actual port se |
| Port already in use | `backend/.env` mein `PORT` change kar do, aur frontend `.env` mein `VITE_API_URL`/`VITE_SOCKET_URL` bhi update karo |

Backend ki poori API list, Swagger docs, aur Postman collection ke liye `backend/README.md` dekho.

# WA Scheduler — Frontend

React + Vite frontend for the Dietician WhatsApp Scheduler. Communicates with the FastAPI backend via JWT-authenticated REST calls. All API responses are unwrapped from the standard `ResponseHelper` envelope using shared `unwrap` / `unwrapError` helpers.

---

## Project Structure

```
frontend/
├── index.html
├── package.json
├── vite.config.js           # Dev proxy: /user → http://localhost:8000
├── .env.example             # Copy to .env and set VITE_API_URL
└── src/
    ├── main.jsx             # ReactDOM root, BrowserRouter, AuthProvider
    ├── App.jsx              # Route definitions, PrivateRoute guard
    ├── index.css            # Global reset + base styles
    ├── api.js               # Axios instance, interceptors, all API calls, unwrap helpers
    ├── context/
    │   └── AuthContext.jsx  # AuthProvider — login, logout, user state
    ├── components/
    │   ├── Navbar.jsx       # Top navigation bar
    │   ├── Modal.jsx        # Reusable modal overlay
    │   ├── styles.js        # Shared inline style tokens
    │   ├── GroupsTab.jsx    # Groups CRUD tab
    │   ├── TemplatesTab.jsx # Templates CRUD tab
    │   └── SchedulesTab.jsx # Schedules CRUD tab
    └── pages/
        ├── Login.jsx        # /login
        ├── Register.jsx     # /register
        ├── Dashboard.jsx    # / — tabbed Groups / Templates / Schedules
        └── WhatsAppLink.jsx # /whatsapp-link — QR scan page
```

---

## Pages & Routes

| Route | Component | Auth required |
|-------|-----------|---------------|
| `/login` | `Login.jsx` | ❌ |
| `/register` | `Register.jsx` | ❌ |
| `/` | `Dashboard.jsx` | ✅ |
| `/whatsapp-link` | `WhatsAppLink.jsx` | ✅ |

Private routes redirect to `/login` when no JWT token is in `localStorage`.

---

## API Integration

All API calls live in `src/api.js`. Every backend response follows the `ResponseHelper` envelope:

```json
{
  "detail": [{
    "detail_type": "Success",
    "traceback_id": "...",
    "msg": "...",
    "data": { ... },
    "ctx": { "reason": "..." }
  }]
}
```

Three shared helpers unwrap this:

```js
unwrap(res)       // → res.data.detail[0].data  (the payload)
unwrapMsg(res)    // → res.data.detail[0].msg    (the message string)
unwrapError(err)  // → ctx.reason or msg from the error envelope
```

### API modules

```js
authAPI.register(data)          // POST /user/v1/auth/register
authAPI.login(data)             // POST /user/v1/auth/login
authAPI.me()                    // GET  /user/v1/auth/me

groupsAPI.list()                // GET  /user/v1/groups
groupsAPI.create(data)          // POST /user/v1/groups
groupsAPI.get(id)               // GET  /user/v1/groups/:id
groupsAPI.update(id, data)      // PUT  /user/v1/groups/:id
groupsAPI.delete(id)            // DELETE /user/v1/groups/:id

templatesAPI.list()             // GET  /user/v1/templates
templatesAPI.create(data)       // POST /user/v1/templates
templatesAPI.get(id)            // GET  /user/v1/templates/:id
templatesAPI.update(id, data)   // PUT  /user/v1/templates/:id
templatesAPI.delete(id)         // DELETE /user/v1/templates/:id

schedulesAPI.list()             // GET  /user/v1/schedules
schedulesAPI.create(data)       // POST /user/v1/schedules
schedulesAPI.get(id)            // GET  /user/v1/schedules/:id
schedulesAPI.update(id, data)   // PUT  /user/v1/schedules/:id
schedulesAPI.delete(id)         // DELETE /user/v1/schedules/:id

whatsappAPI.status()            // GET  /user/v1/whatsapp/status
whatsappAPI.qr()                // GET  /user/v1/whatsapp/qr
whatsappAPI.waitScan()          // POST /user/v1/whatsapp/wait-scan
```

---

## Local Setup

### Prerequisites

1. **Node.js 18+** — https://nodejs.org/
2. **Backend running** — see `backend/README.md`. The frontend proxies API calls to `http://localhost:8000`.

---

### Step 1 — Configure environment

```
cd "D:\Whatsapp Automation\frontend"
copy .env.example .env
```

Open `.env` and set:

```env
VITE_API_URL=http://localhost:8000
```

> For local development, you can leave `VITE_API_URL` empty or as `http://localhost:8000` — the Vite proxy in `vite.config.js` handles `/user` and `/health` routes automatically.

---

### Step 2 — Install dependencies

```
cd "D:\Whatsapp Automation\frontend"
npm install
```

---

### Step 3 — Start the dev server

```
npm run dev
```

Open `http://localhost:5173` in your browser.

---

### Step 4 — First use

1. Click **Register** — create your dietician account
   - Username: 2–100 characters
   - Password: min 6 characters, must include uppercase, lowercase, digit, and special character
2. Log in with your credentials
3. Go to **WhatsApp Link** in the navbar and scan the QR code with your phone
4. Once linked, go to the **Dashboard** and:
   - **Groups tab** — add your WhatsApp groups (name must match exactly)
   - **Templates tab** — create message templates
   - **Schedules tab** — create schedules linking a template to days + time

---

## Build for Production

```
cd "D:\Whatsapp Automation\frontend"
npm run build
```

Output goes to `frontend/dist/`. Deploy this folder as a static site.

---

## Render Deployment (Static Site)

1. Push code to GitHub
2. Render → **New → Static Site**, connect repo
3. Settings:
   - **Root directory:** `frontend`
   - **Build command:** `npm install && npm run build`
   - **Publish directory:** `dist`
4. **Environment variable:**

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://your-backend-name.onrender.com` |

5. Click **Create Static Site**

> After deploy, update `main.py` CORS `allow_origins` to include your Render frontend URL.

---

## Shared Styles

All reusable inline style tokens live in `src/components/styles.js` and are imported as `S` across all components. This keeps styling consistent without a CSS framework dependency.

Key tokens:

| Token | Use |
|-------|-----|
| `S.btn` | Primary green button |
| `S.btnSm` | Small primary button (table actions) |
| `S.btnDanger` | Red delete button |
| `S.btnSecondary` | Grey cancel button |
| `S.input` | Full-width text/select/textarea input |
| `S.label` | Form field label |
| `S.table / S.th / S.tr / S.td` | Data table |
| `S.badgeOn / S.badgeOff` | Active/Inactive status pill |
| `S.dayBtnOn / S.dayBtnOff` | Day-of-week selector toggle |
| `S.grid / S.card` | Template card grid |
| `S.error` | Inline error message |
| `S.empty` | Centred empty-state message |
| `S.toolbar` | Space-between header row |

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Blank page after login | Check `VITE_API_URL` in `.env` matches your backend URL |
| 401 on every request | JWT token expired or missing — log out and log in again |
| CORS error in browser | Add your frontend URL to `allow_origins` in `backend/main.py` |
| QR code not appearing | Backend must be running and Chrome must have loaded WhatsApp Web (wait ~15s after backend start) |
| `npm install` errors | Ensure Node.js 18+ is installed: `node --version` |
| API call returns HTML | Vite proxy not matching — check `vite.config.js` proxy rules |

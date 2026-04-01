# RCO2

Monorepo for the RCO2 carbon-credit platform:

- `backend/` - FastAPI API for auth, land, credits, earnings, and marketplace flows
- `frontend/` - Vite + React dashboard UI

## Local Run

Backend:

```powershell
.\run-backend.ps1
```

Frontend:

```powershell
cd frontend
npm install
npm run dev
```

## GitHub Push

If your GitHub repo is empty, run these commands from the project root after the first commit:

```powershell
git remote add origin https://github.com/rmahipalsingh602-spec/RCO2.git
git branch -M main
git push -u origin main
```

## Render Backend

This repo includes `render.yaml` for the backend API and a managed PostgreSQL database.

Required Render env vars:

- `SECRET_KEY`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `BACKEND_URL=https://<your-render-service>.onrender.com`
- `FRONTEND_URL=https://<your-vercel-project>.vercel.app`
- `FRONTEND_ORIGIN_REGEX=^https://<your-vercel-project>(-.*)?\.vercel\.app$` if you want Vercel preview URLs to work too

Cookie settings for cross-site auth are already prepared:

- `AUTH_COOKIE_SECURE=true`
- `AUTH_COOKIE_SAME_SITE=none`

## Vercel Frontend

Deploy `frontend/` as the Vercel project root.

Required Vercel env var:

- `VITE_API_BASE_URL=https://<your-render-service>.onrender.com`

`frontend/vercel.json` includes a catch-all rewrite so React Router pages work on refresh.

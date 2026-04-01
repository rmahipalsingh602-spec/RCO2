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

Current backend URL:

- `https://rco2.onrender.com`

`frontend/vercel.json` includes a catch-all rewrite so React Router pages work on refresh.
`frontend/.env.production` already points the frontend build to the Render backend.

## Android APK via Capacitor

The React frontend is now prepared for Capacitor under [`frontend/capacitor.config.ts`](/workspace/frontend/capacitor.config.ts).

From `frontend/`:

```powershell
npm install
$env:CAPACITOR_SERVER_URL="https://your-vercel-app.vercel.app"
npm run android:sync
npm run android:open
```

Notes:

- Set `CAPACITOR_SERVER_URL` to your live Vercel frontend URL if you want the APK to always load the latest hosted app.
- If you do not set `CAPACITOR_SERVER_URL`, the APK will use the bundled local `dist/` build instead.
- Build the final APK from Android Studio after `npm run android:open`.
- On Windows, you can also try a debug APK build with `npm run android:apk:debug`.

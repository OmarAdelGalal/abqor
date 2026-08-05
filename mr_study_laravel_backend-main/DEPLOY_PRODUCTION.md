# Production deployment notes (mrstudy.net)

This repo is deployed behind Nginx at `https://mrstudy.net/` with:

- API: `https://mrstudy.net/api/...`
- Admin dashboard SPA: `https://mrstudy.net/admin_portal/`
- Zoom SPA: `https://mrstudy.net/std_zoom/`
- Meeting leave page: `https://mrstudy.net/meeting_leave`

## 1) Build prerequisites

- Docker + docker compose on the server host
- Valid SSL certs mounted to the Nginx container (`.ssl` / letsencrypt volumes as configured)

## 2) Required env values

Copy `ABQOR_Backend/ABQOR_Backend-main/.env.production.example` to `.env` and fill:

- `APP_KEY` (use `php artisan key:generate`)
- DB credentials: `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`
- Zoom keys: `ZOOM_MEETING_SDK_KEY`, `ZOOM_MEETING_SDK_SECRET`
- Build paths:
  - `DASHBOARD_PATH`
  - `STD_ZOOM_PATH`

Recommended values when running docker compose from `ABQOR_Backend/ABQOR_Backend-main`:
- `DASHBOARD_PATH=../../ABQOR_Dashboard/ABQOR_Dashboard-main`
- `STD_ZOOM_PATH=../../ABQOR_Zoom/ABQOR_Zoom-main`
- Dashboard build URLs:
  - `VITE_API_URL=https://mrstudy.net/api/user/admin`
  - `VITE_STORAGE_URL=https://mrstudy.net/storage`

## 3) Deploy order (safe rollout)

### Step A — Deploy backend/web without breaking old clients

1) Deploy code.
2) Run migrations (new migrations include cache/jobs tables; safe even if unused):
   - `php artisan migrate --force`
3) Keep these OFF initially:
   - `LIVE_PROTECTION_REQUIRE_DEVICE_ID=false`
   - `DEVICE_POLICY_ENABLED=false`

This ships all protection logic without forcing device headers from older app builds.

### Step B — Release updated client apps (Desktop/Mobile)

Publish new builds that send:

- `X-Device-Id`
- `X-Device-Class` (`mobile` or `desktop`)

and include `device_id/device_class` during login flows.

### Step C — Turn on device enforcement

After most users updated:

- `LIVE_PROTECTION_REQUIRE_DEVICE_ID=true`
- `LIVE_PROTECTION_DEVICE_BINDING_SCOPE=user` (Live allowed on ONE device total per account)
- `DEVICE_POLICY_ENABLED=true` (2 devices total: 1 mobile + 1 desktop)

## 4) Notes / gotchas

- If you ever scale to multiple API containers, keep `CACHE_DRIVER=redis` in production. Live device binding and rate limiting rely on shared cache.
- When enabling device policy, existing tokens named `auth_token` will stop working and users will need to re-login to receive device-bound tokens.

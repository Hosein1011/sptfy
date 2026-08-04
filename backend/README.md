# Melora / Sptfy Django backend

This backend is designed for the supplied Next.js frontend and the course specification. It uses Django REST Framework, token authentication, role-based permissions, dynamic subscription plans, media uploads, aggregated reports, and a sandbox payment adapter.

## Quick start (without Docker)

```bash
cd backend
python -m venv .venv
# Windows: .venv\Scripts\activate
# Linux/macOS: source .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_demo
python manage.py runserver
```

In another terminal:

```bash
# project root
cp .env.example .env.local
npm install
npm run dev
```

API base URL: `http://localhost:8000/api`

## Docker

From the project root:

```bash
docker compose up --build
```

Frontend: `http://localhost:3000`  
Backend API: `http://localhost:8000/api`  
Django admin: `http://localhost:8000/admin`

## Demo accounts

| Role | Email | Password |
|---|---|---|
| Admin | `admin@sptfy.app` | `Admin@12345` |
| Support | `support@sptfy.app` | `Support@12345` |
| Verified artist | `artist@sptfy.app` | `Artist@12345` |
| Listener | `listener@sptfy.app` | `Listener@12345` |

## Important endpoints

| Area | Endpoint |
|---|---|
| Listener registration | `POST /api/auth/register/` |
| Artist registration | `POST /api/auth/register/artist/` |
| Login / logout | `POST /api/auth/login/`, `POST /api/auth/logout/` |
| Current user/profile | `GET/PATCH /api/auth/me/` |
| Preferences | `GET/PATCH /api/auth/preferences/` |
| Users/follow | `GET /api/users/`, `POST /api/users/{id}/follow/` |
| Songs | `/api/songs/` |
| Register a stream | `POST /api/songs/{id}/stream/` |
| Albums | `/api/albums/` |
| Playlists | `/api/playlists/` |
| Add/remove playlist song | `POST /api/playlists/{id}/songs/`, `DELETE /api/playlists/{id}/songs/{songId}/` |
| Notifications | `/api/notifications/` |
| Tickets/chat | `/api/tickets/`, `POST /api/tickets/{id}/messages/` |
| Artist verification | `/api/artist-verifications/` |
| Subscription plans | `/api/subscription-plans/` |
| Sandbox payments | `POST /api/payments/`, `POST /api/payments/{id}/verify/` |
| Monthly artist audits | `/api/audits/` |
| Home/artist/staff reports | `/api/reports/home/`, `/api/reports/artist/`, `/api/reports/staff/` |

## Payment note

The uploaded specification lists several payment gateways but does not provide merchant credentials. The implementation therefore includes a deterministic sandbox adapter. Creating a payment returns an authority code; posting `{"success": true}` to its `verify` action activates the subscription. Replace the marked branch in `billing/views.py` with the chosen gateway's server-to-server verification call.

## Artist reward note

The supplied pages state that the exact reward formula will be provided later, but that formula is not present in the uploaded document. The backend therefore uses the configurable `STREAM_REVENUE_RATE` environment variable (default `0.005`) and performs all aggregation server-side. Change this setting or the `calculate` action when the official formula is supplied.

## Tests

```bash
python manage.py test
```

The backend test suite covers registration/login, role permissions, artist approval, song publishing, streaming limits, Gold access, likes, playlist limits, notifications, support tickets, subscription purchase, and audit visibility.

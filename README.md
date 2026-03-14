# Neon-Flux Backend README

This folder contains a minimal Express-based backend used by the Neon-Flux frontend.
It is intentionally small and file-backed for local development. You can replace
storage with managed services for production.

Key features
- Read-only content endpoints that serve data from `backend/data/*.json` (projects, clients, services).
- Simple admin file upload endpoint (token protected) that stores files under `backend/uploads` and serves them via `/uploads`.
- Basic security: `helmet`, `express-rate-limit`, CORS configuration, input validation.

Contents
- `src/server.js` - main Express server and route handlers.
- `data/` - example JSON data files: `projects.json`, `clients.json`, `services.json`.
- `uploads/` - runtime directory for uploaded files (created automatically).
- `.env.example` - environment variables you must set in `.env`.
- `package.json` - dependencies and start scripts.

Endpoints
- `GET /api/health` - returns `{ ok: true, time }` to verify the server is up.
- `GET /api/projects` - returns the normalized list of projects from `data/projects.json`.
- `GET /api/projects/:slug` - returns a single project by slug (404 if missing).
- `GET /api/clients` - returns normalized clients from `data/clients.json`.
- `GET /api/services` - returns normalized services from `data/services.json`.
- `GET /api/portfolio` - returns combined normalized `projects` and `services`.
- `POST /api/admin/upload` - multipart form upload, protected by `x-admin-token: <ADMIN_TOKEN>` or `?token=`.
  Stores the file under `uploads/` and returns `{ ok: true, url }`.

How content normalization works
- Projects: `normalizeProject` fills `id`, `title`, `slug`, `categories`, `client`, `date`, `stats`, and `location`.
- Clients and services: each record gets an `id` and default fields when missing.

Environment variables
Create `backend/.env` (copy `.env.example`) and set these at minimum for development:
- `PORT` (default `4000`)
- `CORS_ORIGIN` - origin permitted by CORS, for example `http://localhost:8080`
- `ADMIN_TOKEN` - shared secret protecting `/api/admin/upload`

Run locally
1. Copy the env example and edit values.
2. Install and start:

```powershell
cd backend
cp .env.example .env
npm install
npm run dev
```

3. Verify endpoints:

```powershell
curl http://localhost:4000/api/health
curl http://localhost:4000/api/clients
curl http://localhost:4000/api/projects
```

Frontend integration
- Development with Vite: the frontend can call relative `/api/*` paths through the configured proxy.
- Alternatively set `VITE_API_BASE` in the frontend `.env` and have frontend requests use that base URL.

Security notes
- The admin upload endpoint uses a basic shared token (`ADMIN_TOKEN`) - replace with proper auth for production.
- Use HTTPS in production and strong secrets for `ADMIN_TOKEN`.

Extending for production
- Replace local JSON storage with a real database such as Postgres or Supabase.
- Replace local uploads with S3 or Cloudinary and return those URLs from the upload handler.
- Add authentication for admin routes and a small admin UI or use a headless CMS.

Troubleshooting
- Unexpected HTML when calling `/api/*`: the frontend is calling the wrong origin or the Vite proxy is not configured. Ensure the backend runs on `localhost:4000` and the dev server is forwarding `/api`.

Next steps
If you want, I can:
- Switch the upload handler to Cloudinary or S3 and update the README with deployment steps.
- Add basic admin auth (JWT) and example scripts to migrate `data/*.json` into Postgres or Supabase.

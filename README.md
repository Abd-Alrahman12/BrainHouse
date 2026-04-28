# LearnHub — Course Platform

A full-stack modern course platform with user authentication, course management, video lessons, file downloads, interactive sessions, and a complete admin panel.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, TailwindCSS v4, shadcn/ui, Wouter, React Query |
| Backend | Express 5, Drizzle ORM, PostgreSQL |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| API Client | Auto-generated from OpenAPI spec (Orval) |
| Monorepo | pnpm workspaces |

## Project Structure

```
.
├── artifacts/
│   ├── api-server/          # Express 5 backend API
│   │   └── src/
│   │       ├── app.ts       # Express app setup
│   │       ├── index.ts     # Server entrypoint
│   │       ├── middlewares/ # Auth middleware (JWT)
│   │       └── routes/      # API route handlers
│   └── course-platform/     # React + Vite frontend
│       └── src/
│           ├── pages/       # Page components (user + admin)
│           ├── components/  # shadcn/ui component library
│           ├── hooks/       # useAuth, useLanguage, etc.
│           └── lib/         # i18n, utilities
├── lib/
│   ├── db/                  # Drizzle ORM schema + DB connection
│   ├── api-spec/            # OpenAPI YAML specification
│   ├── api-client-react/    # Generated React Query hooks
│   └── api-zod/             # Generated Zod validators
├── scripts/
│   └── src/seed.ts          # Database seed script
├── .env.example             # Environment variable template
├── pnpm-workspace.yaml      # pnpm workspace + catalog config
└── tsconfig.base.json       # Shared TypeScript config
```

## Prerequisites

- **Node.js** 20 or later
- **pnpm** 9 or later (`npm install -g pnpm`)
- **PostgreSQL** 16 or later (local or cloud)

## Getting Started

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd course-platform
pnpm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and fill in:

```env
# PostgreSQL connection string
DATABASE_URL=postgresql://postgres:password@localhost:5432/learnhub

# JWT secret — use a long random string in production!
SESSION_SECRET=my-super-secret-jwt-key-change-this

# API server port (default: 8080)
PORT=8080
```

### 3. Set Up the Database

Push the schema to your PostgreSQL database:

```bash
# Using pnpm workspace shortcut:
DATABASE_URL=<your-url> pnpm db:push

# Or directly:
cd lib/db && DATABASE_URL=<your-url> pnpm push
```

### 4. Seed Sample Data

```bash
# Using pnpm workspace shortcut:
DATABASE_URL=<your-url> pnpm db:seed

# Or directly:
cd scripts && DATABASE_URL=<your-url> pnpm seed
```

This creates:
- **Admin account**: `admin@learnhub.com` / `admin123`
- 3 sample courses with sections, videos, files, and sessions

### 5. Run the Development Servers

Open **two terminals**:

**Terminal 1 — API Server:**
```bash
PORT=8080 DATABASE_URL=<your-url> SESSION_SECRET=<your-secret> pnpm dev:api
```

**Terminal 2 — Frontend:**
```bash
PORT=8081 BASE_PATH=/ pnpm dev:web
```

Then open [http://localhost:8081](http://localhost:8081).

## Environment Variables Reference

| Variable | Where Used | Default | Description |
|---|---|---|---|
| `DATABASE_URL` | `lib/db`, `artifacts/api-server` | *(required)* | PostgreSQL connection string |
| `SESSION_SECRET` | `artifacts/api-server` | `default-secret-change-me` | JWT signing secret — **always set this in production!** |
| `PORT` | `artifacts/api-server` | `8080` | API server port |
| `PORT` | `artifacts/course-platform` | `8081` | Vite dev server port |
| `BASE_PATH` | `artifacts/course-platform` | `/` | URL base path for the frontend |

## Available Scripts

From the workspace root:

| Script | Description |
|---|---|
| `pnpm dev:api` | Start the API server in dev mode |
| `pnpm dev:web` | Start the Vite frontend dev server |
| `pnpm db:push` | Push Drizzle schema to the database |
| `pnpm db:seed` | Seed the database with sample data |
| `pnpm build` | Typecheck and build all packages |
| `pnpm typecheck` | Run TypeScript checks across all packages |

## Database Schema

10 tables managed by Drizzle ORM:

- `users` — accounts with roles (user/admin), approval status
- `courses` — course catalog with status (free/locked)
- `enrollments` — user ↔ course relationships
- `video_sections` — collapsible video groupings per course
- `videos` — YouTube/Vimeo embed URLs per section
- `file_categories` — file groupings per course
- `files` — downloadable file links per category
- `interactive_sessions` — Zoom/Meet links with schedule
- `video_progress` — tracks which videos a user has watched
- `devices` — active login devices (max 2 per user)

## API Overview

| Prefix | Description |
|---|---|
| `POST /api/auth/*` | Register, login, logout, get current user |
| `GET /api/courses/*` | Browse courses, get details, videos, files, sessions |
| `GET /api/my-courses` | Enrolled courses for logged-in user |
| `GET /api/dashboard/summary` | User stats (progress, enrolled count) |
| `GET/DELETE /api/devices` | Device management |
| `* /api/admin/*` | Admin-only: user approval, course CRUD, enrollments |

## Production Deployment

1. **Build everything:**
   ```bash
   pnpm build
   ```

2. **API Server** — the compiled output is at `artifacts/api-server/dist/index.mjs`. Run it with:
   ```bash
   PORT=8080 DATABASE_URL=<url> SESSION_SECRET=<secret> node --enable-source-maps artifacts/api-server/dist/index.mjs
   ```

3. **Frontend** — built static files land at `artifacts/course-platform/dist/public/`. Serve them with any static file server (nginx, Caddy, etc.) and proxy `/api/*` to the API server.

## Features

### User-Facing
- Landing page with course listings
- Public course browsing with search
- Registration / Login with JWT
- Max 2 simultaneous devices per user
- Dashboard with progress stats
- Course detail with video player, file downloads, interactive sessions
- Video progress tracking, right-click protection, tab-switch hiding
- Device management page
- Arabic / English language switching (RTL support)

### Admin Panel
Access at `/admin` (link in page footer):
- Separate admin JWT token
- User management (approve/deny accounts, enroll users)
- Course CRUD with full content management
- Platform-wide stats dashboard

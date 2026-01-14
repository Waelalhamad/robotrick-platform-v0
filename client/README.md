# Robotrick MERN App

Full-stack MERN application for a robotics company with inventory, student orders, projects, competitions, judges panel, and blog.

## Tech

- Backend: Node.js, Express, MongoDB (Mongoose), Socket.IO
- Frontend: React (Vite + TypeScript) + TailwindCSS
- Auth: JWT in httpOnly cookies, role-based access

## Prerequisites

- Node 20+
- MongoDB 6+

## Setup

### 1) Server

1. Copy env

```
cd server
copy .env.example .env   # PowerShell: cp .env.example .env
```

Update `MONGO_URI`, `JWT_SECRET`, optional `CLIENT_ORIGIN`.

2. Install and run

```
npm install
npm run dev
```

3. Seed admin (optional)

```
# in server/
# Optionally set SEED_ADMIN_EMAIL/SEED_ADMIN_PASSWORD/SEED_ADMIN_NAME in .env
npm run seed:admin
```

### 2) Client

1. Copy env

```
cd ../client
copy .env.example .env   # PowerShell: cp .env.example .env
```

By default, API is proxied to `/api` and socket url is `http://localhost:4000`.

2. Install and run

```
npm install
npm run dev
```

Open http://localhost:5173

## Features

- Inventory with append-only stock ledger and cached levels
- Student orders with reservation → approve/reject/fulfill; realtime notifications
- Projects with parts list; Competitions, Teams, Judges evaluations and rankings
- Blog with draft/publish

## API (high-level)

- Auth: `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`
- Inventory: `GET /api/parts`, `POST /api/parts`, `PUT /api/parts/:id`, `DELETE /api/parts/:id`, `POST /api/stock/adjust`
- Orders: `GET /api/orders`, `POST /api/orders`, `POST /api/orders/:id/approve|reject|fulfill|cancel`
- Projects: `GET /api/projects`, `POST /api/projects`, `PUT /api/projects/:id/parts`
- Competitions: `GET /api/competitions`, `POST /api/competitions`, `GET/POST /api/competitions/:id/teams`, `POST /api/competitions/:id/evaluations`, `GET /api/competitions/:id/rankings`
- Blog: `GET/POST/PUT/DELETE /api/posts`

## Notes

- Ensure CORS `CLIENT_ORIGIN` matches the client URL
- JWT cookie is httpOnly; login from client will establish the cookie for subsequent requests
- Socket events: `order:new`, `order:update`, `stock:low`, `competition:results`

# Robotrick MERN App

Full-stack MERN application for a robotics company with inventory, student orders, projects, competitions, judges panel, and blog.

## Tech

- Backend: Node.js, Express, MongoDB (Mongoose), Socket.IO
- Frontend: React (Vite + TypeScript) + TailwindCSS
- Auth: JWT in httpOnly cookies, role-based access

## Prerequisites

- Node 20+
- MongoDB 6+

## Features

- Inventory with append-only stock ledger and cached levels
- Student orders with reservation → approve/reject/fulfill; realtime notifications
- Projects with parts list; Competitions, Teams, Judges evaluations and rankings
- Blog with draft/publish

## API

- Auth: `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`
- Inventory: `GET /api/parts`, `POST /api/parts`, `PUT /api/parts/:id`, `DELETE /api/parts/:id`, `POST /api/stock/adjust`
- Orders: `GET /api/orders`, `POST /api/orders`, `POST /api/orders/:id/approve|reject|fulfill|cancel`
- Projects: `GET /api/projects`, `POST /api/projects`, `PUT /api/projects/:id/parts`
- Competitions: `GET /api/competitions`, `POST /api/competitions`, `GET/POST /api/competitions/:id/teams`, `POST /api/competitions/:id/evaluations`, `GET /api/competitions/:id/rankings`
- Blog: `GET/POST/PUT/DELETE /api/posts`
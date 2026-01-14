# Robotrick

> A comprehensive robotics and AI platform for managing training programs, competitions, teams, projects, and inventory management.

## Overview

Robotrick is a full-stack web application designed to serve as a hub for professional robotics training, technical project management, and 3D printing services. Built for the Syrian robotics community based in Aleppo, it provides a complete ecosystem for managing educational programs, team collaborations, competitions, and inventory tracking.

### Key Features

- **Multi-Role System**: 9+ user roles (superadmin, admin, teacher, trainer, student, judge, organizer, reception, CLO)
- **Learning Management System (LMS)**: Complete course management with modules, quizzes, assignments, and evaluations
- **Inventory Management**: Real-time stock tracking, ledger system, and parts management
- **Team & Competition Management**: Create teams, assign projects, organize competitions with judge panels
- **Real-Time Collaboration**: Socket.io-powered live updates, group chat, and attendance tracking
- **Premium UI**: Glassmorphism design with 3D graphics, animations, and responsive layouts
- **Payment Tracking**: Student payment history, receipts, and order management

---

## Tech Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 19.1.1 | UI framework |
| **TypeScript** | ^5.7.2 | Type-safe JavaScript |
| **Vite** | 7.1.2 | Build tool & dev server |
| **TailwindCSS** | 4.1.12 | Utility-first styling |
| **Framer Motion** | 12.23.22 | Animation library |
| **React Router** | 7.8.2 | Client-side routing |
| **Axios** | 1.7.9 | HTTP client |
| **Socket.io Client** | 4.8.1 | Real-time communication |
| **Zustand** | (implied) | State management |
| **React Query** | (implied) | Server state management |

**Additional Libraries:**
- Lucide React (icons)
- React Big Calendar (scheduling)
- Moment.js (date handling)
- Headless UI (accessible components)
- Spline (3D design integration)

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | - | Runtime environment |
| **Express** | 5.1.0 | Web framework |
| **MongoDB** | - | NoSQL database |
| **Mongoose** | 8.18.0 | MongoDB ODM |
| **JWT** | 9.0.2 | Authentication |
| **bcryptjs** | 3.0.2 | Password hashing |
| **Socket.io** | 4.8.1 | Real-time server |
| **Winston** | 3.18.1 | Logging |
| **Multer** | 2.0.2 | File uploads |
| **Sharp** | 0.34.3 | Image processing |
| **PDFKit** | 0.17.2 | PDF generation |

**Security & Validation:**
- Helmet (HTTP headers security)
- CORS (cross-origin resource sharing)
- Express Rate Limit (API rate limiting)
- Express Mongo Sanitize (NoSQL injection prevention)
- Joi 18.0.1 (input validation)

---

## Architecture

### Project Structure

```
Robotrick-main/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   │   ├── auth/      # Authentication forms
│   │   │   ├── clo/       # CLO management components
│   │   │   ├── home/      # Landing page sections
│   │   │   ├── layout/    # Header, Footer, Navigation
│   │   │   ├── trainer/   # Trainer-specific components
│   │   │   └── ui/        # Base UI primitives
│   │   ├── features/      # Feature-specific modules
│   │   ├── pages/         # Route pages (50+ pages)
│   │   ├── hooks/         # Custom React hooks (40+ hooks)
│   │   ├── providers/     # Context providers (Auth, Theme)
│   │   ├── lib/           # Utilities (api, socket, utils)
│   │   ├── shared/        # Shared types & constants
│   │   └── layouts/       # Main layout wrapper
│   ├── public/            # Static assets
│   └── vite.config.ts     # Vite configuration
│
├── server/                # Node.js backend
│   ├── src/
│   │   ├── controllers/   # Request handlers (30+ controllers)
│   │   ├── models/        # Mongoose schemas (33 models)
│   │   ├── routes/        # API route definitions (26 route modules)
│   │   ├── middleware/    # Auth, validation, error handling
│   │   ├── services/      # Business logic layer
│   │   └── utils/         # Helper functions (logger, validators)
│   ├── index.js           # Server entry point
│   └── package.json
```

### Database Models (33 Collections)

**User & Authentication:**
- `User` - Multi-role user accounts

**Learning Management:**
- `Course`, `Module`, `ModuleProgress`
- `Session`, `SessionEvaluation`
- `Quiz`, `QuizAttempt`
- `Assignment`, `AssignmentSubmission`
- `Attendance`

**Evaluation System:**
- `Evaluation`, `StudentEvaluation`, `EvaluationCriteria`

**Organizational:**
- `Group`, `GroupChat`
- `Team`, `Competition`
- `Event`, `Lead`, `ContactHistory`
- `Enrollment`, `Interest`

**Inventory & Orders:**
- `Part`, `StockLevel`, `StockLedger`
- `Order`, `Payment`, `Receipt`

**Content:**
- `Post`, `Image`, `TrainerResource`

### API Design

**RESTful Patterns:**
```
GET    /api/resource       # List all
GET    /api/resource/:id   # Get single
POST   /api/resource       # Create new
PUT    /api/resource/:id   # Update existing
DELETE /api/resource/:id   # Delete
```

**Route Modules (26 total):**
```
/api/auth                           # Authentication
/api/student/*                      # Student features (6 modules)
/api/trainer/*                      # Trainer features (5 modules)
/api/clo/*                          # CLO management
/api/reception/*                    # Reception & admissions
/api/inventory/*                    # Orders, parts, stock
/api/competitions, /api/teams       # Competitions & teams
/api/posts, /api/projects           # Content management
/api/users                          # User administration
```

---

### Code Standards

**TypeScript:**
- Strict mode enabled
- Define interfaces for all props and data structures
- Use `unknown` over `any` for type safety

**Component Pattern:**
```typescript
interface Props {
  items: Item[];
  onSelect: (id: string) => void;
}

export const MyComponent: React.FC<Props> = ({ items, onSelect }) => {
  // Implementation
};
```

**State Management:**
- **Local State:** `useState` / `useReducer`
- **Global State:** Zustand stores (in `/stores`)
- **Server State:** React Query (in `/lib/api.ts`)

**Styling:**
- TailwindCSS utility classes
- shadcn/ui components
- Consistent spacing: 4, 8, 16, 24px
- Dark theme with cyan/blue accents

### API Development

**Error Handling:**
```typescript
// Client
try {
  const data = await api.get("/endpoint");
} catch (error) {
  toast.error(error.message || "Operation failed");
}

// Server
res.status(400).json({ message: "Clear error message" });
```

**Authentication:**
```javascript
// Protected route middleware
const { authenticateToken } = require('../middleware/auth');

router.get('/protected', authenticateToken, (req, res) => {
  const userId = req.user._id;
  // Access user info from req.user
});
```

**Role-Based Access:**
```javascript
// Check user role
if (req.user.role !== 'admin') {
  return res.status(403).json({ message: 'Forbidden' });
}
```

### UI/UX Guidelines

**Design System:**
- **Theme:** Dark (zinc-900/950) with cyan/blue accents
- **Effects:** Glassmorphism, gradient borders, smooth animations
- **Motion:** Framer Motion for page transitions & hover states
- **Responsive:** Mobile-first, breakpoints at sm/md/lg/xl
- **Accessibility:** ARIA labels, keyboard navigation, color contrast

### Performance Best Practices

- Lazy load routes and heavy components
- Memoize expensive calculations
- Use React Query caching
- Optimize images with Sharp
- Implement proper pagination

### Security Guidelines

- Validate all inputs with Joi
- Sanitize user data
- Never expose API keys (use environment variables)
- Use JWT for authentication
- Implement rate limiting on sensitive endpoints

---

## Available Scripts

**Root:**
```bash
npm run dev          # Start both client & server
npm run client       # Start frontend only
npm run server       # Start backend only
```

**Client:**
```bash
npm run dev          # Vite dev server
npm run build        # Production build
npm run preview      # Preview production build
npm run lint         # ESLint check
```

**Server:**
```bash
npm run dev          # Nodemon with auto-reload
npm run start        # Production start
npm run seed:admin   # Initialize admin user
```

## Project Status

**Current Phase:** Premium redesign Phase 1-2 complete

**Completed Features:**
- Multi-role authentication system
- Student LMS with courses, quizzes, assignments
- Trainer session management
- CLO dashboard and evaluation system
- Reception lead management
- Inventory and order tracking
- Real-time notifications
- Premium glassmorphism UI

**Future Enhancements:**
- Mobile app (React Native/Expo ready)
- Automated email notifications
- Multi-language support
- AI-powered Dashboard

---

## License

© 2025 Robotrickk. All rights reserved.

**Built with dedication for the robotics community in Syria 🇸🇾**
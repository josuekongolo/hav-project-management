# HAV Project Management Dashboard

A Jira-like project management dashboard built for startup teams.

## Features

- Kanban Board with drag-and-drop
- Milestone/Sprint tracking
- Team Dashboard with workload overview
- Task priority and labels
- Real-time updates

## Tech Stack

### Frontend
- React 18 + TypeScript
- Vite 5
- Tailwind CSS 3
- Zustand (state management)
- @dnd-kit (drag-and-drop)

### Backend
- Node.js + Express + TypeScript
- PostgreSQL + Prisma ORM
- JWT Authentication

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 15+
- npm 9+

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up PostgreSQL database and create `.env` file in `apps/backend`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/hav_pm"
JWT_SECRET="your-secret-key"
PORT=3001
```

3. Set up frontend `.env` file in `apps/frontend`:
```env
VITE_API_URL="http://localhost:3001/api"
```

4. Run database migrations:
```bash
cd apps/backend
npx prisma migrate dev
npx prisma db seed
```

5. Start development servers:
```bash
# In root directory
npm run dev
```

This will start:
- Frontend: http://localhost:5173
- Backend: http://localhost:3001

## Project Structure

```
hav/
├── apps/
│   ├── frontend/    # React + Vite application
│   └── backend/     # Express API server
├── packages/
│   └── shared-types/  # Shared TypeScript types
└── turbo.json       # Turborepo configuration
```

## Development

- `npm run dev` - Start all development servers
- `npm run build` - Build all apps
- `npm run lint` - Lint all packages
- `npm run format` - Format code with Prettier

## License

MIT

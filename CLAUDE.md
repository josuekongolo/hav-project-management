# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

HAV is a full-stack project management dashboard with integrated CRM features. It's a Turborepo monorepo with:
- `apps/backend` - Express.js API with Prisma ORM
- `apps/frontend` - React 18 + Vite + Tailwind CSS
- `packages/shared-types` - Shared TypeScript types

## Common Commands

### Development
```bash
npm run dev              # Start both frontend and backend
npm run dev -w @hav/backend   # Backend only
npm run dev -w @hav/frontend  # Frontend only
```

### Build & Lint
```bash
npm run build            # Build all packages
npm run lint             # Lint all packages
npm run format           # Format with Prettier
```

### Database (from apps/backend)
```bash
npx prisma migrate dev   # Create/run migrations
npx prisma db seed       # Seed with test data
npx prisma studio        # Visual database editor
npx prisma generate      # Regenerate Prisma client
```

## Architecture

### Backend Pattern
Controllers → Services → Prisma (database)
- Controllers (`src/controllers/`) handle HTTP requests
- Services (`src/services/`) contain business logic
- Routes (`src/routes/`) define API endpoints under `/api`

### Frontend Pattern
Pages → Components → Services → Zustand Stores
- Pages (`src/pages/`) are route components
- Services (`src/services/`) make API calls via Axios
- Stores (`src/store/`) manage state with Zustand

### Key Technologies
- **State**: Zustand (not Redux)
- **Forms**: React Hook Form + Zod validation
- **Drag & Drop**: @dnd-kit/core and @dnd-kit/sortable
- **Styling**: Tailwind CSS
- **Auth**: JWT stored in localStorage, validated via `authMiddleware.ts`

## Database Schema (Prisma)

Two main domains:

**Project Management**: User, Task, Milestone, Label, Comment, TimeLog, Notification

**CRM**: Contact, Company, Deal, Email, EmailTemplate, Activity, Note, CallLog, Meeting

Key relationships:
- Tasks have multiple assignees via TaskAssignee join table
- Tasks have multiple labels via TaskLabel join table
- Contacts can belong to a Company via `companyId`/`companyRel`
- Notes are polymorphic (noteableType + noteableId pattern)

## Environment Variables

### Backend (.env)
```
DATABASE_URL="postgresql://..."
JWT_SECRET="64-char-random-string"
RESEND_API_KEY="..."
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
```

### Frontend (.env)
```
VITE_API_URL="http://localhost:3001/api"
```

## Test Accounts (after seeding)
- admin@hav.com / password123
- alice@hav.com / password123

## Deployment

Deployed to Railway with PostgreSQL. See `DEPLOYMENT.md` for details.
- Backend root directory: `apps/backend`
- Frontend root directory: `apps/frontend`
- Backend runs migrations on deploy via `prisma migrate deploy`

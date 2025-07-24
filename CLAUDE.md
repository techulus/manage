# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Development
bun dev                    # Start development server with TZ=UTC and turbopack
bun run build             # Build for production
bun start                 # Start production server
bun run lint              # Run Biome linter
bun run generate:migrations # Generate Drizzle migrations
```

## Project Architecture

### Tech Stack
- **Framework**: Next.js 15.3.0 with App Router
- **Language**: TypeScript 5.7.2
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Clerk (with organization support)
- **Styling**: Tailwind CSS + Radix UI components
- **State Management**: tRPC + TanStack Query
- **Real-time**: TurboWire for WebSockets
- **Email**: React Email + Resend
- **File Storage**: S3-compatible storage
- **Monitoring**: Sentry + PostHog
- **Linting**: Biome (not ESLint)

### Directory Structure

#### Core Application (`/app`)
- Uses Next.js App Router with route groups:
  - `(api)` - API routes (tRPC, webhooks, calendar)
  - `(dashboard)` - Main application UI with tenant-based routing
  - `(legal)` - Terms and privacy pages

#### Database (`/drizzle`, `/ops`)
- Main schema in `/drizzle/schema.ts`
- Operations schema in `/ops/drizzle/schema.ts` (separate database)
- Drizzle migrations auto-generated

#### API Layer (`/trpc`)
- tRPC routers: user, settings, projects, tasks, events
- Protected procedures require authentication via Clerk
- Context includes timezone, user/org info, database connection

#### Components (`/components`)
- `core/` - Application-specific components
- `ui/` - Radix UI + Tailwind design system components
- `form/` - Form components with editable text/date functionality
- `project/` - Project management specific components

### Key Patterns

#### Authentication & Authorization
- All protected routes use Clerk middleware
- tRPC procedures use `protectedProcedure` for authenticated endpoints
- Multi-tenant with organization support (`orgSlug`, `ownerId`)

#### Database Architecture
- Two separate databases: main app and ops
- Drizzle ORM with relations defined
- Schema: User → Projects → TaskLists → Tasks
- Calendar events and activity logs included

#### Real-time Features
- TurboWire integration for WebSocket connections
- Activity logging system for project updates

#### File Management
- S3-compatible blob storage integration
- File upload/download API routes

### Environment Variables Required
```bash
# Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# Database
DATABASE_URL=

# Storage
S3_ENDPOINT=
S3_ACCESS_KEY_ID=
S3_SECRET_ACCESS_KEY=
S3_BUCKET_NAME=

# Real-time
TURBOWIRE_DOMAIN=
TURBOWIRE_SIGNING_KEY=
TURBOWIRE_BROADCAST_KEY=

# Email
RESEND_API_KEY=
```

### Development Notes
- Uses Biome for linting (not ESLint) - config in `biome.json`
- Development runs with UTC timezone enforced
- Docker support available via `docker-compose.yml`
- Turbopack enabled for faster development builds
- UI components ignore linting (see `biome.json`)
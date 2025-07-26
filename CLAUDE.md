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
- **Search**: Upstash Search for full-text search with filtering
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
- tRPC routers: user, settings, projects, tasks, events, **search**
- Protected procedures require authentication via Clerk
- Context includes timezone, user/org info, database connection, search service

#### Components (`/components`)
- `core/` - Application-specific components
- `ui/` - Radix UI + Tailwind design system components
- `form/` - Form components with editable text/date functionality
- `project/` - Project management specific components

#### Search Infrastructure (`/lib/search`)
- `index.ts` - Main SearchService class with Upstash Search integration
- `helpers.ts` - Utility functions for search indexing and error handling
- Automatic indexing on create/update/delete operations
- Support for filtering by type, project, and status

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

#### Search System
- **Search Service**: Upstash Search integration with tenant-based indexing
- **Auto-indexing**: All content (projects, tasks, task lists, events) automatically indexed
- **Advanced Filtering**: Project-based, type-based, and status-based filtering
- **Mobile-responsive**: Search UI optimized for mobile devices
- **Error Handling**: Robust error handling with `runAndLogError` utility
- **Search Helpers**: Centralized utilities for consistent search operations

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

# Search
UPSTASH_SEARCH_URL=
UPSTASH_SEARCH_TOKEN=
```

### Development Notes
- Uses Biome for linting (not ESLint) - config in `biome.json`
- Development runs with UTC timezone enforced
- Docker support available via `docker-compose.yml`
- Turbopack enabled for faster development builds
- UI components ignore linting (see `biome.json`)
- Search indexing happens automatically on content changes
- Run `biome lint --write --unsafe` to auto-fix linting issues

### Search Implementation Details
- **Search Service**: Located in `/lib/search/index.ts` - handles all search operations
- **Search Helpers**: Located in `/lib/search/helpers.ts` - utility functions for indexing
- **Search Router**: Located in `/trpc/routers/search.ts` - API endpoints for search
- **Search UI**: Located in `/app/(dashboard)/[tenant]/search/page.tsx` - responsive search interface
- **Indexing Strategy**: Tenant-based indexing with automatic content updates
- **Filter Options**: 
  - Project filter (dropdown with all available projects)
  - Type filter (project, task, tasklist, event)
  - Status filter (context-aware based on selected type)
- **Mobile Support**: Responsive design with stacked filters and flexible grid layout

## Product Insights
- The product name is Manage, even though domain name is managee.xyz

## Recent Improvements
- **Enhanced Search**: Implemented comprehensive search with project, type, and status filtering
- **Code Organization**: Refactored search logic into reusable helper functions
- **Mobile UX**: Improved responsive design for search interface
- **Error Handling**: Standardized error handling across search operations
- **Performance**: Optimized search indexing with automatic content updates
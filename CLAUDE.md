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

## Development Workflow Guidance - CRITICAL BUILD AND TEST RESTRICTIONS

### ⚠️ WHEN NOT TO BUILD OR TEST (99% of the time)

**DO NOT run `bun run build`, `bun run test`, or any testing commands unless EXPLICITLY requested by the user.**

This is absolutely critical for the following reasons:

#### Performance and Resource Management
- **Builds are expensive**: Each build takes 20-40 seconds and consumes significant CPU/memory
- **Unnecessary resource waste**: Most code changes don't require validation through full builds
- **Development server already validates**: The `bun dev` server catches most issues in real-time
- **TypeScript catches errors**: The IDE and development server provide immediate type checking

#### User Experience and Workflow
- **Interrupts development flow**: Unexpected builds break the user's mental model and workflow
- **Creates false urgency**: Running builds suggests something is broken when it isn't
- **User controls their workflow**: Developers know when they want to test their changes
- **Build timing is contextual**: Users build when ready to deploy, test, or validate large changes

#### Technical Reasons
- **TypeScript already validates**: Most errors are caught by the TypeScript compiler in the editor
- **Hot reload exists**: Development server provides instant feedback on changes
- **Builds don't catch runtime issues**: Many bugs only appear during actual usage, not builds
- **False confidence**: A successful build doesn't guarantee the code works as intended

#### Professional Development Practices
- **Respect user autonomy**: Developers decide when to run builds and tests
- **Avoid assumption-driven actions**: Don't assume code needs validation through builds
- **Focus on code quality**: Write good code rather than relying on builds to catch issues
- **Trust the development environment**: Modern tooling catches most issues without full builds

### ✅ WHEN TO BUILD (Rare exceptions)

Only run builds in these specific situations:

1. **User explicitly requests it**: "Can you build this?" or "Run the build command"
2. **Major refactoring across many files**: When changing 10+ files that interact with each other
3. **Type system changes**: When modifying TypeScript configurations or complex type definitions
4. **Production deployment preparation**: When user specifically mentions deployment or production
5. **Debugging build-specific issues**: When the user reports build failures or deployment problems

### Alternative Approaches Instead of Building

#### For Code Validation
- **Read the files**: Examine the code structure and logic directly
- **Check TypeScript types**: Review type definitions and interfaces
- **Review imports/exports**: Verify module dependencies and structure
- **Analyze function signatures**: Ensure API contracts are correct

#### For Issue Detection
- **Use static analysis**: Examine code patterns and potential issues
- **Check for common mistakes**: Look for typical bugs like unused variables, incorrect types
- **Verify logic flow**: Trace through code execution paths mentally
- **Review error handling**: Check if proper error cases are covered

#### For Confidence Building
- **Code review approach**: Examine code like you're reviewing a pull request
- **Focus on clarity**: Ensure code is readable and maintainable
- **Check best practices**: Verify adherence to project conventions and patterns
- **Document assumptions**: Note any assumptions or potential edge cases

### Impact of Unnecessary Builds

#### On Development Velocity
- **Context switching**: Builds interrupt the natural development flow
- **Waiting time**: 30+ seconds per build adds up quickly over multiple changes
- **Mental overhead**: Constantly waiting for builds creates cognitive load
- **Reduced experimentation**: Developers avoid trying things if builds are frequent

#### On User Trust
- **Perceived inefficiency**: Unnecessary builds make the assistant seem inefficient
- **Loss of control**: Users feel like the assistant is doing things they didn't ask for
- **Workflow disruption**: Breaks the user's established development rhythm
- **Professional credibility**: Shows lack of understanding of development workflows

Remember: The goal is to write good code and make requested changes efficiently. Builds should be a deliberate choice, not a reflexive action after every change.

## Code Style Guidelines
- **No obvious comments**: Never add comments for obvious code. Comments should only provide context or insights that aren't clear from reading the code itself
- **Self-documenting code**: Write code that is clear and self-explanatory. Variable and function names should describe what they do
- **Avoid unnecessary intermediate variables**: Don't create variables just to "improve readability" when the expression is already clear
- Examples of bad comments to avoid:
  - `// Use current time as the start` before `buildQuery(now, end)`
  - `// Increment counter` before `i++`
  - `// Check if user exists` before `if (user)`
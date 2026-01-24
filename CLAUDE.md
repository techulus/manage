# CLAUDE.md

## Project Architecture

### Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Better-auth
- **Styling**: Tailwind CSS + Shadcn
- **Real-time**: TurboWire for WebSockets
- **Email**: React Email + Resend
- **File Storage**: S3-compatible storage
- **Monitoring**: Sentry
- **Linting**: Biome
- Bun as the runtime and package manager

## Development Guidelines

- Do not add unnecessary and obvious comments, verify if it adds value.
- Write modular and reusable code, check if a component can be reused before creating a new one. Check if there are existing libraries / helpers / utils that can be used.
- Follow the existing code style and conventions.
- DO NO make assumptions, if you don't know something, ask.

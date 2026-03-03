# Development Guide

## Prerequisites

- Node.js 18+
- npm 9+
- A Supabase project (free tier works)

## Local Setup

```bash
# Clone the repository
git clone <repo-url>
cd crochet

# Install dependencies
npm install

# Create environment file
cp .env.local.example .env.local
# Edit .env.local with all required credentials (see below)

# Start dev server
npm run dev
```

The app runs at `http://localhost:3000`

## Environment Variables

Create `.env.local` with all 5 variables:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
TELEGRAM_BOT_TOKEN=your-bot-token
TELEGRAM_CHAT_ID=your-chat-id
```

The `SUPABASE_SERVICE_ROLE_KEY` is required for the admin panel. Without it, all admin API routes will return 500 errors.

## Supabase Setup (First Time)

If you haven't set up Supabase yet, follow [Admin Setup Guide](./admin-setup.md) for full step-by-step instructions. Summary:

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Run the SQL schema from `docs/admin-setup.md` in the SQL Editor
3. Create an admin user in Supabase Authentication
4. Copy the service role key from Project Settings → API
5. Add all env vars to `.env.local`
6. Seed the database: `npm run seed`

## Available Scripts

| Script | Description |
|--------|-----------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run test` | Run tests in watch mode |
| `npm run test:run` | Run tests once |
| `npm run test:coverage` | Run tests with coverage |
| `npm run seed` | Seed Supabase with initial product data (one-time) |

## Admin Panel Development

The admin panel lives at `/admin/*`. Key things to know:

- **Middleware** (`middleware.ts`) protects all `/admin/*` routes except `/admin/login`. It checks for a valid Supabase session cookie and redirects to `/admin/login` if missing.
- **Admin layout** (`app/admin/layout.tsx`) is completely separate from the public layout — it has a sidebar and topbar, no Navbar/Footer.
- **Admin API routes** (`app/api/admin/`) all call `requireAdminAuth()` at the top before doing anything. This validates the session server-side.
- **Admin client** (`lib/supabase/admin.ts`) uses the service role key. Only import this in `app/api/admin/` route handlers — never in client components.

```ts
// Pattern for every admin API route handler:
import { requireAdminAuth } from '@/lib/supabase/auth-check'

export async function GET(request: Request) {
  const { supabase, error } = await requireAdminAuth()
  if (error) return error // 401 response
  // ... do work with supabase
}
```

## Important Conventions

### Dynamic Rendering
All public data pages must export:
```ts
export const dynamic = 'force-dynamic';
```
This ensures product/category data is always fresh from Supabase. Do not use `generateStaticParams`.

### TanStack Query v5
`onSuccess` was removed in v5. Use `useEffect` instead:
```ts
// Don't do this (v4 pattern):
useQuery({ queryFn: fn, onSuccess: (data) => setFoo(data) })

// Do this instead:
const { data } = useQuery({ queryFn: fn })
useEffect(() => { if (data) setFoo(data) }, [data])
```

### Supabase Client Selection
- `lib/supabase/server.ts` → public pages, middleware, session checks
- `lib/supabase/admin.ts` → admin API routes only

## Code Quality Checks

Before committing:
```bash
npx tsc --noEmit   # Type checking
npm run lint       # ESLint
npm run test:run   # Tests
npm run build      # Production build check
```

> **Note**: Some tests may require valid Supabase credentials to run end-to-end. Set up `.env.local` before running integration tests.

## Adding shadcn/ui Components

```bash
npx shadcn@latest add <component-name>
```

Components are installed to `components/ui/`. See [shadcn/ui docs](https://ui.shadcn.com/docs) for available components. Do not manually edit files in `components/ui/`.

## Project Conventions

- **Fonts**: Outfit (headings via `font-heading`), Plus Jakarta Sans (body)
- **Colors**: Peach/warm theme via CSS variables in `globals.css`
- **Components**: `'use client'` directive only on interactive components
- **State**: Zustand stores in `lib/stores/`
- **Types**: All types in `types/` directory
- **Tests**: In `tests/` directory (integration-style)

# Development Guide

## Prerequisites

- Node.js 18+
- npm 9+

## Local Setup

```bash
# Clone the repository
git clone <repo-url>
cd crochet

# Install dependencies
npm install

# Create environment file
cp .env.local.example .env.local
# Edit .env.local with your Telegram bot credentials

# Start dev server
npm run dev
```

The app runs at `http://localhost:3000`

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

## Code Quality Checks

Before committing, run:
```bash
npx tsc --noEmit    # Type checking
npm run test:run    # Tests
npm run build       # Production build
```

## Adding shadcn/ui Components

```bash
npx shadcn@latest add <component-name>
```

Components are installed to `components/ui/`. See [shadcn/ui docs](https://ui.shadcn.com/docs) for available components.

## Project Conventions

- **Fonts**: Outfit (headings), Plus Jakarta Sans (body)
- **Colors**: Peach theme via CSS variables in `globals.css`
- **Components**: `'use client'` directive only on interactive components
- **State**: Zustand stores in `lib/stores/`
- **Types**: All types in `types/` directory
- **Tests**: Co-located in `__tests__/` directories

## Testing

Tests use Vitest + React Testing Library. Test files follow the pattern `*.test.{ts,tsx}`.

```bash
# Run all tests
npm run test:run

# Run in watch mode
npm run test

# Run with coverage
npm run test:coverage
```

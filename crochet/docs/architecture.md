# Architecture Overview

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| UI | React 19 |
| Styling | Tailwind CSS 3.4 + CSS Variables |
| Components | shadcn/ui (in `components/ui/`) |
| State | Zustand 5 (cart + wishlist with localStorage persist) |
| Data Fetching | TanStack Query v5 (admin client components) |
| Forms | React Hook Form + Zod validation |
| Animation | Framer Motion 11 |
| Icons | Lucide React |
| Database | Supabase (PostgreSQL + Storage + Auth) |
| HTTP | Axios |
| Notifications | Telegram Bot API |
| Testing | Vitest + React Testing Library |

## Directory Structure

```
crochet/
  app/
    (public)/             # Public storefront — shared Navbar + Footer layout
      page.tsx            # Homepage
      products/           # /products and /products/[slug]
      cart/               # /cart
      wishlist/           # /wishlist
      order-success/      # /order-success
      layout.tsx          # Public layout with Navbar + Footer
    admin/                # Admin panel — sidebar + topbar, no public Navbar/Footer
      login/              # Unauthenticated entry point
      dashboard/          # Stats overview
      products/           # CRUD product management
      orders/             # Order list + detail
      categories/         # Category display editor
      settings/           # Shop settings
      layout.tsx          # Admin layout with sidebar + topbar
    api/
      orders/             # POST — public order submission
      admin/              # Auth-guarded admin API routes
        products/
        orders/
        categories/
        dashboard/
        settings/
        upload/
    globals.css           # Theme CSS variables (peach palette, fonts)
    layout.tsx            # Root layout (TanStack Query provider, fonts)
  components/
    ui/                   # shadcn/ui primitives (do not edit manually)
    layout/               # Navbar, Footer, MobileNav, PageContainer
    product/              # ProductCard, ProductGrid, ProductGallery, ProductInfo
    cart/                 # CartItem, CartSummary, OrderForm, EmptyCart
    wishlist/             # EmptyWishlist
    home/                 # HeroSection, CategoryGrid, FeaturedProducts, NewArrivals
    admin/                # All admin panel components
  data/
    products.ts           # LEGACY — static product data (seed only, not live source)
    categories.ts         # LEGACY — static category data (seed only)
  hooks/                  # Custom React hooks (useMounted, etc.)
  lib/
    supabase/
      server.ts           # Anon client with cookies (public pages + session checks)
      admin.ts            # Service role client (admin API routes only)
      auth-check.ts       # requireAdminAuth() helper
    stores/               # Zustand stores (cart, wishlist)
    external/             # Telegram API client
    validations/          # Zod schemas
    data.ts               # Async Supabase data access functions
    format.ts             # Price + order formatting
    animations.ts         # Framer Motion variants
    utils.ts              # cn() class merge utility
  types/                  # TypeScript type definitions
    product.ts            # Product, Variant, ProductImage, CategorySlug
    order.ts              # Order, OrderItem, OrderFormData
    admin.ts              # AdminOrder, DashboardStats, SiteSettings, ORDER_STATUSES
  scripts/
    seed-products.ts      # One-time DB seeder: data/products.ts → Supabase
  tests/                  # Vitest test setup
  docs/                   # Project documentation
  middleware.ts           # Route protection for /admin/*
```

## Data Flow

### Public Storefront

```
Supabase DB
    --> lib/data.ts (async functions, uses anon client)
        --> Server Components (pages in app/(public)/)
            --> Client Components (product cards, cart, wishlist)
                --> Zustand stores
                    --> localStorage
```

Products, categories, and settings are read from Supabase on every request. All public data pages export `dynamic = 'force-dynamic'` to prevent stale cached data.

### Admin Panel

```
Admin UI (React client components)
    --> TanStack Query useMutation / useQuery
        --> /api/admin/* route handlers
            --> requireAdminAuth() (validates session)
            --> lib/supabase/admin.ts (service role, bypasses RLS)
                --> Supabase DB / Storage
```

## Order Flow

```
Customer fills order form in /cart
    --> Zod validation on client
    --> POST /api/orders
        --> Zod validation on server
        --> Insert order into Supabase orders table
        --> Format message + call Telegram Bot API
        --> Return success
    --> Redirect to /order-success
    --> Owner receives formatted order on Telegram
```

## Key Design Decisions

1. **Supabase as the data layer** — All product, order, category, and settings data lives in Supabase. The admin panel provides a full CRUD interface so the business owner never needs to touch code.

2. **Route groups for layout isolation** — `(public)` has Navbar/Footer, `admin` has a completely different sidebar layout. They share only the root layout's providers.

3. **Two Supabase clients** — The anon client (`lib/supabase/server.ts`) is used for all public reads and respects RLS. The service role client (`lib/supabase/admin.ts`) is restricted to admin API routes and bypasses RLS for full write access.

4. **Dynamic rendering** — `export const dynamic = 'force-dynamic'` on all public data pages prevents stale SSG. `generateStaticParams` is not used since products are managed live.

5. **localStorage persistence** — Cart and wishlist survive page refreshes without user accounts.

6. **Hydration safety** — `useMounted()` hook prevents SSR/client mismatch for localStorage-dependent UI.

7. **shadcn/ui base** — Provides accessible, customizable primitives. Custom `playful` button variant adds brand personality.

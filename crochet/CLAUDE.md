# Crochet Ya — AI Context File

A Next.js e-commerce site for a small handmade crochet business. Customers browse products, add to cart, and submit orders via WhatsApp-style order form. The business owner manages everything through a password-protected admin panel.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| UI | React 19 |
| Styling | Tailwind CSS 3.4 + CSS Variables |
| Components | shadcn/ui (in `components/ui/`) |
| State | Zustand 5 (cart + wishlist, localStorage persisted) |
| Data Fetching | TanStack Query v5 (client components) |
| Forms | React Hook Form + Zod |
| Animation | Framer Motion 11 |
| Icons | Lucide React |
| Database | Supabase (PostgreSQL + Storage + Auth) |
| Notifications | Telegram Bot API |
| Testing | Vitest + React Testing Library |

---

## Architecture

### Route Groups

```
app/
  (public)/           # Public storefront — has shared Navbar + Footer via layout.tsx
    page.tsx          # Homepage
    products/         # /products and /products/[slug]
    cart/             # /cart
    wishlist/         # /wishlist
    order-success/    # /order-success
  admin/              # Admin panel — has sidebar + topbar, NO public Navbar/Footer
    login/            # /admin/login (only unauthenticated admin route)
    dashboard/        # /admin/dashboard
    products/         # /admin/products, /admin/products/new, /admin/products/[id]
    orders/           # /admin/orders, /admin/orders/[id]
    categories/       # /admin/categories
    settings/         # /admin/settings
  api/
    orders/           # POST /api/orders — public order submission
    admin/            # All admin API routes (auth-guarded)
      products/
      orders/
      categories/
      dashboard/
      settings/
      upload/
```

### Key Directories

```
components/
  ui/           # shadcn/ui primitives
  layout/       # Navbar, Footer, MobileNav, PageContainer
  product/      # ProductCard, ProductGrid, ProductGallery, ProductInfo, ProductCardSkeleton
  cart/         # CartItem, CartSummary, OrderForm, EmptyCart
  wishlist/     # EmptyWishlist
  home/         # HeroSection, CategoryGrid, FeaturedProducts, NewArrivals
  admin/        # All admin panel components (tables, forms, editors)
lib/
  supabase/
    server.ts   # Anon-key client with cookies (for public reads + auth session)
    admin.ts    # Service role client — bypasses RLS (admin API routes only)
    auth-check.ts  # requireAdminAuth() — call at top of every admin API route
  stores/       # Zustand stores (cart.ts, wishlist.ts)
  external/     # Telegram API client
  validations/  # Zod schemas
  data.ts       # Async Supabase data functions (getAllProducts, getFeaturedProducts, etc.)
  format.ts     # Price formatting, order formatting
  animations.ts # Framer Motion variants
  utils.ts      # cn() class merge utility
types/
  product.ts    # Product, Variant, ProductImage, CategorySlug
  order.ts      # Order, OrderItem, OrderFormData
  admin.ts      # AdminOrder, DashboardStats, SiteSettings, OrderStatus, ORDER_STATUSES
data/
  products.ts   # LEGACY — 16 static products used for seed only, NOT the live data source
  categories.ts # LEGACY — static categories, seeded to DB
scripts/
  seed-products.ts  # One-time seed: writes data/products.ts → Supabase
middleware.ts   # Protects /admin/* (except /admin/login) via Supabase session check
```

### Data Flow

```
Supabase DB
    --> lib/data.ts (async functions, anon client)
        --> Server Components (pages in app/(public)/)
            --> Client Components (product cards, cart, wishlist)
                --> Zustand stores --> localStorage
```

Admin data flow:
```
Admin UI (client components)
    --> TanStack Query useMutation
        --> /api/admin/* route handlers
            --> lib/supabase/admin.ts (service role, bypasses RLS)
                --> Supabase DB
```

### Order Flow

```
Customer fills order form in /cart
    --> POST /api/orders
        --> Validate with Zod
        --> Insert order into Supabase orders table
        --> Format + send Telegram notification
        --> Redirect to /order-success
```

---

## Key Files

| File | Purpose |
|------|---------|
| `lib/data.ts` | All product/category/settings reads from Supabase |
| `lib/supabase/server.ts` | Anon Supabase client (cookies-aware, for public pages + session) |
| `lib/supabase/admin.ts` | Service role client — use ONLY in server-side admin routes |
| `lib/supabase/auth-check.ts` | `requireAdminAuth()` — must be called in every admin API handler |
| `middleware.ts` | Redirects unauthenticated requests away from `/admin/*` |
| `types/admin.ts` | Admin-specific types including `ORDER_STATUSES` constant |
| `app/layout.tsx` | Root layout — exports both `metadata` AND `viewport` (separate exports required) |
| `app/icon.tsx` | Favicon via `ImageResponse` from `next/og` — coral `#FF8C69` bg with white "cy" text |
| `app/manifest.ts` | PWA manifest — icons point to `/icon` (file-based convention) |
| `app/loading.tsx` | Root loading skeleton — minimal fallback (rarely triggered) |
| `app/error.tsx` | Root error boundary |
| `app/not-found.tsx` | Branded 404 page |
| `app/(public)/layout.tsx` | Public layout with Navbar + Footer |
| `app/(public)/products/loading.tsx` | Products page loading skeleton (centered header → pill row → 8-card grid) |
| `app/admin/layout.tsx` | Admin layout with sidebar + topbar |
| `app/api/admin/products/route.ts` | GET product list, POST create product |
| `app/api/admin/upload/route.ts` | POST image → Supabase Storage `product-images` bucket |

---

## Database (Supabase)

### Tables

**`products`**
- `id` text PK (auto: `prod-` + uuid prefix)
- `name`, `slug` (unique), `description`, `short_description` text
- `price` int (INR, whole number), `compare_at_price` int nullable
- `currency` text default `'INR'`
- `category` text (enum: amigurumi | accessories | home-decor | clothing | keychains | custom)
- `tags` text[]
- `images` jsonb (array of `{src, alt, isPrimary}`)
- `variants` jsonb (array of `{id, name, color, colorHex, inStock}`)
- `featured`, `is_new`, `in_stock` boolean
- `created_at`, `updated_at` timestamptz

**`orders`**
- `id` text PK (generated in app code)
- `customer_name`, `phone`, `address`, `city`, `pincode` text
- `email`, `notes` text nullable
- `items` jsonb (array of order items)
- `total_amount` int (INR)
- `status` text (enum: pending | confirmed | in_progress | shipped | delivered | cancelled)
- `order_date`, `updated_at` timestamptz

**`categories`**
- `slug` text PK
- `name`, `description`, `image`, `emoji` text
- `sort_order` int

**`site_settings`**
- `key` text PK
- `value` text
- `updated_at` timestamptz

### RLS Policies
- Products: public SELECT, no public INSERT/UPDATE/DELETE
- Orders: public INSERT (anyone can place an order), no public SELECT
- Categories: public SELECT
- Site settings: no public access
- Admin access via service role key bypasses all RLS

### Storage
- Bucket: `product-images` (public read)
- Admin can upload via `POST /api/admin/upload`

---

## Admin Panel

### Auth
- Supabase Auth (`signInWithPassword`) at `/admin/login`
- `middleware.ts` checks session cookie and redirects to `/admin/login` if missing
- API routes call `requireAdminAuth()` from `lib/supabase/auth-check.ts` — returns 401 if not authenticated

### Admin API Routes

| Route | Methods | Description |
|-------|---------|-------------|
| `/api/admin/products` | GET, POST | List products (supports `?q=`, `?category=`), create product |
| `/api/admin/products/[id]` | GET, PATCH, DELETE | Get, update, delete single product |
| `/api/admin/orders` | GET | List orders (supports `?status=`, `?q=`, `?page=`) |
| `/api/admin/orders/[id]` | GET, PATCH | Get order detail, update status only |
| `/api/admin/categories` | GET, PUT | Get all categories, replace all |
| `/api/admin/dashboard` | GET | Stats: total products, orders, revenue, recent orders |
| `/api/admin/settings` | GET, PUT | Get/update site settings key-value pairs |
| `/api/admin/upload` | POST | Upload image file → Supabase Storage |

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL (public, safe for client) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon key (public, enforces RLS) |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes (admin) | Service role key — bypasses RLS, server-only, never expose to client |
| `TELEGRAM_BOT_TOKEN` | Yes | Bot token for order notifications |
| `TELEGRAM_CHAT_ID` | Yes | Chat/group ID to receive order messages |

---

## npm Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run test` | Run tests in watch mode |
| `npm run test:run` | Run tests once |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run seed` | Seed Supabase with data from `data/products.ts` (one-time setup) |

---

## Important Patterns & Conventions

### Dynamic Rendering
All public data pages use:
```ts
export const dynamic = 'force-dynamic';
```
This prevents stale cached product data. Do NOT use `generateStaticParams` — products are managed live via the admin panel.

### TanStack Query v5
`onSuccess` callback was removed in v5. Use `useEffect` to react to query results:
```ts
// WRONG (v4 pattern — will not work):
useQuery({ queryKey: ['x'], queryFn: fn, onSuccess: (data) => ... })

// CORRECT (v5 pattern):
const { data } = useQuery({ queryKey: ['x'], queryFn: fn })
useEffect(() => { if (data) { ... } }, [data])
```

### Supabase Client Selection
- `lib/supabase/server.ts` → use in public pages and middleware (anon key, respects RLS)
- `lib/supabase/admin.ts` → use ONLY in `app/api/admin/*` route handlers (service role, bypasses RLS)
- Never import `admin.ts` in client components or public API routes

### Admin API Routes Pattern
Every admin route handler must start with:
```ts
const { supabase, error } = await requireAdminAuth();
if (error) return error; // returns NextResponse with 401
```

### Design Tokens
- Border: `border-border`
- Shadow: `shadow-hard-sm`, `shadow-hard`
- Font: `font-heading` (Outfit), body uses Plus Jakarta Sans
- Border radius: `rounded-2xl` for cards
- Colors: peach/warm theme via CSS variables in `globals.css`

### Component Placement
- Admin-only components → `components/admin/`
- Public storefront components → `components/product/`, `components/cart/`, etc.
- shadcn/ui primitives → `components/ui/` (do not manually edit these)

### Loading UI (Skeleton Screens)
Each data-fetching route segment has a co-located `loading.tsx` that renders a skeleton matching the real page layout. Uses Next.js built-in Suspense integration — no manual `<Suspense>` wrappers needed.

Key files:
- `app/loading.tsx` — minimal root fallback (2 skeletons, rarely triggered)
- `app/(public)/products/loading.tsx` — full products page skeleton: centered header → category pill row → 8-card grid

Skeleton component: `components/product/product-card-skeleton.tsx`
- Uses `bg-primary/10` / `bg-primary/8` for warm peach shimmer (NOT grey `bg-muted`)
- Must have `w-full` on outer div so it fills grid cells
- Grid in `loading.tsx` MUST match `ProductGrid` exactly: `grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6`

**Rule:** `loading.tsx` must live at the SAME route level as the page it covers, so it renders inside the correct layout wrapper (with Navbar/Footer). A `loading.tsx` at `app/` renders WITHOUT the public layout — always prefer `app/(public)/products/loading.tsx` over `app/loading.tsx` for public pages.

### Metadata + Viewport
`app/layout.tsx` exports both `metadata` AND `viewport` as separate named exports:
```ts
export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#FF8C69' }
```
Next.js 16 does not allow `viewport` inside the `metadata` object — they must be separate exports.

---

## Current State (as of 2026-03)

### Fully Implemented
- Public storefront: homepage, product catalog, product detail, cart, wishlist, order submission
- Order notifications via Telegram
- Admin panel: dashboard, products CRUD with image upload, orders management, categories editor, site settings
- Supabase database with RLS
- Admin auth via Supabase Auth + middleware
- Favicon + PWA manifest (`app/icon.tsx`, `app/manifest.ts`)
- Loading skeletons with warm peach shimmer for all public routes
- Branded empty states (cart, wishlist, products page, admin tables)
- Root error boundary + 404 page (`app/error.tsx`, `app/not-found.tsx`)
- Viewport metadata export + homepage OG metadata

### Not Yet Implemented
- Customer-facing accounts / order tracking
- Search functionality on storefront
- Product reviews
- Payment gateway integration (currently COD/manual)
- Email notifications to customers

---

## Testing

### API Tests
- Tests live in `app/api/__tests__/` — one file per route group
- Route handlers are imported and called directly (no HTTP server needed)
- Key mocks per file: `@/lib/supabase/auth-check`, `@/lib/supabase/admin`, `next/cache`, `next/server` (`after` as sync no-op via `vi.mock`)
- `vitest.config.ts` coverage includes `app/api/**`
- Run all tests: `npm run test:run` (196 tests across 18 files)

### Image Guard Pattern
When rendering `<Image src={...}>` from data that may be empty/null, always guard:
```tsx
{someValue ? <Image src={someValue} ... /> : <div className="absolute inset-0 bg-primary/20" />}
```
This prevents the Next.js Image Optimizer 400 error and browser empty-src warnings.

---

## DO NOT

- **Do not edit `data/products.ts` to manage products** — this file is legacy/seed-only. All product management happens through the admin panel at `/admin/products`.
- **Do not use `generateStaticParams`** for product pages — products are dynamic and managed live.
- **Do not import `lib/supabase/admin.ts`** in client components or non-admin API routes — it uses the service role key.
- **Do not use `onSuccess` in `useQuery`** — it was removed in TanStack Query v5.
- **Do not bypass `requireAdminAuth()`** in admin API routes — all admin endpoints must be authenticated.
- **Do not add `SUPABASE_SERVICE_ROLE_KEY` to any `NEXT_PUBLIC_*` variable** — it must remain server-side only.

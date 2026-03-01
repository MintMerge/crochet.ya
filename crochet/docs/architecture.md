# Architecture Overview

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| UI | React 19 |
| Styling | Tailwind CSS 3.4 + CSS Variables |
| Components | shadcn/ui (12 components) |
| State | Zustand 5 (cart + wishlist with localStorage persist) |
| Forms | React Hook Form + Zod validation |
| Animation | Framer Motion 11 |
| Icons | Lucide React |
| HTTP | Axios |
| Testing | Vitest + React Testing Library |

## Directory Structure

```
crochet/
  app/                    # Next.js App Router pages
    api/orders/           # Order submission API route
    cart/                 # Cart page
    order-success/        # Post-order confirmation
    products/             # Product catalog + detail pages
    wishlist/             # Wishlist page
    globals.css           # Theme CSS variables
    layout.tsx            # Root layout (fonts, nav, footer)
    page.tsx              # Homepage
  components/
    ui/                   # shadcn/ui primitives
    layout/               # Navbar, Footer, MobileNav, PageContainer
    product/              # ProductCard, ProductGrid, ProductGallery, ProductInfo
    cart/                 # CartItem, CartSummary, OrderForm, EmptyCart
    wishlist/             # EmptyWishlist
    home/                 # HeroSection, CategoryGrid, FeaturedProducts, NewArrivals
  data/
    products.ts           # Product catalog data
    categories.ts         # Category definitions
  hooks/                  # Custom React hooks
  lib/
    stores/               # Zustand stores (cart, wishlist)
    external/             # Telegram API client
    validations/          # Zod schemas
    data.ts               # Data access helpers
    format.ts             # Price formatting, order formatting
    animations.ts         # Framer Motion variants
    utils.ts              # cn() class merge utility
  types/                  # TypeScript type definitions
  tests/                  # Test setup and integration tests
  docs/                   # Project documentation
```

## Data Flow

```
data/products.ts  -->  lib/data.ts  -->  Server Components (pages)
                                              |
                                        Client Components
                                              |
                                    Zustand Stores (cart/wishlist)
                                              |
                                        localStorage
```

Products are stored as a static TypeScript file. Data helper functions in `lib/data.ts` provide typed access. Pages are server components that import data directly. Interactive features (cart, wishlist, variants) use client components with Zustand stores persisted to localStorage.

## Order Flow

```
Customer adds items to cart
    --> Cart page shows items + order form
    --> Form validates with Zod
    --> POST /api/orders
    --> Server formats message + calls Telegram Bot API
    --> Success: redirect to /order-success
    --> Owner receives formatted order on Telegram
```

## Key Design Decisions

1. **Static product data** - Products are in a `.ts` file for simplicity. No database needed for MVP. Easy to migrate to CMS later.
2. **localStorage persistence** - Cart and wishlist survive page refreshes without user accounts.
3. **Hydration safety** - `useMounted()` hook prevents SSR/client mismatch for localStorage-dependent UI.
4. **Flat component structure** - Grouped by domain (product, cart, home) rather than atomic design, appropriate for MVP scale.
5. **shadcn/ui base** - Provides accessible, customizable primitives. Custom `playful` button variant adds brand personality.

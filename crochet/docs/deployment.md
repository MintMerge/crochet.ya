# Deployment Guide

## Prerequisites

Before deploying, you need a Supabase project set up. See [Admin Setup Guide](./admin-setup.md) for step-by-step instructions to:
- Create the database schema
- Create an admin user
- Get your service role key
- Seed the initial product data

## Vercel (Recommended)

### Step 1: Set Up Supabase

Complete the full [Admin Setup Guide](./admin-setup.md) first. You'll need all 5 environment variables before deploying.

### Step 2: Connect Repository

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your GitHub repository
4. Vercel auto-detects Next.js — no config needed

### Step 3: Set Environment Variables

In Vercel project settings → **Environment Variables**, add all 5:

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL (e.g. `https://xxxx.supabase.co`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-only, bypasses RLS) |
| `TELEGRAM_BOT_TOKEN` | Your Telegram bot token |
| `TELEGRAM_CHAT_ID` | Your Telegram chat/group ID |

> **Security note**: `SUPABASE_SERVICE_ROLE_KEY` is never exposed to the browser. Only add it as a server-side variable (not prefixed with `NEXT_PUBLIC_`).

### Step 4: Deploy

Click "Deploy". Vercel builds and deploys automatically. Future pushes to `main` trigger automatic re-deployments.

### Step 5: Custom Domain

1. Go to Project Settings → Domains
2. Add your custom domain
3. Configure DNS as instructed

## Post-Deployment Checklist

### Storefront
- [ ] Homepage loads with products and categories
- [ ] Product catalog and detail pages work
- [ ] Add to cart works
- [ ] Wishlist heart toggle works
- [ ] Cart persists on page refresh
- [ ] Order form validates correctly
- [ ] Order submission saves to Supabase and sends Telegram message
- [ ] Order success page displays
- [ ] Mobile responsive layout works

### Admin Panel
- [ ] `/admin/login` page loads
- [ ] Admin can log in with Supabase credentials
- [ ] Dashboard shows stats
- [ ] Product list loads from Supabase
- [ ] Order list shows submitted orders
- [ ] Image upload works (Supabase Storage)

## Build Configuration

No special build configuration is needed. The default Next.js build handles everything:

- All public data pages use `force-dynamic` — no SSG, always fresh data from Supabase
- `/api/orders` and all `/api/admin/*` routes run as serverless functions
- Images from Supabase Storage are served via the Supabase CDN

## Updating Products

**Do not edit `data/products.ts`** — that file is only used for the one-time seed operation.

To manage products after deployment:
1. Go to `/admin/products` on your live site (or locally)
2. Use the admin UI to create, edit, or delete products
3. Changes are immediate — no rebuild or redeploy needed

## Updating Site Settings

Use the admin panel at `/admin/settings` to update:
- Shop name and tagline
- Contact information
- Instagram handle
- Announcement banner text

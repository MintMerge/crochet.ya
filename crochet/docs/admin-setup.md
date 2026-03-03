# Admin Panel Setup Guide

## Step 1: Run the Supabase SQL Schema

Go to your Supabase project dashboard → **SQL Editor** → paste and run:

```sql
-- Products
create table public.products (
  id               text primary key default ('prod-' || substr(gen_random_uuid()::text,1,8)),
  name             text not null,
  slug             text not null unique,
  description      text not null default '',
  short_description text not null default '',
  price            integer not null,
  compare_at_price integer,
  currency         text not null default 'INR',
  category         text not null,
  tags             text[] not null default '{}',
  images           jsonb not null default '[]',
  variants         jsonb not null default '[]',
  featured         boolean not null default false,
  is_new           boolean not null default false,
  in_stock         boolean not null default true,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  constraint products_category_check check (
    category in ('amigurumi','accessories','home-decor','clothing','keychains','custom')
  )
);

-- Orders
create table public.orders (
  id            text primary key,
  customer_name text not null,
  phone         text not null,
  email         text,
  address       text not null,
  city          text not null,
  pincode       text not null,
  notes         text,
  items         jsonb not null,
  total_amount  integer not null,
  status        text not null default 'pending',
  order_date    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  constraint orders_status_check check (
    status in ('pending','confirmed','in_progress','shipped','delivered','cancelled')
  )
);

-- Categories
create table public.categories (
  slug        text primary key,
  name        text not null,
  description text not null default '',
  image       text not null default '',
  emoji       text not null default '',
  sort_order  integer not null default 0
);

-- Site settings
create table public.site_settings (
  key        text primary key,
  value      text not null,
  updated_at timestamptz not null default now()
);

-- Auto-update updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

create trigger products_updated_at before update on public.products
  for each row execute function public.set_updated_at();
create trigger orders_updated_at before update on public.orders
  for each row execute function public.set_updated_at();

-- RLS
alter table public.products      enable row level security;
alter table public.orders        enable row level security;
alter table public.categories    enable row level security;
alter table public.site_settings enable row level security;

create policy "products_public_read" on public.products for select using (true);
create policy "categories_public_read" on public.categories for select using (true);
create policy "orders_public_insert" on public.orders for insert with check (true);

-- Storage bucket
insert into storage.buckets (id, name, public) values ('product-images','product-images',true)
on conflict do nothing;

create policy "product_images_public_read" on storage.objects
  for select using (bucket_id = 'product-images');
create policy "product_images_admin_insert" on storage.objects
  for insert with check (bucket_id = 'product-images');
```

---

## Step 2: Create Admin User

In Supabase Dashboard → **Authentication** → **Users** → **Add User**:
- Email: your email
- Password: a strong password
- Click **Create User**

---

## Step 3: Get the Service Role Key

In Supabase Dashboard → **Project Settings** → **API** → copy the **service_role** key (NOT the anon key).

---

## Step 4: Update .env.local

Add to your `.env.local`:

```env
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

Your existing env vars should already have:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
TELEGRAM_BOT_TOKEN=your-telegram-bot-token
TELEGRAM_CHAT_ID=your-chat-id
```

---

## Step 5: Seed Products

Run the seed script to populate Supabase with the existing 16 products and categories:

```bash
npm run seed
```

This is a one-time operation. Safe to run multiple times (uses upsert).

---

## Step 6: Start Dev Server

```bash
npm run dev
```

Visit `http://localhost:3000/admin/login` and sign in with the credentials you created in Step 2.

---

## Admin Routes

| URL | Description |
|-----|-------------|
| `/admin/login` | Sign in page |
| `/admin/dashboard` | Overview stats + recent orders |
| `/admin/products` | Product list |
| `/admin/products/new` | Add new product |
| `/admin/products/[id]` | Edit product |
| `/admin/orders` | Order list with filters |
| `/admin/orders/[id]` | Order detail + status update |
| `/admin/categories` | Edit category display info |
| `/admin/settings` | Shop settings |

-- Crochet Ya — Supabase Schema
-- Run via: npm run migrate
-- Idempotent: safe to run multiple times

-- ─── Tables ────────────────────────────────────────────────────────────────

-- Products
create table if not exists public.products (
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
create table if not exists public.orders (
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
create table if not exists public.categories (
  slug        text primary key,
  name        text not null,
  description text not null default '',
  image       text not null default '',
  emoji       text not null default '',
  sort_order  integer not null default 0
);

-- Site settings
create table if not exists public.site_settings (
  key        text primary key,
  value      text not null,
  updated_at timestamptz not null default now()
);

-- ─── Triggers ──────────────────────────────────────────────────────────────

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

do $$ begin
  create trigger products_updated_at before update on public.products
    for each row execute function public.set_updated_at();
exception when duplicate_object then null;
end $$;

do $$ begin
  create trigger orders_updated_at before update on public.orders
    for each row execute function public.set_updated_at();
exception when duplicate_object then null;
end $$;

-- ─── Row Level Security ────────────────────────────────────────────────────

alter table public.products      enable row level security;
alter table public.orders        enable row level security;
alter table public.categories    enable row level security;
alter table public.site_settings enable row level security;

do $$ begin
  create policy "products_public_read" on public.products for select using (true);
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "categories_public_read" on public.categories for select using (true);
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "orders_public_insert" on public.orders for insert with check (true);
exception when duplicate_object then null;
end $$;

-- ─── Storage ───────────────────────────────────────────────────────────────

insert into storage.buckets (id, name, public)
  values ('product-images', 'product-images', true)
  on conflict do nothing;

do $$ begin
  create policy "product_images_public_read" on storage.objects
    for select using (bucket_id = 'product-images');
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "product_images_admin_insert" on storage.objects
    for insert with check (bucket_id = 'product-images');
exception when duplicate_object then null;
end $$;

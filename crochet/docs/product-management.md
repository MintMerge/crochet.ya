# Product Management Guide

Products are managed through the admin panel. **Do not edit `data/products.ts`** to add or change products — that file is legacy and only used for the one-time database seed.

## Accessing the Admin Panel

Navigate to `/admin` (or `/admin/login`) and sign in with your Supabase credentials. See [Admin Setup Guide](./admin-setup.md) for first-time setup.

---

## Creating a Product

1. Go to **Admin → Products** (`/admin/products`)
2. Click **"New Product"**
3. Fill in the product form:
   - **Name** — display name (e.g. "Bunny Amigurumi")
   - **Slug** — URL-friendly ID, auto-generated from name (e.g. `bunny-amigurumi`)
   - **Short Description** — one-liner shown on product cards
   - **Description** — full description shown on product detail page
   - **Price** — in INR, whole number (e.g. `499`)
   - **Compare At Price** — optional original price for sale display
   - **Category** — select from dropdown (amigurumi, accessories, home-decor, clothing, keychains, custom)
   - **Tags** — comma-separated (e.g. `new, gift, bunny`)
   - **Featured** — check to show on homepage "Featured" section
   - **New** — check to show "New" badge on product card
   - **In Stock** — uncheck to disable "Add to Cart"
4. Upload product images (see below)
5. Add variants if the product comes in multiple colors/sizes (see below)
6. Click **Save**

---

## Uploading Images

On the product form, use the image uploader to upload photos directly. Images are stored in Supabase Storage (`product-images` bucket) and served via the Supabase CDN.

- Upload multiple images per product
- Mark one image as **Primary** — this is the image shown on product cards
- Images are stored with public URLs, no authentication needed to view

---

## Managing Variants

Variants represent product options (e.g. different colors of the same item).

On the product form, in the **Variants** section:
- Click **"Add Variant"** to add a color/size option
- Each variant has:
  - **Name** — e.g. "Pink", "Blue", "Small"
  - **Color** — display name for the color swatch
  - **Color Hex** — hex code for the color swatch (e.g. `#F4A4B4`)
  - **In Stock** — toggle per-variant stock status
- Leave variants empty if the product has no options

---

## Editing a Product

1. Go to **Admin → Products**
2. Find the product (use search or category filter)
3. Click on the product row or the edit icon
4. Make your changes and click **Save**

Changes are live immediately — no rebuild or redeploy needed.

---

## Deleting a Product

1. Go to **Admin → Products**
2. Find the product
3. Click the delete icon (trash) on the product row
4. Confirm deletion

Deleted products are removed from Supabase. The product page and all catalog listings update immediately.

---

## Managing Categories

Category display information (name, emoji, image, description) is managed at **Admin → Categories** (`/admin/categories`).

The 6 category slugs are fixed in the database schema:
- `amigurumi` — Amigurumi
- `accessories` — Accessories
- `home-decor` — Home Decor
- `clothing` — Tops & Wearables
- `keychains` — Keychains
- `custom` — Custom Orders

You can edit the display info (emoji, description, image URL) for each category. You cannot add or remove category slugs without a database schema change.

---

## Initial Data Migration (One-Time)

When setting up a new environment, run the seed script to populate Supabase from the static `data/products.ts` file:

```bash
npm run seed
```

This is safe to run multiple times — it uses upsert and won't duplicate products. After the initial seed, all product management happens through the admin panel.

---

## Notes

- `data/products.ts` is the legacy static data file used only for seeding. It is not the live data source.
- Changes made in the admin panel are stored in Supabase and take effect immediately without any code changes or deployments.
- Product images must be uploaded through the admin panel — local file paths are not supported in production.

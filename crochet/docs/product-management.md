# Product Management Guide

## Adding a New Product

1. Open `data/products.ts`
2. Add a new product object to the `products` array:

```typescript
{
  id: 'unique-id',           // e.g., 'ami-004'
  name: 'Product Name',
  slug: 'product-name',      // URL-friendly, lowercase, hyphenated
  description: 'Full description...',
  shortDescription: 'Brief one-liner for cards',
  price: 499,                // Price in INR (whole number)
  compareAtPrice: 699,       // Optional: original price for sale display
  currency: 'INR',
  category: 'amigurumi',     // Must match a CategorySlug
  tags: ['new', 'gift'],     // For search and badges
  images: [
    {
      src: 'https://images.unsplash.com/...',  // Image URL
      alt: 'Description of image',
      isPrimary: true,        // First image shown on card
    },
  ],
  variants: [                 // Optional: leave empty [] if no variants
    {
      id: 'variant-id',
      name: 'Color Name',
      color: 'Pink',
      colorHex: '#F4A4B4',   // For color swatch display
      inStock: true,
    },
  ],
  featured: false,            // Show on homepage "Featured" section
  isNew: true,                // Show "New" badge
  inStock: true,              // Set false to disable "Add to Cart"
  createdAt: '2026-03-01',    // ISO date string
}
```

## Adding Images

**Using Unsplash (recommended for placeholders):**
- Use URL format: `https://images.unsplash.com/photo-ID?w=600&h=600&fit=crop`

**Using local images:**
1. Place images in `public/images/products/your-product-slug/`
2. Reference as `/images/products/your-product-slug/main.jpg`
3. Add the domain to `next.config.js` if using external URLs

## Available Categories

| Slug | Name |
|------|------|
| `amigurumi` | Amigurumi |
| `accessories` | Accessories |
| `home-decor` | Home Decor |
| `clothing` | Tops & Wearables |
| `keychains` | Keychains |
| `custom` | Custom Orders |

## Adding a New Category

1. Add the slug to `CategorySlug` type in `types/product.ts`
2. Add category data to `data/categories.ts`
3. Add products with the new category slug

## Editing Products

Simply modify the product object in `data/products.ts`. Changes take effect on next build/deploy.

## Removing Products

Delete the product object from the array. If it was the only product in a category, the category section won't appear.

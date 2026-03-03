import { z } from 'zod'

export const CATEGORY_SLUGS = [
  'amigurumi',
  'accessories',
  'home-decor',
  'clothing',
  'keychains',
  'custom',
] as const

export const productImageSchema = z.object({
  src: z.string().min(1, 'Image URL required'),
  alt: z.string().min(1, 'Alt text required'),
  isPrimary: z.boolean(),
})

export const productVariantSchema = z.object({
  id: z.string().min(1, 'Variant ID required'),
  name: z.string().min(1, 'Variant name required'),
  color: z.string().optional(),
  size: z.string().optional(),
  colorHex: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a valid hex color')
    .optional()
    .or(z.literal('')),
  price: z.number().positive().optional(),
  inStock: z.boolean(),
})

export const productFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  slug: z
    .string()
    .min(2, 'Slug required')
    .regex(/^[a-z0-9-]+$/, 'Slug: lowercase letters, numbers, and hyphens only'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  shortDescription: z.string().min(5).max(150, 'Short description max 150 characters'),
  price: z.number({ invalid_type_error: 'Price must be a number' }).positive('Price must be positive'),
  compareAtPrice: z.number().positive().optional().nullable(),
  currency: z.string().min(1),
  category: z.enum(CATEGORY_SLUGS, { required_error: 'Category required' }),
  tags: z.array(z.string()),
  images: z.array(productImageSchema).min(1, 'At least one image is required'),
  variants: z.array(productVariantSchema),
  featured: z.boolean(),
  isNew: z.boolean(),
  inStock: z.boolean(),
})

export type ProductFormValues = z.infer<typeof productFormSchema>

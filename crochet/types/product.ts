export interface ProductImage {
  src: string
  alt: string
  isPrimary: boolean
}

export interface ProductVariant {
  id: string
  name: string
  color?: string
  size?: string
  colorHex?: string
  price?: number
  inStock: boolean
}

export type CategorySlug =
  | 'amigurumi'
  | 'accessories'
  | 'home-decor'
  | 'clothing'
  | 'keychains'
  | 'custom'

export interface Product {
  id: string
  name: string
  slug: string
  description: string
  shortDescription: string
  price: number
  compareAtPrice?: number
  currency: string
  category: CategorySlug
  tags: string[]
  images: ProductImage[]
  variants: ProductVariant[]
  featured: boolean
  isNew: boolean
  inStock: boolean
  createdAt: string
}

export interface Category {
  slug: CategorySlug
  name: string
  description: string
  image: string
  emoji: string
}

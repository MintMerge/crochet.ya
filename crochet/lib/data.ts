import { createClient } from '@/lib/supabase/server'
import type { Product, Category, CategorySlug } from '@/types'

function mapProduct(row: Record<string, unknown>): Product {
  return {
    id: row.id as string,
    name: row.name as string,
    slug: row.slug as string,
    description: row.description as string,
    shortDescription: row.short_description as string,
    price: row.price as number,
    compareAtPrice: row.compare_at_price as number | undefined,
    currency: row.currency as string,
    category: row.category as CategorySlug,
    tags: row.tags as string[],
    images: row.images as Product['images'],
    variants: row.variants as Product['variants'],
    featured: row.featured as boolean,
    isNew: row.is_new as boolean,
    inStock: row.in_stock as boolean,
    createdAt: row.created_at as string,
  }
}

export async function getAllProducts(): Promise<Product[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return (data ?? []).map(mapProduct)
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .single()
  if (error) return undefined
  return mapProduct(data)
}

export async function getProductsByCategory(category: CategorySlug): Promise<Product[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('category', category)
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return (data ?? []).map(mapProduct)
}

export async function getFeaturedProducts(): Promise<Product[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('featured', true)
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return (data ?? []).map(mapProduct)
}

export async function getNewArrivals(limit = 6): Promise<Product[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_new', true)
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw new Error(error.message)
  return (data ?? []).map(mapProduct)
}

export async function getRelatedProducts(product: Product, limit = 4): Promise<Product[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('category', product.category)
    .neq('id', product.id)
    .limit(limit)
  if (error) throw new Error(error.message)
  return (data ?? []).map(mapProduct)
}

export async function getAllCategories(): Promise<Category[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true })
  if (error) throw new Error(error.message)
  return (data ?? []) as unknown as Category[]
}

export async function getCategoryBySlug(slug: CategorySlug): Promise<Category | undefined> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .single()
  if (error) return undefined
  return data as unknown as Category
}

export async function getCategoriesWithCount(): Promise<(Category & { productCount: number })[]> {
  const [categories, products] = await Promise.all([getAllCategories(), getAllProducts()])
  return categories.map((cat) => ({
    ...cat,
    productCount: products.filter((p) => p.category === cat.slug).length,
  }))
}

export async function searchProducts(query: string): Promise<Product[]> {
  const supabase = await createClient()
  const lower = query.toLowerCase()
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .or(`name.ilike.%${lower}%,description.ilike.%${lower}%`)
  if (error) throw new Error(error.message)
  return (data ?? []).map(mapProduct)
}

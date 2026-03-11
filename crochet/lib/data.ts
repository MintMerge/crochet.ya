import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { cacheLife, cacheTag } from 'next/cache'
import type { Product, Category, CategorySlug } from '@/types'

// Cookie-free Supabase client — safe to use inside `use cache` functions.
// Public reads (products, categories) don't need session cookies.
function createPublicClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

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
  'use cache'
  cacheLife('hours')
  cacheTag('products')

  const supabase = createPublicClient()
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return (data ?? []).map(mapProduct)
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  'use cache'
  cacheLife('hours')
  cacheTag('products', `product-${slug}`)

  const supabase = createPublicClient()
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .single()
  if (error) return undefined
  return mapProduct(data)
}

export async function getProductsByCategory(category: CategorySlug): Promise<Product[]> {
  'use cache'
  cacheLife('hours')
  cacheTag('products')

  const supabase = createPublicClient()
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('category', category)
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return (data ?? []).map(mapProduct)
}

export async function getFeaturedProducts(): Promise<Product[]> {
  'use cache'
  cacheLife('hours')
  cacheTag('products')

  const supabase = createPublicClient()
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('featured', true)
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return (data ?? []).map(mapProduct)
}

export async function getNewArrivals(limit = 6): Promise<Product[]> {
  'use cache'
  cacheLife('hours')
  cacheTag('products')

  const supabase = createPublicClient()
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
  'use cache'
  cacheLife('hours')
  cacheTag('products')

  const supabase = createPublicClient()
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
  'use cache'
  cacheLife('hours')
  cacheTag('categories')

  const supabase = createPublicClient()
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true })
  if (error) throw new Error(error.message)
  return (data ?? []) as unknown as Category[]
}

export async function getCategoryBySlug(slug: CategorySlug): Promise<Category | undefined> {
  'use cache'
  cacheLife('hours')
  cacheTag('categories')

  const supabase = createPublicClient()
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .single()
  if (error) return undefined
  return data as unknown as Category
}

export async function getCategoriesWithCount(): Promise<(Category & { productCount: number })[]> {
  'use cache'
  cacheLife('hours')
  cacheTag('products', 'categories')

  const [categories, products] = await Promise.all([getAllCategories(), getAllProducts()])
  return categories.map((cat) => ({
    ...cat,
    productCount: products.filter((p) => p.category === cat.slug).length,
  }))
}

// Fetches all products once and groups them by category — avoids N+1 query pattern on /products page
export async function getProductsGroupedByCategory(): Promise<
  (Category & { productCount: number; products: Product[] })[]
> {
  'use cache'
  cacheLife('hours')
  cacheTag('products', 'categories')

  const [categories, products] = await Promise.all([getAllCategories(), getAllProducts()])
  return categories
    .map((cat) => {
      const catProducts = products
        .filter((p) => p.category === cat.slug)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      return { ...cat, productCount: catProducts.length, products: catProducts }
    })
    .filter((cat) => cat.productCount > 0)
}

export async function searchProducts(query: string): Promise<Product[]> {
  // searchProducts is not cached — it takes dynamic user input
  const supabase = createPublicClient()
  const lower = query.toLowerCase()
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .or(`name.ilike.%${lower}%,description.ilike.%${lower}%`)
  if (error) throw new Error(error.message)
  return (data ?? []).map(mapProduct)
}

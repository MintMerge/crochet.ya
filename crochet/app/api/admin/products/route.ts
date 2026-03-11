import { NextRequest, NextResponse, after } from 'next/server'
import { z } from 'zod'
import { updateTag } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdminAuth } from '@/lib/supabase/auth-check'
import { productFormSchema } from '@/lib/validations/product'
import type { Product, CategorySlug } from '@/types'

function mapRow(row: Record<string, unknown>): Product {
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

// GET /api/admin/products — list all products with optional filters
export async function GET(request: NextRequest) {
  const { response: authError } = await requireAdminAuth()
  if (authError) return authError

  const { searchParams } = request.nextUrl
  const category = searchParams.get('category')
  const q = searchParams.get('q')

  const supabase = createAdminClient()
  let query = supabase.from('products').select('*').order('created_at', { ascending: false })

  if (category && category !== 'all') {
    query = query.eq('category', category)
  }
  if (q) {
    query = query.or(`name.ilike.%${q}%,short_description.ilike.%${q}%`)
  }

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ products: (data ?? []).map(mapRow) }, {
    headers: { 'Cache-Control': 'no-store' },
  })
}

// POST /api/admin/products — create a new product
export async function POST(request: NextRequest) {
  const { response: authError } = await requireAdminAuth()
  if (authError) return authError

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = productFormSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', details: parsed.error.errors }, { status: 400 })
  }

  const values = parsed.data
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('products')
    .insert({
      name: values.name,
      slug: values.slug,
      description: values.description,
      short_description: values.shortDescription,
      price: values.price,
      compare_at_price: values.compareAtPrice ?? null,
      currency: values.currency,
      category: values.category,
      tags: values.tags,
      images: values.images,
      variants: values.variants,
      featured: values.featured,
      is_new: values.isNew,
      in_stock: values.inStock,
    })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'A product with this slug already exists' }, { status: 409 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  after(() => updateTag('products'))
  return NextResponse.json({ product: mapRow(data) }, { status: 201, headers: { 'Cache-Control': 'no-store' } })
}

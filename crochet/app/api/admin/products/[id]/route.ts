import { NextRequest, NextResponse } from 'next/server'
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

// GET /api/admin/products/[id]
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { response: authError } = await requireAdminAuth()
  if (authError) return authError

  const { id } = await params
  const supabase = createAdminClient()
  const { data, error } = await supabase.from('products').select('*').eq('id', id).single()

  if (error) return NextResponse.json({ error: 'Product not found' }, { status: 404 })
  return NextResponse.json({ product: mapRow(data) })
}

// PATCH /api/admin/products/[id]
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { response: authError } = await requireAdminAuth()
  if (authError) return authError

  const { id } = await params

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
    .update({
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
    .eq('id', id)
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'A product with this slug already exists' }, { status: 409 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ product: mapRow(data) })
}

// DELETE /api/admin/products/[id]
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { response: authError } = await requireAdminAuth()
  if (authError) return authError

  const { id } = await params
  const supabase = createAdminClient()
  const { error } = await supabase.from('products').delete().eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

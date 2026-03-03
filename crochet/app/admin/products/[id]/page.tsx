import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import { AdminPageHeader } from '@/components/admin/shared/admin-page-header'
import { ProductForm } from '@/components/admin/products/product-form'
import type { Product, CategorySlug } from '@/types'

export const metadata: Metadata = { title: 'Edit Product' }

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

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = createAdminClient()
  const { data, error } = await supabase.from('products').select('*').eq('id', id).single()

  if (error || !data) notFound()

  const product = mapRow(data)

  return (
    <div>
      <AdminPageHeader
        title="Edit Product"
        description={`Editing: ${product.name}`}
      />
      <ProductForm product={product} />
    </div>
  )
}

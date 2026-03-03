import type { Metadata } from 'next'
import { AdminPageHeader } from '@/components/admin/shared/admin-page-header'
import { ProductForm } from '@/components/admin/products/product-form'

export const metadata: Metadata = { title: 'New Product' }

export default function NewProductPage() {
  return (
    <div>
      <AdminPageHeader
        title="New Product"
        description="Add a new product to your catalog"
      />
      <ProductForm />
    </div>
  )
}

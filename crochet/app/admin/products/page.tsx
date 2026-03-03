import type { Metadata } from 'next'
import { AdminPageHeader } from '@/components/admin/shared/admin-page-header'
import { ProductTable } from '@/components/admin/products/product-table'

export const metadata: Metadata = { title: 'Products' }

export default function ProductsPage() {
  return (
    <div>
      <AdminPageHeader
        title="Products"
        description="Manage your product catalog"
      />
      <ProductTable />
    </div>
  )
}

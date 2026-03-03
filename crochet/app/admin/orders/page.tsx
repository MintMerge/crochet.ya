import type { Metadata } from 'next'
import { AdminPageHeader } from '@/components/admin/shared/admin-page-header'
import { OrdersTable } from '@/components/admin/orders/orders-table'

export const metadata: Metadata = { title: 'Orders' }

export default function OrdersPage() {
  return (
    <div>
      <AdminPageHeader
        title="Orders"
        description="View and manage customer orders"
      />
      <OrdersTable />
    </div>
  )
}

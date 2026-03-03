import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createAdminClient } from '@/lib/supabase/admin'
import { AdminPageHeader } from '@/components/admin/shared/admin-page-header'
import { StatusBadge } from '@/components/admin/shared/status-badge'
import { StatusSelector } from '@/components/admin/orders/status-selector'
import { formatPrice } from '@/lib/format'
import type { AdminOrder } from '@/types'

export const metadata: Metadata = { title: 'Order Detail' }

function mapRow(row: Record<string, unknown>): AdminOrder {
  return {
    id: row.id as string,
    customerName: row.customer_name as string,
    phone: row.phone as string,
    email: row.email as string | undefined,
    address: row.address as string,
    city: row.city as string,
    pincode: row.pincode as string,
    notes: row.notes as string | undefined,
    items: row.items as AdminOrder['items'],
    totalAmount: row.total_amount as number,
    status: row.status as AdminOrder['status'],
    orderDate: row.order_date as string,
    updatedAt: row.updated_at as string,
  }
}

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = createAdminClient()
  const { data, error } = await supabase.from('orders').select('*').eq('id', id).single()

  if (error || !data) notFound()

  const order = mapRow(data)

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/admin/orders"
          className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-sm"
        >
          <ArrowLeft className="h-4 w-4" /> Orders
        </Link>
      </div>

      <div className="flex items-start justify-between mb-8 gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight font-mono">{order.id}</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Placed on{' '}
            {new Date(order.orderDate).toLocaleDateString('en-IN', {
              day: '2-digit', month: 'long', year: 'numeric',
              hour: '2-digit', minute: '2-digit', hour12: true,
            })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={order.status} />
          <StatusSelector orderId={order.id} currentStatus={order.status} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customer Info */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h2 className="font-semibold mb-4">Customer Details</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex gap-3">
              <dt className="text-muted-foreground w-20 shrink-0">Name</dt>
              <dd className="font-medium">{order.customerName}</dd>
            </div>
            <div className="flex gap-3">
              <dt className="text-muted-foreground w-20 shrink-0">Phone</dt>
              <dd>{order.phone}</dd>
            </div>
            {order.email && (
              <div className="flex gap-3">
                <dt className="text-muted-foreground w-20 shrink-0">Email</dt>
                <dd>{order.email}</dd>
              </div>
            )}
            <div className="flex gap-3">
              <dt className="text-muted-foreground w-20 shrink-0">Address</dt>
              <dd>
                {order.address}, {order.city} — {order.pincode}
              </dd>
            </div>
            {order.notes && (
              <div className="flex gap-3">
                <dt className="text-muted-foreground w-20 shrink-0">Notes</dt>
                <dd className="italic">{order.notes}</dd>
              </div>
            )}
          </dl>
        </div>

        {/* Order Items */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h2 className="font-semibold mb-4">Order Items</h2>
          <div className="space-y-3">
            {order.items.map((item, i) => (
              <div key={i} className="flex items-start justify-between gap-2 text-sm">
                <div>
                  <p className="font-medium">{item.name}</p>
                  {item.variantName && (
                    <p className="text-xs text-muted-foreground">{item.variantName}</p>
                  )}
                  <p className="text-xs text-muted-foreground">x{item.quantity}</p>
                </div>
                <p className="font-medium shrink-0">
                  {formatPrice(item.price * item.quantity)}
                </p>
              </div>
            ))}

            <div className="border-t border-border pt-3 flex items-center justify-between">
              <p className="font-semibold">Total</p>
              <p className="font-bold text-lg">{formatPrice(order.totalAmount)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

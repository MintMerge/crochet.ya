import Link from 'next/link'
import { ShoppingBag } from 'lucide-react'
import { formatPrice } from '@/lib/format'
import { StatusBadge } from '@/components/admin/shared/status-badge'
import type { OrderStatus } from '@/types'

interface RecentOrder {
  id: string
  customerName: string
  totalAmount: number
  status: string
  orderDate: string
}

interface RecentOrdersTableProps {
  orders: RecentOrder[]
}

export function RecentOrdersTable({ orders }: RecentOrdersTableProps) {
  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-2 text-center px-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <ShoppingBag className="h-5 w-5 text-muted-foreground" strokeWidth={1.5} />
        </div>
        <p className="text-sm font-medium">No orders yet</p>
        <p className="text-xs text-muted-foreground max-w-xs">
          They&apos;ll show up here as soon as customers start ordering
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-3 px-4 font-medium text-muted-foreground">Order</th>
            <th className="text-left py-3 px-4 font-medium text-muted-foreground">Customer</th>
            <th className="text-left py-3 px-4 font-medium text-muted-foreground">Total</th>
            <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
            <th className="text-left py-3 px-4 font-medium text-muted-foreground">Date</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
              <td className="py-3 px-4">
                <Link href={`/admin/orders/${order.id}`} className="font-medium text-primary hover:underline">
                  {order.id}
                </Link>
              </td>
              <td className="py-3 px-4 text-muted-foreground">{order.customerName}</td>
              <td className="py-3 px-4 font-medium">{formatPrice(order.totalAmount)}</td>
              <td className="py-3 px-4">
                <StatusBadge status={order.status as OrderStatus} />
              </td>
              <td className="py-3 px-4 text-muted-foreground">
                {new Date(order.orderDate).toLocaleDateString('en-IN', {
                  day: '2-digit', month: 'short', year: 'numeric',
                })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { Eye, PackageOpen } from 'lucide-react'
import { SearchInput } from '@/components/admin/shared/search-input'
import { StatusBadge } from '@/components/admin/shared/status-badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { formatPrice } from '@/lib/format'
import { ORDER_STATUSES, type AdminOrder, type OrderStatus } from '@/types'

const STATUS_FILTERS = [{ value: 'all', label: 'All' }, ...ORDER_STATUSES]

export function OrdersTable() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [page, setPage] = useState(1)

  const params = new URLSearchParams({ page: String(page) })
  if (search) params.set('q', search)
  if (status !== 'all') params.set('status', status)

  const { data, isLoading, error } = useQuery<{ orders: AdminOrder[]; total: number; pageSize: number }>({
    queryKey: ['admin-orders', search, status, page],
    queryFn: () => fetch(`/api/admin/orders?${params.toString()}`).then((r) => r.json()),
  })

  const orders = data?.orders ?? []
  const total = data?.total ?? 0
  const pageSize = data?.pageSize ?? 20
  const totalPages = Math.ceil(total / pageSize)

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <SearchInput
          value={search}
          onChange={(v) => { setSearch(v); setPage(1) }}
          placeholder="Search by name, phone, order ID..."
          className="w-72"
        />
        <div className="flex gap-1 flex-wrap">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s.value}
              onClick={() => { setStatus(s.value); setPage(1) }}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors border ${
                status === s.value
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'border-border text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-4 space-y-0">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="grid grid-cols-[1fr_1fr_1fr_1fr_1fr_1fr_auto] gap-4 items-center border-b border-border/50 py-3 px-4">
                <Skeleton className="h-4 w-24 bg-primary/10" />
                <Skeleton className="h-4 w-28 bg-primary/8" />
                <Skeleton className="h-4 w-24 bg-primary/8" />
                <Skeleton className="h-4 w-16 bg-primary/10" />
                <Skeleton className="h-6 w-20 rounded-full bg-primary/10" />
                <Skeleton className="h-4 w-20 bg-primary/8" />
                <Skeleton className="h-8 w-8 rounded-md bg-primary/8" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-16 text-destructive text-sm">
            Failed to load orders
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-center px-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <PackageOpen className="h-7 w-7 text-muted-foreground" strokeWidth={1.5} />
            </div>
            <p className="font-medium text-sm">
              {search || status !== 'all' ? 'No orders match your search' : 'No orders yet'}
            </p>
            <p className="text-muted-foreground text-xs max-w-xs">
              {search || status !== 'all'
                ? 'Try a different search term or filter'
                : 'Orders will appear here once customers start placing them'}
            </p>
          </div>
        ) : (
          <>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Order</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Customer</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Phone</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Total</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Date</th>
                  <th className="py-3 px-4" />
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                    <td className="py-3 px-4">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="font-mono text-xs text-primary hover:underline font-medium"
                      >
                        {order.id}
                      </Link>
                    </td>
                    <td className="py-3 px-4 font-medium">{order.customerName}</td>
                    <td className="py-3 px-4 text-muted-foreground">{order.phone}</td>
                    <td className="py-3 px-4 font-medium">{formatPrice(order.totalAmount)}</td>
                    <td className="py-3 px-4">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="py-3 px-4 text-muted-foreground text-xs">
                      {new Date(order.orderDate).toLocaleDateString('en-IN', {
                        day: '2-digit', month: 'short', year: 'numeric',
                      })}
                    </td>
                    <td className="py-3 px-4">
                      <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                        <Link href={`/admin/orders/${order.id}`}>
                          <Eye className="h-3.5 w-3.5" />
                        </Link>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} of {total}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => p - 1)}
                    disabled={page <= 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => p + 1)}
                    disabled={page >= totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

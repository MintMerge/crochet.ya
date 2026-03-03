import type { Metadata } from 'next'
import { ShoppingBag, Package, IndianRupee, Clock, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { StatCard } from '@/components/admin/dashboard/stat-card'
import { RecentOrdersTable } from '@/components/admin/dashboard/recent-orders-table'
import { AdminPageHeader } from '@/components/admin/shared/admin-page-header'
import { formatPrice } from '@/lib/format'

export const metadata: Metadata = { title: 'Dashboard' }

async function getDashboardData() {
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    ? process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000'
    : 'http://localhost:3000'

  // Use internal Supabase directly on server (avoid fetch loop)
  const { createAdminClient } = await import('@/lib/supabase/admin')
  const supabase = createAdminClient()

  const [ordersResult, productsResult, pendingResult, revenueResult, todayResult, recentResult] =
    await Promise.all([
      supabase.from('orders').select('*', { count: 'exact', head: true }),
      supabase.from('products').select('*', { count: 'exact', head: true }),
      supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('orders').select('total_amount').neq('status', 'cancelled'),
      supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .gte('order_date', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()),
      supabase.from('orders').select('*').order('order_date', { ascending: false }).limit(5),
    ])

  const totalRevenue = (revenueResult.data ?? []).reduce(
    (sum: number, row: { total_amount: number }) => sum + row.total_amount,
    0
  )

  return {
    stats: {
      totalOrders: ordersResult.count ?? 0,
      totalRevenue,
      pendingOrders: pendingResult.count ?? 0,
      totalProducts: productsResult.count ?? 0,
      newOrdersToday: todayResult.count ?? 0,
    },
    recentOrders: (recentResult.data ?? []).map((row: Record<string, unknown>) => ({
      id: row.id as string,
      customerName: row.customer_name as string,
      totalAmount: row.total_amount as number,
      status: row.status as string,
      orderDate: row.order_date as string,
    })),
  }
}

export default async function DashboardPage() {
  const { stats, recentOrders } = await getDashboardData()

  return (
    <div>
      <AdminPageHeader
        title="Dashboard"
        description="Overview of your shop"
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Orders"
          value={stats.totalOrders}
          icon={ShoppingBag}
          description="All time"
        />
        <StatCard
          title="Total Revenue"
          value={formatPrice(stats.totalRevenue)}
          icon={IndianRupee}
          description="Excluding cancelled"
        />
        <StatCard
          title="Pending Orders"
          value={stats.pendingOrders}
          icon={Clock}
          description="Awaiting action"
        />
        <StatCard
          title="Products"
          value={stats.totalProducts}
          icon={Package}
          description="In catalog"
        />
      </div>

      {stats.newOrdersToday > 0 && (
        <div className="mb-6 flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl p-4">
          <TrendingUp className="h-4 w-4 text-green-600" />
          <p className="text-sm text-green-700 font-medium">
            {stats.newOrdersToday} new {stats.newOrdersToday === 1 ? 'order' : 'orders'} in the last 24 hours
          </p>
        </div>
      )}

      {/* Recent Orders */}
      <div className="bg-card border border-border rounded-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="font-semibold">Recent Orders</h2>
          <Link href="/admin/orders" className="text-sm text-primary hover:underline">
            View all
          </Link>
        </div>
        <RecentOrdersTable orders={recentOrders} />
      </div>
    </div>
  )
}

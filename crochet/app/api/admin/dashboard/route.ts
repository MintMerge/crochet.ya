import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdminAuth } from '@/lib/supabase/auth-check'
import type { DashboardStats } from '@/types'

export async function GET() {
  const { response: authError } = await requireAdminAuth()
  if (authError) return authError

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
    (sum, row) => sum + (row.total_amount as number),
    0
  )

  const stats: DashboardStats = {
    totalOrders: ordersResult.count ?? 0,
    totalRevenue,
    pendingOrders: pendingResult.count ?? 0,
    totalProducts: productsResult.count ?? 0,
    newOrdersToday: todayResult.count ?? 0,
  }

  const recentOrders = (recentResult.data ?? []).map((row) => ({
    id: row.id as string,
    customerName: row.customer_name as string,
    totalAmount: row.total_amount as number,
    status: row.status as string,
    orderDate: row.order_date as string,
  }))

  return NextResponse.json({ stats, recentOrders })
}

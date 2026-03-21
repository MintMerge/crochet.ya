import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextResponse } from 'next/server'

vi.mock('@/lib/supabase/auth-check', () => ({ requireAdminAuth: vi.fn() }))
vi.mock('@/lib/supabase/admin', () => ({ createAdminClient: vi.fn() }))
vi.mock('next/cache', () => ({ revalidateTag: vi.fn(), cacheLife: vi.fn(), cacheTag: vi.fn() }))

import { requireAdminAuth } from '@/lib/supabase/auth-check'
import { createAdminClient } from '@/lib/supabase/admin'
import { GET } from '@/app/api/admin/dashboard/route'

const authed = { user: { id: 'u1', email: 'admin@test.com' } as never, response: null }
const unauthed = { user: null, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }

const mockRecentOrder = {
  id: 'CY-001',
  customer_name: 'Priya S',
  total_amount: 500,
  status: 'pending',
  order_date: '2024-01-01T00:00:00Z',
}

// Build a mock Supabase client that handles the 6 parallel queries in dashboard
function buildDashboardClient({
  ordersCount = 10,
  productsCount = 5,
  pendingCount = 3,
  revenueData = [{ total_amount: 500 }, { total_amount: 300 }],
  todayCount = 2,
  recentData = [mockRecentOrder],
  error = null,
}: {
  ordersCount?: number
  productsCount?: number
  pendingCount?: number
  revenueData?: { total_amount: number }[]
  todayCount?: number
  recentData?: typeof mockRecentOrder[]
  error?: unknown
} = {}) {
  let callCount = 0

  const makeChainable = (data: unknown, count: number | null) => ({
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    neq: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    then: (resolve: (v: { data: unknown; error: unknown; count: number | null }) => void) =>
      Promise.resolve({ data, error, count }).then(resolve),
  })

  const fromFn = vi.fn(() => {
    callCount++
    switch (callCount) {
      case 1: return makeChainable(null, ordersCount)   // total orders count
      case 2: return makeChainable(null, productsCount) // total products count
      case 3: return makeChainable(null, pendingCount)  // pending orders count
      case 4: return makeChainable(revenueData, null)   // revenue data
      case 5: return makeChainable(null, todayCount)    // today's orders count
      case 6: return makeChainable(recentData, null)    // recent orders
      default: return makeChainable(null, 0)
    }
  })

  return { from: fromFn }
}

beforeEach(() => {
  vi.mocked(requireAdminAuth).mockResolvedValue(authed)
  vi.mocked(createAdminClient).mockReturnValue(buildDashboardClient() as never)
})

describe('GET /api/admin/dashboard', () => {
  it('returns 401 when unauthenticated', async () => {
    vi.mocked(requireAdminAuth).mockResolvedValue(unauthed)
    const res = await GET()
    expect(res.status).toBe(401)
  })

  it('returns 200 with stats and recentOrders', async () => {
    const res = await GET()
    const body = await res.json()
    expect(res.status).toBe(200)
    expect(body.stats).toBeDefined()
    expect(Array.isArray(body.recentOrders)).toBe(true)
  })

  it('calculates revenue as sum of non-cancelled orders', async () => {
    vi.mocked(createAdminClient).mockReturnValue(
      buildDashboardClient({
        revenueData: [{ total_amount: 500 }, { total_amount: 300 }, { total_amount: 200 }],
      }) as never
    )
    const res = await GET()
    const body = await res.json()
    expect(body.stats.totalRevenue).toBe(1000)
  })

  it('caps recentOrders at 5', async () => {
    const manyOrders = Array.from({ length: 10 }, (_, i) => ({
      ...mockRecentOrder,
      id: `CY-00${i}`,
    }))
    vi.mocked(createAdminClient).mockReturnValue(
      buildDashboardClient({ recentData: manyOrders.slice(0, 5) }) as never
    )
    const res = await GET()
    const body = await res.json()
    expect(body.recentOrders.length).toBeLessThanOrEqual(5)
  })

  it('returns all required stats fields as numbers', async () => {
    const res = await GET()
    const body = await res.json()
    const { stats } = body
    expect(typeof stats.totalOrders).toBe('number')
    expect(typeof stats.totalRevenue).toBe('number')
    expect(typeof stats.pendingOrders).toBe('number')
    expect(typeof stats.totalProducts).toBe('number')
    expect(typeof stats.newOrdersToday).toBe('number')
  })

  it('maps recentOrders to camelCase fields', async () => {
    const res = await GET()
    const body = await res.json()
    const order = body.recentOrders[0]
    expect(order.customerName).toBeDefined()
    expect(order.totalAmount).toBeDefined()
    expect(order.orderDate).toBeDefined()
    expect(order.customer_name).toBeUndefined()
  })

  it('defaults to zero when counts are null', async () => {
    vi.mocked(createAdminClient).mockReturnValue(
      buildDashboardClient({
        ordersCount: 0,
        productsCount: 0,
        pendingCount: 0,
        revenueData: [],
        todayCount: 0,
        recentData: [],
      }) as never
    )
    const res = await GET()
    const body = await res.json()
    expect(body.stats.totalOrders).toBe(0)
    expect(body.stats.totalRevenue).toBe(0)
    expect(body.recentOrders).toHaveLength(0)
  })
})

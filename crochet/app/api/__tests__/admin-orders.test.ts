import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'

vi.mock('@/lib/supabase/auth-check', () => ({ requireAdminAuth: vi.fn() }))
vi.mock('@/lib/supabase/admin', () => ({ createAdminClient: vi.fn() }))
vi.mock('next/cache', () => ({ updateTag: vi.fn(), cacheLife: vi.fn(), cacheTag: vi.fn() }))

import { requireAdminAuth } from '@/lib/supabase/auth-check'
import { createAdminClient } from '@/lib/supabase/admin'
import { GET } from '@/app/api/admin/orders/route'

const authed = { user: { id: 'u1', email: 'admin@test.com' } as never, response: null }
const unauthed = { user: null, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }

const mockOrder = {
  id: 'CY-001',
  customer_name: 'Priya S',
  phone: '9876543210',
  email: null,
  address: '123 Main St',
  city: 'Mumbai',
  pincode: '400001',
  notes: null,
  items: [],
  total_amount: 500,
  status: 'pending',
  order_date: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
}

function buildMockClient(data: unknown[] = [mockOrder], error: unknown = null, count = 1) {
  const terminal = { data, error, count }
  const chainable = {
    select: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    or: vi.fn().mockReturnThis(),
    range: vi.fn().mockReturnThis(),
    then: (resolve: (v: typeof terminal) => void) => Promise.resolve(terminal).then(resolve),
  }
  return { from: vi.fn().mockReturnValue(chainable) }
}

function makeGET(searchParams: Record<string, string> = {}) {
  const url = new URL('http://localhost/api/admin/orders')
  for (const [k, v] of Object.entries(searchParams)) url.searchParams.set(k, v)
  return new NextRequest(url.toString(), { method: 'GET' })
}

beforeEach(() => {
  vi.mocked(requireAdminAuth).mockResolvedValue(authed)
  vi.mocked(createAdminClient).mockReturnValue(buildMockClient() as never)
})

describe('GET /api/admin/orders', () => {
  it('returns 401 when unauthenticated', async () => {
    vi.mocked(requireAdminAuth).mockResolvedValue(unauthed)
    const res = await GET(makeGET())
    expect(res.status).toBe(401)
  })

  it('returns 200 with orders and pagination', async () => {
    vi.mocked(createAdminClient).mockReturnValue(
      buildMockClient([mockOrder, mockOrder, mockOrder], null, 3) as never
    )
    const res = await GET(makeGET())
    const body = await res.json()
    expect(res.status).toBe(200)
    expect(Array.isArray(body.orders)).toBe(true)
    expect(body.orders).toHaveLength(3)
    expect(body.total).toBe(3)
    expect(body.page).toBe(1)
    expect(body.pageSize).toBe(20)
  })

  it('passes status filter', async () => {
    const res = await GET(makeGET({ status: 'pending' }))
    const body = await res.json()
    expect(res.status).toBe(200)
    expect(Array.isArray(body.orders)).toBe(true)
  })

  it('does not filter when status=all', async () => {
    const res = await GET(makeGET({ status: 'all' }))
    const body = await res.json()
    expect(res.status).toBe(200)
    expect(Array.isArray(body.orders)).toBe(true)
  })

  it('passes search query', async () => {
    const res = await GET(makeGET({ q: 'priya' }))
    const body = await res.json()
    expect(res.status).toBe(200)
    expect(Array.isArray(body.orders)).toBe(true)
  })

  it('handles page=2 for pagination', async () => {
    const res = await GET(makeGET({ page: '2' }))
    const body = await res.json()
    expect(res.status).toBe(200)
    expect(body.page).toBe(2)
  })

  it('returns 500 on DB error', async () => {
    vi.mocked(createAdminClient).mockReturnValue(
      buildMockClient([], { message: 'DB error' }, 0) as never
    )
    const res = await GET(makeGET())
    expect(res.status).toBe(500)
  })

  it('maps snake_case DB fields to camelCase in response', async () => {
    const res = await GET(makeGET())
    const body = await res.json()
    expect(res.status).toBe(200)
    const order = body.orders[0]
    expect(order.customerName).toBeDefined()
    expect(order.totalAmount).toBeDefined()
    expect(order.orderDate).toBeDefined()
    expect(order.customer_name).toBeUndefined()
    expect(order.total_amount).toBeUndefined()
  })
})

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'

vi.mock('@/lib/supabase/auth-check', () => ({ requireAdminAuth: vi.fn() }))
vi.mock('@/lib/supabase/admin', () => ({ createAdminClient: vi.fn() }))
vi.mock('next/cache', () => ({ updateTag: vi.fn(), cacheLife: vi.fn(), cacheTag: vi.fn() }))

import { requireAdminAuth } from '@/lib/supabase/auth-check'
import { createAdminClient } from '@/lib/supabase/admin'
import { GET, PATCH } from '@/app/api/admin/orders/[id]/route'
import { ORDER_STATUSES } from '@/types/admin'

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

function buildMockClient(data: unknown = mockOrder, error: unknown = null) {
  const terminal = { data, error }
  const chainable = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue(terminal),
  }
  return { from: vi.fn().mockReturnValue(chainable) }
}

const params = Promise.resolve({ id: 'CY-001' })

function makeRequest(method: string, body?: unknown) {
  return new NextRequest('http://localhost/api/admin/orders/CY-001', {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body !== undefined ? (typeof body === 'string' ? body : JSON.stringify(body)) : undefined,
  })
}

beforeEach(() => {
  vi.mocked(requireAdminAuth).mockResolvedValue(authed)
  vi.mocked(createAdminClient).mockReturnValue(buildMockClient() as never)
})

describe('GET /api/admin/orders/[id]', () => {
  it('returns 401 when unauthenticated', async () => {
    vi.mocked(requireAdminAuth).mockResolvedValue(unauthed)
    const res = await GET(makeRequest('GET'), { params })
    expect(res.status).toBe(401)
  })

  it('returns 200 with order when found', async () => {
    const res = await GET(makeRequest('GET'), { params })
    const body = await res.json()
    expect(res.status).toBe(200)
    expect(body.order).toBeDefined()
    expect(body.order.id).toBe('CY-001')
  })

  it('returns 404 when order not found', async () => {
    vi.mocked(createAdminClient).mockReturnValue(
      buildMockClient(null, { message: 'not found' }) as never
    )
    const res = await GET(makeRequest('GET'), { params })
    const body = await res.json()
    expect(res.status).toBe(404)
    expect(body.error).toBe('Order not found')
  })
})

describe('PATCH /api/admin/orders/[id]', () => {
  it('returns 401 when unauthenticated', async () => {
    vi.mocked(requireAdminAuth).mockResolvedValue(unauthed)
    const res = await PATCH(makeRequest('PATCH', { status: 'confirmed' }), { params })
    expect(res.status).toBe(401)
  })

  it('returns 200 when updating to confirmed', async () => {
    vi.mocked(createAdminClient).mockReturnValue(
      buildMockClient({ ...mockOrder, status: 'confirmed' }) as never
    )
    const res = await PATCH(makeRequest('PATCH', { status: 'confirmed' }), { params })
    const body = await res.json()
    expect(res.status).toBe(200)
    expect(body.order).toBeDefined()
  })

  it('returns 200 when updating to delivered', async () => {
    vi.mocked(createAdminClient).mockReturnValue(
      buildMockClient({ ...mockOrder, status: 'delivered' }) as never
    )
    const res = await PATCH(makeRequest('PATCH', { status: 'delivered' }), { params })
    expect(res.status).toBe(200)
  })

  it('returns 400 for invalid status', async () => {
    const res = await PATCH(makeRequest('PATCH', { status: 'bogus' }), { params })
    const body = await res.json()
    expect(res.status).toBe(400)
    expect(body.error).toBe('Invalid status')
  })

  it('returns 400 for invalid JSON', async () => {
    const req = new NextRequest('http://localhost/api/admin/orders/CY-001', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: 'not-json',
    })
    const res = await PATCH(req, { params })
    const body = await res.json()
    expect(res.status).toBe(400)
    expect(body.error).toBe('Invalid JSON')
  })

  it('returns 200 for all valid statuses', async () => {
    for (const { value: status } of ORDER_STATUSES) {
      vi.mocked(createAdminClient).mockReturnValue(
        buildMockClient({ ...mockOrder, status }) as never
      )
      const res = await PATCH(makeRequest('PATCH', { status }), { params })
      expect(res.status).toBe(200)
    }
  })

  it('returns 500 on DB error', async () => {
    vi.mocked(createAdminClient).mockReturnValue(
      buildMockClient(null, { message: 'db error' }) as never
    )
    const res = await PATCH(makeRequest('PATCH', { status: 'confirmed' }), { params })
    expect(res.status).toBe(500)
  })
})

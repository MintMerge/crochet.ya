import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { NextRequest } from 'next/server'

vi.mock('@/lib/supabase/admin', () => ({ createAdminClient: vi.fn() }))
vi.mock('@/lib/external/telegram', () => ({ sendTelegramMessage: vi.fn() }))
vi.mock('next/cache', () => ({ updateTag: vi.fn(), cacheLife: vi.fn(), cacheTag: vi.fn() }))
vi.mock('next/server', async (importOriginal) => {
  const actual = await importOriginal<typeof import('next/server')>()
  return { ...actual, after: vi.fn((fn: () => void) => fn()) }
})

import { createAdminClient } from '@/lib/supabase/admin'
import { sendTelegramMessage } from '@/lib/external/telegram'
import { POST } from '@/app/api/orders/route'

const mockFrom = vi.fn()
const mockInsert = vi.fn().mockResolvedValue({ error: null })
function buildMockClient() {
  return {
    from: mockFrom.mockReturnValue({ insert: mockInsert }),
  }
}

const validOrder = {
  items: [
    {
      productId: 'p1',
      variantId: null,
      quantity: 1,
      price: 500,
      name: 'Bear',
      image: 'img.jpg',
      variantName: null,
    },
  ],
  customer: {
    customerName: 'Priya S',
    phone: '9876543210',
    email: '',
    address: '123 Main Street Apt 4',
    city: 'Mumbai',
    pincode: '400001',
    notes: '',
  },
  totalAmount: 500,
}

function makeRequest(body: unknown, ip = '1.2.3.4') {
  return new NextRequest('http://localhost/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-forwarded-for': ip },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  })
}

beforeEach(() => {
  vi.mocked(createAdminClient).mockReturnValue(buildMockClient() as never)
  vi.mocked(sendTelegramMessage).mockResolvedValue(true)
  process.env.TELEGRAM_CHAT_ID = 'chat123'
})

afterEach(() => {
  vi.clearAllMocks()
  // Clear rate limit state between tests by using unique IPs
})

describe('POST /api/orders', () => {
  it('returns 200 with orderId on valid order', async () => {
    const res = await POST(makeRequest(validOrder, '10.0.0.1'))
    const body = await res.json()
    expect(res.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.orderId).toMatch(/^CY-/)
  })

  it('returns 429 after 5 requests from same IP', async () => {
    const ip = '10.0.1.1'
    for (let i = 0; i < 5; i++) {
      await POST(makeRequest(validOrder, ip))
    }
    const res = await POST(makeRequest(validOrder, ip))
    expect(res.status).toBe(429)
  })

  it('returns 500 for invalid JSON body (non-Zod parse error)', async () => {
    const req = new NextRequest('http://localhost/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '10.0.2.1' },
      body: 'not-json',
    })
    const res = await POST(req)
    // JSON.parse failure is not a ZodError — caught by outer catch → 500
    expect(res.status).toBe(500)
  })

  it('returns 400 for empty items array', async () => {
    const res = await POST(makeRequest({ ...validOrder, items: [] }, '10.0.3.1'))
    const body = await res.json()
    expect(res.status).toBe(400)
    expect(body.error).toBe('Invalid order data')
  })

  it('returns 400 for invalid phone number', async () => {
    const res = await POST(
      makeRequest(
        { ...validOrder, customer: { ...validOrder.customer, phone: '1234567890' } },
        '10.0.4.1'
      )
    )
    const body = await res.json()
    expect(res.status).toBe(400)
    expect(body.error).toBe('Invalid order data')
  })

  it('returns 400 for invalid pincode (5 digits)', async () => {
    const res = await POST(
      makeRequest(
        { ...validOrder, customer: { ...validOrder.customer, pincode: '12345' } },
        '10.0.5.1'
      )
    )
    const body = await res.json()
    expect(res.status).toBe(400)
    expect(body.error).toBe('Invalid order data')
  })

  it('returns 400 when totalAmount is missing', async () => {
    const { totalAmount: _, ...noAmount } = validOrder
    const res = await POST(makeRequest(noAmount, '10.0.6.1'))
    const body = await res.json()
    expect(res.status).toBe(400)
    expect(body.error).toBe('Invalid order data')
  })

  it('returns 500 when Telegram send fails', async () => {
    vi.mocked(sendTelegramMessage).mockResolvedValue(false)
    const res = await POST(makeRequest(validOrder, '10.0.7.1'))
    const body = await res.json()
    expect(res.status).toBe(500)
    expect(body.error).toBe('Failed to send order notification')
  })

  it('still returns 200 when DB insert fails (best-effort)', async () => {
    mockInsert.mockResolvedValueOnce({ error: { message: 'DB down' } })
    const res = await POST(makeRequest(validOrder, '10.0.8.1'))
    const body = await res.json()
    expect(res.status).toBe(200)
    expect(body.success).toBe(true)
  })

  it('returns 200 with valid email', async () => {
    const res = await POST(
      makeRequest(
        { ...validOrder, customer: { ...validOrder.customer, email: 'test@test.com' } },
        '10.0.9.1'
      )
    )
    const body = await res.json()
    expect(res.status).toBe(200)
    expect(body.success).toBe(true)
  })

  it('returns 200 with notes at max length (500 chars)', async () => {
    const res = await POST(
      makeRequest(
        { ...validOrder, customer: { ...validOrder.customer, notes: 'x'.repeat(500) } },
        '10.0.10.1'
      )
    )
    const body = await res.json()
    expect(res.status).toBe(200)
    expect(body.success).toBe(true)
  })

  it('returns 400 with notes over max length (501 chars)', async () => {
    const res = await POST(
      makeRequest(
        { ...validOrder, customer: { ...validOrder.customer, notes: 'x'.repeat(501) } },
        '10.0.11.1'
      )
    )
    const body = await res.json()
    expect(res.status).toBe(400)
    expect(body.error).toBe('Invalid order data')
  })

  it('returns 500 when TELEGRAM_CHAT_ID is not configured', async () => {
    delete process.env.TELEGRAM_CHAT_ID
    const res = await POST(makeRequest(validOrder, '10.0.12.1'))
    const body = await res.json()
    expect(res.status).toBe(500)
    expect(body.error).toContain('not configured')
  })
})

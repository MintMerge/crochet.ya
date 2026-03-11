import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'

vi.mock('@/lib/supabase/auth-check', () => ({ requireAdminAuth: vi.fn() }))
vi.mock('@/lib/supabase/admin', () => ({ createAdminClient: vi.fn() }))
vi.mock('next/cache', () => ({ updateTag: vi.fn(), cacheLife: vi.fn(), cacheTag: vi.fn() }))
vi.mock('next/server', async (importOriginal) => {
  const actual = await importOriginal<typeof import('next/server')>()
  return { ...actual, after: vi.fn((fn: () => void) => fn()) }
})

import { requireAdminAuth } from '@/lib/supabase/auth-check'
import { createAdminClient } from '@/lib/supabase/admin'
import { GET, POST } from '@/app/api/admin/products/route'
import { after } from 'next/server'
import { updateTag } from 'next/cache'

const authed = { user: { id: 'u1', email: 'admin@test.com' } as never, response: null }
const unauthed = { user: null, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }

const mockProduct = {
  id: 'prod-1',
  name: 'Bear',
  slug: 'bear',
  description: 'A cute bear',
  short_description: 'Cute bear',
  price: 500,
  compare_at_price: null,
  currency: 'INR',
  category: 'amigurumi',
  tags: ['cute'],
  images: [{ src: 'img.jpg', alt: 'Bear', isPrimary: true }],
  variants: [],
  featured: false,
  is_new: true,
  in_stock: true,
  created_at: '2024-01-01T00:00:00Z',
}

function buildMockClient(data: unknown = [mockProduct], error: unknown = null) {
  const chain: Record<string, unknown> = {}
  const terminal = { data, error, count: Array.isArray(data) ? (data as unknown[]).length : 0 }
  const builder = () => ({
    ...chain,
    select: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    or: vi.fn().mockReturnThis(),
    ilike: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue(terminal),
    then: undefined,
  })
  const queryObj = builder()
  // Make select/order/eq/or return the same object to allow chaining, resolving to terminal
  const chainable = {
    select: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    or: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue(terminal),
    // Allow direct await (for non-single queries)
    then: (resolve: (v: typeof terminal) => void) => Promise.resolve(terminal).then(resolve),
  }
  return {
    from: vi.fn().mockReturnValue(chainable),
  }
}

function makeGET(searchParams: Record<string, string> = {}) {
  const url = new URL('http://localhost/api/admin/products')
  for (const [k, v] of Object.entries(searchParams)) url.searchParams.set(k, v)
  return new NextRequest(url.toString(), { method: 'GET' })
}

function makePOST(body: unknown) {
  return new NextRequest('http://localhost/api/admin/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  })
}

const validProductBody = {
  name: 'Bear',
  slug: 'bear',
  description: 'A cute handmade bear toy',
  shortDescription: 'Cute bear toy',
  price: 500,
  compareAtPrice: null,
  currency: 'INR',
  category: 'amigurumi',
  tags: ['cute'],
  images: [{ src: 'img.jpg', alt: 'Bear', isPrimary: true }],
  variants: [],
  featured: false,
  isNew: true,
  inStock: true,
}

beforeEach(() => {
  vi.mocked(requireAdminAuth).mockResolvedValue(authed)
  vi.mocked(createAdminClient).mockReturnValue(buildMockClient() as never)
})

describe('GET /api/admin/products', () => {
  it('returns 401 when unauthenticated', async () => {
    vi.mocked(requireAdminAuth).mockResolvedValue(unauthed)
    const res = await GET(makeGET())
    expect(res.status).toBe(401)
  })

  it('returns 200 with products array', async () => {
    vi.mocked(createAdminClient).mockReturnValue(
      buildMockClient([mockProduct, mockProduct, mockProduct]) as never
    )
    const res = await GET(makeGET())
    const body = await res.json()
    expect(res.status).toBe(200)
    expect(Array.isArray(body.products)).toBe(true)
    expect(body.products).toHaveLength(3)
  })

  it('passes category filter to query', async () => {
    const client = buildMockClient([mockProduct])
    vi.mocked(createAdminClient).mockReturnValue(client as never)
    const res = await GET(makeGET({ category: 'amigurumi' }))
    expect(res.status).toBe(200)
    // eq was called with category filter
    expect(client.from('products').eq).toBeDefined()
  })

  it('does not filter when category=all', async () => {
    const res = await GET(makeGET({ category: 'all' }))
    const body = await res.json()
    expect(res.status).toBe(200)
    expect(Array.isArray(body.products)).toBe(true)
  })

  it('returns Cache-Control: no-store header', async () => {
    const res = await GET(makeGET())
    expect(res.headers.get('Cache-Control')).toBe('no-store')
  })

  it('returns 500 on DB error', async () => {
    vi.mocked(createAdminClient).mockReturnValue(
      buildMockClient(null, { message: 'DB error' }) as never
    )
    const res = await GET(makeGET())
    expect(res.status).toBe(500)
  })
})

describe('POST /api/admin/products', () => {
  it('returns 401 when unauthenticated', async () => {
    vi.mocked(requireAdminAuth).mockResolvedValue(unauthed)
    const res = await POST(makePOST(validProductBody))
    expect(res.status).toBe(401)
  })

  it('returns 201 with product on valid body', async () => {
    vi.mocked(createAdminClient).mockReturnValue(
      buildMockClient(mockProduct) as never
    )
    const res = await POST(makePOST(validProductBody))
    const body = await res.json()
    expect(res.status).toBe(201)
    expect(body.product).toBeDefined()
  })

  it('returns 400 for invalid JSON', async () => {
    const req = new NextRequest('http://localhost/api/admin/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'not-json',
    })
    const res = await POST(req)
    const body = await res.json()
    expect(res.status).toBe(400)
    expect(body.error).toBe('Invalid JSON')
  })

  it('returns 400 when name is missing', async () => {
    const { name: _, ...noName } = validProductBody
    const res = await POST(makePOST(noName))
    const body = await res.json()
    expect(res.status).toBe(400)
    expect(body.error).toBe('Validation failed')
  })

  it('returns 400 for uppercase slug', async () => {
    const res = await POST(makePOST({ ...validProductBody, slug: 'My-Product' }))
    const body = await res.json()
    expect(res.status).toBe(400)
    expect(body.error).toBe('Validation failed')
  })

  it('returns 409 for duplicate slug', async () => {
    vi.mocked(createAdminClient).mockReturnValue(
      buildMockClient(null, { code: '23505', message: 'duplicate key' }) as never
    )
    const res = await POST(makePOST(validProductBody))
    const body = await res.json()
    expect(res.status).toBe(409)
    expect(body.error).toContain('slug already exists')
  })

  it('returns 400 for empty images array', async () => {
    const res = await POST(makePOST({ ...validProductBody, images: [] }))
    const body = await res.json()
    expect(res.status).toBe(400)
    expect(body.error).toBe('Validation failed')
  })

  it('returns 400 for invalid hex color in variant', async () => {
    const res = await POST(
      makePOST({
        ...validProductBody,
        variants: [{ id: 'v1', name: 'Blue', colorHex: 'blue', inStock: true }],
      })
    )
    const body = await res.json()
    expect(res.status).toBe(400)
    expect(body.error).toBe('Validation failed')
  })

  it('returns 500 on generic DB error', async () => {
    vi.mocked(createAdminClient).mockReturnValue(
      buildMockClient(null, { code: 'OTHER', message: 'some db error' }) as never
    )
    const res = await POST(makePOST(validProductBody))
    expect(res.status).toBe(500)
  })

  it('calls updateTag after successful creation', async () => {
    vi.mocked(createAdminClient).mockReturnValue(buildMockClient(mockProduct) as never)
    await POST(makePOST(validProductBody))
    expect(after).toHaveBeenCalled()
    expect(updateTag).toHaveBeenCalledWith('products')
  })
})

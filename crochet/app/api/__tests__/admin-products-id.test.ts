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
import { GET, PATCH, DELETE } from '@/app/api/admin/products/[id]/route'
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

function buildMockClient(data: unknown = mockProduct, error: unknown = null) {
  const terminal = { data, error }
  const chainable = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue(terminal),
    then: (resolve: (v: typeof terminal) => void) => Promise.resolve(terminal).then(resolve),
  }
  return { from: vi.fn().mockReturnValue(chainable) }
}

const params = Promise.resolve({ id: 'prod-1' })

function makeRequest(method: string, body?: unknown) {
  return new NextRequest('http://localhost/api/admin/products/prod-1', {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body !== undefined ? (typeof body === 'string' ? body : JSON.stringify(body)) : undefined,
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
  vi.clearAllMocks()
  vi.mocked(requireAdminAuth).mockResolvedValue(authed)
  vi.mocked(createAdminClient).mockReturnValue(buildMockClient() as never)
})

describe('GET /api/admin/products/[id]', () => {
  it('returns 401 when unauthenticated', async () => {
    vi.mocked(requireAdminAuth).mockResolvedValue(unauthed)
    const res = await GET(makeRequest('GET'), { params })
    expect(res.status).toBe(401)
  })

  it('returns 200 with product when found', async () => {
    const res = await GET(makeRequest('GET'), { params })
    const body = await res.json()
    expect(res.status).toBe(200)
    expect(body.product).toBeDefined()
    expect(res.headers.get('Cache-Control')).toBe('no-store')
  })

  it('returns 404 when product not found', async () => {
    vi.mocked(createAdminClient).mockReturnValue(
      buildMockClient(null, { message: 'not found' }) as never
    )
    const res = await GET(makeRequest('GET'), { params })
    const body = await res.json()
    expect(res.status).toBe(404)
    expect(body.error).toBe('Product not found')
  })
})

describe('PATCH /api/admin/products/[id]', () => {
  it('returns 401 when unauthenticated', async () => {
    vi.mocked(requireAdminAuth).mockResolvedValue(unauthed)
    const res = await PATCH(makeRequest('PATCH', validProductBody), { params })
    expect(res.status).toBe(401)
  })

  it('returns 200 with updated product', async () => {
    const res = await PATCH(makeRequest('PATCH', validProductBody), { params })
    const body = await res.json()
    expect(res.status).toBe(200)
    expect(body.product).toBeDefined()
  })

  it('returns 400 for invalid JSON', async () => {
    const res = await PATCH(makeRequest('PATCH', undefined), { params: Promise.resolve({ id: 'prod-1' }) })
    // We need to pass an invalid body
    const req = new NextRequest('http://localhost/api/admin/products/prod-1', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: 'not-json',
    })
    const res2 = await PATCH(req, { params })
    const body = await res2.json()
    expect(res2.status).toBe(400)
    expect(body.error).toBe('Invalid JSON')
  })

  it('returns 400 for validation failure', async () => {
    const res = await PATCH(makeRequest('PATCH', { name: 'x' }), { params })
    const body = await res.json()
    expect(res.status).toBe(400)
    expect(body.error).toBe('Validation failed')
  })

  it('returns 409 for duplicate slug', async () => {
    vi.mocked(createAdminClient).mockReturnValue(
      buildMockClient(null, { code: '23505', message: 'duplicate' }) as never
    )
    const res = await PATCH(makeRequest('PATCH', validProductBody), { params })
    const body = await res.json()
    expect(res.status).toBe(409)
    expect(body.error).toContain('slug already exists')
  })

  it('returns 500 on DB error', async () => {
    vi.mocked(createAdminClient).mockReturnValue(
      buildMockClient(null, { code: 'OTHER', message: 'db error' }) as never
    )
    const res = await PATCH(makeRequest('PATCH', validProductBody), { params })
    expect(res.status).toBe(500)
  })

  it('calls updateTag after successful update', async () => {
    await PATCH(makeRequest('PATCH', validProductBody), { params })
    expect(after).toHaveBeenCalled()
    expect(updateTag).toHaveBeenCalledWith('products')
  })
})

describe('DELETE /api/admin/products/[id]', () => {
  it('returns 401 when unauthenticated', async () => {
    vi.mocked(requireAdminAuth).mockResolvedValue(unauthed)
    const res = await DELETE(makeRequest('DELETE'), { params })
    expect(res.status).toBe(401)
  })

  it('returns 200 on successful delete', async () => {
    vi.mocked(createAdminClient).mockReturnValue(buildMockClient(null, null) as never)
    const res = await DELETE(makeRequest('DELETE'), { params })
    const body = await res.json()
    expect(res.status).toBe(200)
    expect(body.success).toBe(true)
  })

  it('returns 500 on DB error', async () => {
    vi.mocked(createAdminClient).mockReturnValue(
      buildMockClient(null, { message: 'delete failed' }) as never
    )
    const res = await DELETE(makeRequest('DELETE'), { params })
    expect(res.status).toBe(500)
  })

  it('calls updateTag after successful delete', async () => {
    vi.mocked(createAdminClient).mockReturnValue(buildMockClient(null, null) as never)
    await DELETE(makeRequest('DELETE'), { params })
    expect(after).toHaveBeenCalled()
    expect(updateTag).toHaveBeenCalledWith('products')
  })
})

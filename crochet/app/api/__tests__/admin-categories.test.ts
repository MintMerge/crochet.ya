import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'

vi.mock('@/lib/supabase/auth-check', () => ({ requireAdminAuth: vi.fn() }))
vi.mock('@/lib/supabase/admin', () => ({ createAdminClient: vi.fn() }))
vi.mock('next/cache', () => ({ revalidateTag: vi.fn(), cacheLife: vi.fn(), cacheTag: vi.fn() }))
vi.mock('next/server', async (importOriginal) => {
  const actual = await importOriginal<typeof import('next/server')>()
  return { ...actual, after: vi.fn((fn: () => void) => fn()) }
})

import { requireAdminAuth } from '@/lib/supabase/auth-check'
import { createAdminClient } from '@/lib/supabase/admin'
import { GET, PUT } from '@/app/api/admin/categories/route'
import { after } from 'next/server'
import { revalidateTag } from 'next/cache'

const authed = { user: { id: 'u1', email: 'admin@test.com' } as never, response: null }
const unauthed = { user: null, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }

const mockCategory = {
  slug: 'amigurumi',
  name: 'Amigurumi',
  description: 'Stuffed toys',
  image: 'img.jpg',
  emoji: '🧸',
  sort_order: 1,
}

function buildMockClient(data: unknown = [mockCategory], error: unknown = null) {
  const terminal = { data, error }
  const chainable = {
    select: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    upsert: vi.fn().mockReturnThis(),
    then: (resolve: (v: typeof terminal) => void) => Promise.resolve(terminal).then(resolve),
  }
  return { from: vi.fn().mockReturnValue(chainable) }
}

function makeGET() {
  return new NextRequest('http://localhost/api/admin/categories', { method: 'GET' })
}

function makePUT(body: unknown) {
  return new NextRequest('http://localhost/api/admin/categories', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  })
}

const validPayload = { categories: [mockCategory] }

beforeEach(() => {
  vi.mocked(requireAdminAuth).mockResolvedValue(authed)
  vi.mocked(createAdminClient).mockReturnValue(buildMockClient() as never)
})

describe('GET /api/admin/categories', () => {
  it('returns 401 when unauthenticated', async () => {
    vi.mocked(requireAdminAuth).mockResolvedValue(unauthed)
    const res = await GET()
    expect(res.status).toBe(401)
  })

  it('returns 200 with categories', async () => {
    const res = await GET()
    const body = await res.json()
    expect(res.status).toBe(200)
    expect(Array.isArray(body.categories)).toBe(true)
  })

  it('returns Cache-Control: no-store', async () => {
    const res = await GET()
    expect(res.headers.get('Cache-Control')).toBe('no-store')
  })

  it('returns 500 on DB error', async () => {
    vi.mocked(createAdminClient).mockReturnValue(
      buildMockClient(null, { message: 'db error' }) as never
    )
    const res = await GET()
    expect(res.status).toBe(500)
  })
})

describe('PUT /api/admin/categories', () => {
  it('returns 401 when unauthenticated', async () => {
    vi.mocked(requireAdminAuth).mockResolvedValue(unauthed)
    const res = await PUT(makePUT(validPayload))
    expect(res.status).toBe(401)
  })

  it('returns 200 with upserted categories', async () => {
    const res = await PUT(makePUT(validPayload))
    const body = await res.json()
    expect(res.status).toBe(200)
    expect(Array.isArray(body.categories)).toBe(true)
  })

  it('returns 400 for invalid JSON', async () => {
    const req = new NextRequest('http://localhost/api/admin/categories', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: 'not-json',
    })
    const res = await PUT(req)
    const body = await res.json()
    expect(res.status).toBe(400)
    expect(body.error).toBe('Invalid JSON')
  })

  it('returns 400 when category name is missing', async () => {
    const badPayload = {
      categories: [{ slug: 'amigurumi', description: 'toys', image: 'img.jpg', emoji: '🧸', sort_order: 1 }],
    }
    const res = await PUT(makePUT(badPayload))
    const body = await res.json()
    expect(res.status).toBe(400)
    expect(body.error).toBe('Validation failed')
  })

  it('returns 200 with empty categories array', async () => {
    vi.mocked(createAdminClient).mockReturnValue(buildMockClient([]) as never)
    const res = await PUT(makePUT({ categories: [] }))
    const body = await res.json()
    expect(res.status).toBe(200)
    expect(body.categories).toHaveLength(0)
  })

  it('returns 500 on DB error', async () => {
    vi.mocked(createAdminClient).mockReturnValue(
      buildMockClient(null, { message: 'db error' }) as never
    )
    const res = await PUT(makePUT(validPayload))
    expect(res.status).toBe(500)
  })

  it('calls revalidateTag for both categories and products after success', async () => {
    await PUT(makePUT(validPayload))
    expect(after).toHaveBeenCalled()
    expect(revalidateTag).toHaveBeenCalledWith('categories')
    expect(revalidateTag).toHaveBeenCalledWith('products')
  })
})

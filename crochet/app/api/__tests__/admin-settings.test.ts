import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'

vi.mock('@/lib/supabase/auth-check', () => ({ requireAdminAuth: vi.fn() }))
vi.mock('@/lib/supabase/admin', () => ({ createAdminClient: vi.fn() }))
vi.mock('next/cache', () => ({ updateTag: vi.fn(), cacheLife: vi.fn(), cacheTag: vi.fn() }))

import { requireAdminAuth } from '@/lib/supabase/auth-check'
import { createAdminClient } from '@/lib/supabase/admin'
import { GET, PUT } from '@/app/api/admin/settings/route'

const authed = { user: { id: 'u1', email: 'admin@test.com' } as never, response: null }
const unauthed = { user: null, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }

const mockSettingsRows = [
  { key: 'shop_name', value: 'Crochet Ya' },
  { key: 'shop_tagline', value: 'Handmade with love' },
  { key: 'contact_phone', value: '9876543210' },
  { key: 'contact_email', value: 'hello@crochetya.com' },
  { key: 'instagram_handle', value: '@crochetya' },
  { key: 'announcement_banner', value: '' },
]

const validSettings = {
  shop_name: 'Crochet Ya',
  shop_tagline: 'Handmade with love',
  contact_phone: '9876543210',
  contact_email: 'hello@crochetya.com',
  instagram_handle: '@crochetya',
  announcement_banner: '',
}

function buildMockClient(data: unknown = mockSettingsRows, error: unknown = null) {
  const terminal = { data, error }
  const chainable = {
    select: vi.fn().mockReturnThis(),
    upsert: vi.fn().mockReturnThis(),
    then: (resolve: (v: typeof terminal) => void) => Promise.resolve(terminal).then(resolve),
  }
  return { from: vi.fn().mockReturnValue(chainable) }
}

function makePUT(body: unknown) {
  return new NextRequest('http://localhost/api/admin/settings', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  })
}

beforeEach(() => {
  vi.mocked(requireAdminAuth).mockResolvedValue(authed)
  vi.mocked(createAdminClient).mockReturnValue(buildMockClient() as never)
})

describe('GET /api/admin/settings', () => {
  it('returns 401 when unauthenticated', async () => {
    vi.mocked(requireAdminAuth).mockResolvedValue(unauthed)
    const res = await GET()
    expect(res.status).toBe(401)
  })

  it('returns 200 with flat settings object', async () => {
    const res = await GET()
    const body = await res.json()
    expect(res.status).toBe(200)
    expect(body.settings).toBeDefined()
    expect(typeof body.settings).toBe('object')
  })

  it('converts rows to key-value flat object', async () => {
    const res = await GET()
    const body = await res.json()
    expect(body.settings.shop_name).toBe('Crochet Ya')
    expect(body.settings.shop_tagline).toBe('Handmade with love')
    expect(body.settings.contact_phone).toBe('9876543210')
  })

  it('returns 500 on DB error', async () => {
    vi.mocked(createAdminClient).mockReturnValue(
      buildMockClient(null, { message: 'db error' }) as never
    )
    const res = await GET()
    expect(res.status).toBe(500)
  })
})

describe('PUT /api/admin/settings', () => {
  it('returns 401 when unauthenticated', async () => {
    vi.mocked(requireAdminAuth).mockResolvedValue(unauthed)
    const res = await PUT(makePUT(validSettings))
    expect(res.status).toBe(401)
  })

  it('returns 200 with settings on valid body', async () => {
    const res = await PUT(makePUT(validSettings))
    const body = await res.json()
    expect(res.status).toBe(200)
    expect(body.settings).toBeDefined()
    expect(body.settings.shop_name).toBe('Crochet Ya')
  })

  it('returns 400 for invalid JSON', async () => {
    const req = new NextRequest('http://localhost/api/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: 'not-json',
    })
    const res = await PUT(req)
    const body = await res.json()
    expect(res.status).toBe(400)
    expect(body.error).toBe('Invalid JSON')
  })

  it('returns 400 when required field is missing', async () => {
    const { shop_name: _, ...noName } = validSettings
    const res = await PUT(makePUT(noName))
    const body = await res.json()
    expect(res.status).toBe(400)
    expect(body.error).toBe('Validation failed')
  })

  it('returns 500 on DB error', async () => {
    vi.mocked(createAdminClient).mockReturnValue(
      buildMockClient(null, { message: 'db error' }) as never
    )
    const res = await PUT(makePUT(validSettings))
    expect(res.status).toBe(500)
  })
})

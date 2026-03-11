import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'

vi.mock('@/lib/supabase/auth-check', () => ({ requireAdminAuth: vi.fn() }))
vi.mock('@/lib/supabase/admin', () => ({ createAdminClient: vi.fn() }))
vi.mock('next/cache', () => ({ updateTag: vi.fn(), cacheLife: vi.fn(), cacheTag: vi.fn() }))

import { requireAdminAuth } from '@/lib/supabase/auth-check'
import { createAdminClient } from '@/lib/supabase/admin'
import { POST } from '@/app/api/admin/upload/route'

const authed = { user: { id: 'u1', email: 'admin@test.com' } as never, response: null }
const unauthed = { user: null, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }

const PUBLIC_URL = 'https://example.supabase.co/storage/v1/object/public/product-images/products/test.png'

function buildMockClient(uploadError: unknown = null) {
  return {
    from: vi.fn(),
    storage: {
      from: vi.fn().mockReturnValue({
        upload: vi.fn().mockResolvedValue({ error: uploadError }),
        getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: PUBLIC_URL } }),
      }),
    },
  }
}

function makeFile(options: { size?: number; type?: string; name?: string } = {}) {
  const { size = 1024, type = 'image/png', name = 'test.png' } = options
  const content = new Uint8Array(size).fill(0)
  return new File([content], name, { type })
}

// Create a NextRequest with mocked formData() to avoid jsdom hanging on FormData body
function makeRequest(file: File | null, throwOnFormData = false) {
  const req = new NextRequest('http://localhost/api/admin/upload', { method: 'POST' })
  if (throwOnFormData) {
    vi.spyOn(req, 'formData').mockRejectedValue(new Error('Invalid form data'))
  } else {
    const fd = new FormData()
    if (file) fd.append('file', file)
    vi.spyOn(req, 'formData').mockResolvedValue(fd)
  }
  return req
}

beforeEach(() => {
  vi.mocked(requireAdminAuth).mockResolvedValue(authed)
  vi.mocked(createAdminClient).mockReturnValue(buildMockClient() as never)
})

describe('POST /api/admin/upload', () => {
  it('returns 401 when unauthenticated', async () => {
    vi.mocked(requireAdminAuth).mockResolvedValue(unauthed)
    const res = await POST(makeRequest(makeFile()))
    expect(res.status).toBe(401)
  })

  it('returns 200 with public URL on success', async () => {
    const res = await POST(makeRequest(makeFile()))
    const body = await res.json()
    expect(res.status).toBe(200)
    expect(body.url).toBe(PUBLIC_URL)
  })

  it('returns 400 when no file in FormData', async () => {
    const res = await POST(makeRequest(null))
    const body = await res.json()
    expect(res.status).toBe(400)
    expect(body.error).toBe('No file provided')
  })

  it('returns 400 when file exceeds 5MB', async () => {
    const bigFile = makeFile({ size: 6 * 1024 * 1024 }) // 6MB
    const res = await POST(makeRequest(bigFile))
    const body = await res.json()
    expect(res.status).toBe(400)
    expect(body.error).toContain('File too large')
  })

  it('returns 400 for non-image file type', async () => {
    const pdfFile = makeFile({ type: 'application/pdf', name: 'doc.pdf' })
    const res = await POST(makeRequest(pdfFile))
    const body = await res.json()
    expect(res.status).toBe(400)
    expect(body.error).toContain('Only image files are allowed')
  })

  it('returns 500 when storage upload fails', async () => {
    vi.mocked(createAdminClient).mockReturnValue(
      buildMockClient({ message: 'storage error' }) as never
    )
    const res = await POST(makeRequest(makeFile()))
    expect(res.status).toBe(500)
  })

  it('returns 400 for invalid form data', async () => {
    const res = await POST(makeRequest(null, true))
    const body = await res.json()
    expect(res.status).toBe(400)
    expect(body.error).toBe('Invalid form data')
  })
})

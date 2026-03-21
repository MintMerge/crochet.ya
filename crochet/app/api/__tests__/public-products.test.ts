import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/data', () => ({ getAllProducts: vi.fn() }))
vi.mock('next/cache', () => ({ revalidateTag: vi.fn(), cacheLife: vi.fn(), cacheTag: vi.fn() }))

import { getAllProducts } from '@/lib/data'
import { GET } from '@/app/api/products/route'

const mockProduct = {
  id: 'prod-1',
  name: 'Bear',
  slug: 'bear',
  description: 'A cute bear',
  shortDescription: 'Cute bear',
  price: 500,
  compareAtPrice: undefined,
  currency: 'INR',
  category: 'amigurumi',
  tags: ['cute'],
  images: [{ src: 'img.jpg', alt: 'Bear', isPrimary: true }],
  variants: [],
  featured: false,
  isNew: true,
  inStock: true,
  createdAt: '2024-01-01T00:00:00Z',
}

beforeEach(() => {
  vi.mocked(getAllProducts).mockResolvedValue([mockProduct] as never)
})

describe('GET /api/products', () => {
  it('returns 200 with products array', async () => {
    vi.mocked(getAllProducts).mockResolvedValue(
      [mockProduct, mockProduct, mockProduct] as never
    )
    const res = await GET()
    const body = await res.json()
    expect(res.status).toBe(200)
    expect(Array.isArray(body.products)).toBe(true)
    expect(body.products).toHaveLength(3)
  })

  it('returns 200 with empty array when no products', async () => {
    vi.mocked(getAllProducts).mockResolvedValue([] as never)
    const res = await GET()
    const body = await res.json()
    expect(res.status).toBe(200)
    expect(body.products).toHaveLength(0)
  })

  it('returns products with camelCase field names', async () => {
    const res = await GET()
    const body = await res.json()
    const product = body.products[0]
    // camelCase fields should be present
    expect(product.shortDescription).toBeDefined()
    expect(product.isNew).toBeDefined()
    expect(product.inStock).toBeDefined()
    expect(product.createdAt).toBeDefined()
    // snake_case should NOT be present
    expect(product.short_description).toBeUndefined()
    expect(product.is_new).toBeUndefined()
    expect(product.in_stock).toBeUndefined()
  })
})

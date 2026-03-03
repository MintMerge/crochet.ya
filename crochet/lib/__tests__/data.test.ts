import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  getAllProducts,
  getProductBySlug,
  getProductsByCategory,
  getFeaturedProducts,
  getNewArrivals,
  getRelatedProducts,
  getCategoriesWithCount,
  searchProducts,
  getAllCategories,
  getCategoryBySlug,
} from '../data'

// ─── Mock Supabase server client ────────────────────────────────────────────

const mockProducts = [
  {
    id: 'ami-001',
    name: 'Benny the Bear',
    slug: 'benny-the-bear',
    description: 'A cuddly crochet bear',
    short_description: 'Cuddly bear',
    price: 899,
    compare_at_price: 1099,
    currency: 'INR',
    category: 'amigurumi',
    tags: ['bestseller', 'gift'],
    images: [{ src: 'https://example.com/benny.jpg', alt: 'Benny', isPrimary: true }],
    variants: [{ id: 'v1', name: 'Honey', color: 'Honey', colorHex: '#D4A574', inStock: true }],
    featured: true,
    is_new: false,
    in_stock: true,
    created_at: '2026-01-15T00:00:00Z',
  },
  {
    id: 'ami-002',
    name: 'Luna the Bunny',
    slug: 'luna-the-bunny',
    description: 'A sweet crochet bunny',
    short_description: 'Sweet bunny',
    price: 749,
    compare_at_price: null,
    currency: 'INR',
    category: 'amigurumi',
    tags: ['new', 'gift'],
    images: [{ src: 'https://example.com/luna.jpg', alt: 'Luna', isPrimary: true }],
    variants: [],
    featured: true,
    is_new: true,
    in_stock: true,
    created_at: '2026-02-01T00:00:00Z',
  },
  {
    id: 'acc-001',
    name: 'Peach Scrunchie Set',
    slug: 'peach-scrunchie-set',
    description: 'Soft crochet scrunchies',
    short_description: 'Set of 3 scrunchies',
    price: 299,
    compare_at_price: null,
    currency: 'INR',
    category: 'accessories',
    tags: ['bestseller'],
    images: [{ src: 'https://example.com/scrunchie.jpg', alt: 'Scrunchie', isPrimary: true }],
    variants: [],
    featured: false,
    is_new: false,
    in_stock: true,
    created_at: '2026-01-10T00:00:00Z',
  },
]

const mockCategories = [
  { slug: 'amigurumi', name: 'Amigurumi', description: 'Stuffed friends', image: 'https://example.com/ami.jpg', emoji: '🧸', sort_order: 1 },
  { slug: 'accessories', name: 'Accessories', description: 'Accessories', image: 'https://example.com/acc.jpg', emoji: '🎀', sort_order: 2 },
  { slug: 'home-decor', name: 'Home Decor', description: 'Home items', image: 'https://example.com/home.jpg', emoji: '🏡', sort_order: 3 },
  { slug: 'clothing', name: 'Tops & Wearables', description: 'Clothing', image: 'https://example.com/clothing.jpg', emoji: '👚', sort_order: 4 },
  { slug: 'keychains', name: 'Keychains', description: 'Keychains', image: 'https://example.com/kc.jpg', emoji: '🔑', sort_order: 5 },
  { slug: 'custom', name: 'Custom Orders', description: 'Custom', image: 'https://example.com/custom.jpg', emoji: '✨', sort_order: 6 },
]

// Build a chainable Supabase query builder mock
function makeQueryBuilder(rows: Record<string, unknown>[]) {
  let filtered = [...rows]

  const builder = {
    select: () => builder,
    order: (_col: string, _opts?: object) => builder,
    eq: (col: string, val: unknown) => {
      filtered = filtered.filter((r) => r[col] === val)
      return builder
    },
    neq: (col: string, val: unknown) => {
      filtered = filtered.filter((r) => r[col] !== val)
      return builder
    },
    limit: (n: number) => {
      filtered = filtered.slice(0, n)
      return builder
    },
    or: (query: string) => {
      // parse "name.ilike.%bear%,description.ilike.%bear%" style
      const parts = query.split(',')
      filtered = filtered.filter((r) =>
        parts.some((part) => {
          const m = part.match(/^(\w+)\.ilike\.%(.+)%$/)
          if (!m) return false
          const [, col, term] = m
          return String(r[col] ?? '').toLowerCase().includes(term.toLowerCase())
        })
      )
      return builder
    },
    single: () => {
      const data = filtered[0] ?? null
      const error = data ? null : { message: 'Not found', code: 'PGRST116' }
      return Promise.resolve({ data, error })
    },
    then: (resolve: (v: { data: Record<string, unknown>[]; error: null }) => unknown) =>
      resolve({ data: filtered, error: null }),
  }
  return builder
}

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    from: (table: string) => ({
      select: () => {
        if (table === 'products') return makeQueryBuilder(mockProducts)
        if (table === 'categories') return makeQueryBuilder(mockCategories)
        return makeQueryBuilder([])
      },
    }),
  }),
}))

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('getAllProducts', () => {
  it('returns all products', async () => {
    const products = await getAllProducts()
    expect(products).toHaveLength(3)
  })

  it('maps DB rows to Product type correctly', async () => {
    const products = await getAllProducts()
    const p = products[0]
    expect(p.shortDescription).toBe('Cuddly bear')
    expect(p.compareAtPrice).toBe(1099)
    expect(p.isNew).toBe(false)
    expect(p.inStock).toBe(true)
    expect(p.createdAt).toBe('2026-01-15T00:00:00Z')
  })

  it('returns empty array when no products exist', async () => {
    const { createClient } = await import('@/lib/supabase/server')
    vi.mocked(createClient).mockResolvedValueOnce({
      from: () => ({ select: () => makeQueryBuilder([]) }),
    } as unknown as ReturnType<typeof createClient> extends Promise<infer T> ? T : never)
    const products = await getAllProducts()
    expect(products).toHaveLength(0)
  })
})

describe('getProductBySlug', () => {
  it('returns product for valid slug', async () => {
    const product = await getProductBySlug('benny-the-bear')
    expect(product).toBeDefined()
    expect(product?.name).toBe('Benny the Bear')
  })

  it('returns undefined for invalid slug', async () => {
    const product = await getProductBySlug('nonexistent-slug')
    expect(product).toBeUndefined()
  })
})

describe('getProductsByCategory', () => {
  it('returns only products in the given category', async () => {
    const products = await getProductsByCategory('amigurumi')
    expect(products).toHaveLength(2)
    products.forEach((p) => expect(p.category).toBe('amigurumi'))
  })

  it('returns empty array for category with no products', async () => {
    const products = await getProductsByCategory('keychains')
    expect(products).toHaveLength(0)
  })
})

describe('getFeaturedProducts', () => {
  it('returns only featured products', async () => {
    const products = await getFeaturedProducts()
    expect(products).toHaveLength(2)
    products.forEach((p) => expect(p.featured).toBe(true))
  })
})

describe('getNewArrivals', () => {
  it('returns only new products', async () => {
    const products = await getNewArrivals()
    expect(products).toHaveLength(1)
    products.forEach((p) => expect(p.isNew).toBe(true))
  })

  it('respects limit parameter', async () => {
    const products = await getNewArrivals(1)
    expect(products.length).toBeLessThanOrEqual(1)
  })
})

describe('getRelatedProducts', () => {
  it('returns products in the same category, excluding current', async () => {
    const product = (await getProductBySlug('benny-the-bear'))!
    const related = await getRelatedProducts(product)
    expect(related.length).toBeGreaterThan(0)
    related.forEach((p) => {
      expect(p.category).toBe('amigurumi')
      expect(p.id).not.toBe('ami-001')
    })
  })

  it('respects limit parameter', async () => {
    const product = (await getProductBySlug('benny-the-bear'))!
    const related = await getRelatedProducts(product, 1)
    expect(related.length).toBeLessThanOrEqual(1)
  })
})

describe('getAllCategories', () => {
  it('returns all 6 categories', async () => {
    const categories = await getAllCategories()
    expect(categories).toHaveLength(6)
  })

  it('returns categories with correct shape', async () => {
    const categories = await getAllCategories()
    const ami = categories.find((c) => c.slug === 'amigurumi')
    expect(ami?.name).toBe('Amigurumi')
    expect(ami?.emoji).toBe('🧸')
  })
})

describe('getCategoryBySlug', () => {
  it('returns category for valid slug', async () => {
    const category = await getCategoryBySlug('amigurumi')
    expect(category).toBeDefined()
    expect(category?.name).toBe('Amigurumi')
  })

  it('returns undefined for invalid slug', async () => {
    const category = await getCategoryBySlug('nonexistent' as never)
    expect(category).toBeUndefined()
  })
})

describe('getCategoriesWithCount', () => {
  it('returns categories with correct product counts', async () => {
    const categories = await getCategoriesWithCount()
    expect(categories.length).toBeGreaterThan(0)
    const ami = categories.find((c) => c.slug === 'amigurumi')
    expect(ami?.productCount).toBe(2)
    const acc = categories.find((c) => c.slug === 'accessories')
    expect(acc?.productCount).toBe(1)
    const kc = categories.find((c) => c.slug === 'keychains')
    expect(kc?.productCount).toBe(0)
  })
})

describe('searchProducts', () => {
  it('finds products by name', async () => {
    const results = await searchProducts('bear')
    expect(results.length).toBeGreaterThan(0)
    expect(results.some((p) => p.name.toLowerCase().includes('bear'))).toBe(true)
  })

  it('returns empty array for no match', async () => {
    const results = await searchProducts('xyznonexistent999')
    expect(results).toHaveLength(0)
  })

  it('is case insensitive', async () => {
    const resultsLower = await searchProducts('bear')
    const resultsUpper = await searchProducts('BEAR')
    expect(resultsLower.length).toBe(resultsUpper.length)
  })
})

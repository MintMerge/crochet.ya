import { describe, it, expect } from 'vitest'
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

describe('getAllProducts', () => {
  it('returns all products', async () => {
    const products = await getAllProducts()
    expect(products.length).toBeGreaterThan(0)
  })
})

describe('getProductBySlug', () => {
  it('returns product for valid slug', async () => {
    const product = await getProductBySlug('benny-the-bear')
    expect(product).toBeDefined()
    expect(product?.name).toBe('Benny the Bear')
  })

  it('returns undefined for invalid slug', async () => {
    expect(await getProductBySlug('nonexistent')).toBeUndefined()
  })
})

describe('getProductsByCategory', () => {
  it('returns only products in the given category', async () => {
    const products = await getProductsByCategory('amigurumi')
    expect(products.length).toBeGreaterThan(0)
    products.forEach((p) => {
      expect(p.category).toBe('amigurumi')
    })
  })

  it('returns all products with categories', async () => {
    const allProducts = await getAllProducts()
    const categories = [...new Set(allProducts.map((p) => p.category))]
    expect(categories.length).toBeGreaterThan(0)
  })
})

describe('getFeaturedProducts', () => {
  it('returns only featured products', async () => {
    const products = await getFeaturedProducts()
    expect(products.length).toBeGreaterThan(0)
    products.forEach((p) => {
      expect(p.featured).toBe(true)
    })
  })
})

describe('getNewArrivals', () => {
  it('returns only new products', async () => {
    const products = await getNewArrivals()
    products.forEach((p) => {
      expect(p.isNew).toBe(true)
    })
  })

  it('respects limit parameter', async () => {
    const products = await getNewArrivals(2)
    expect(products.length).toBeLessThanOrEqual(2)
  })

  it('returns products sorted by date descending', async () => {
    const products = await getNewArrivals()
    for (let i = 1; i < products.length; i++) {
      const prev = new Date(products[i - 1].createdAt).getTime()
      const curr = new Date(products[i].createdAt).getTime()
      expect(prev).toBeGreaterThanOrEqual(curr)
    }
  })
})

describe('getRelatedProducts', () => {
  it('returns products in the same category', async () => {
    const product = (await getProductBySlug('benny-the-bear'))!
    const related = await getRelatedProducts(product)
    related.forEach((p) => {
      expect(p.category).toBe(product.category)
    })
  })

  it('excludes the current product', async () => {
    const product = (await getProductBySlug('benny-the-bear'))!
    const related = await getRelatedProducts(product)
    related.forEach((p) => {
      expect(p.id).not.toBe(product.id)
    })
  })

  it('respects limit parameter', async () => {
    const product = (await getProductBySlug('benny-the-bear'))!
    const related = await getRelatedProducts(product, 1)
    expect(related.length).toBeLessThanOrEqual(1)
  })
})

describe('getCategoriesWithCount', () => {
  it('returns categories with product counts', async () => {
    const categories = await getCategoriesWithCount()
    expect(categories.length).toBeGreaterThan(0)
    categories.forEach((c) => {
      expect(c.productCount).toBeDefined()
      expect(typeof c.productCount).toBe('number')
    })
  })
})

describe('searchProducts', () => {
  it('finds products by name', async () => {
    const results = await searchProducts('bear')
    expect(results.length).toBeGreaterThan(0)
    expect(results.some((p) => p.name.toLowerCase().includes('bear'))).toBe(true)
  })

  it('finds products by tag', async () => {
    const results = await searchProducts('bestseller')
    expect(results.length).toBeGreaterThan(0)
  })

  it('returns empty for no match', async () => {
    const results = await searchProducts('xyznonexistent123')
    expect(results).toHaveLength(0)
  })

  it('is case insensitive', async () => {
    const results = await searchProducts('BEAR')
    expect(results.length).toBeGreaterThan(0)
  })
})

describe('getAllCategories', () => {
  it('returns all categories', async () => {
    const categories = await getAllCategories()
    expect(categories.length).toBe(6)
  })
})

describe('getCategoryBySlug', () => {
  it('returns category for valid slug', async () => {
    const category = await getCategoryBySlug('amigurumi')
    expect(category).toBeDefined()
    expect(category?.name).toBe('Amigurumi')
  })
})

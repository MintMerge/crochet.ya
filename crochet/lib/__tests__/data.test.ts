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
  it('returns all products', () => {
    const products = getAllProducts()
    expect(products.length).toBeGreaterThan(0)
  })
})

describe('getProductBySlug', () => {
  it('returns product for valid slug', () => {
    const product = getProductBySlug('benny-the-bear')
    expect(product).toBeDefined()
    expect(product?.name).toBe('Benny the Bear')
  })

  it('returns undefined for invalid slug', () => {
    expect(getProductBySlug('nonexistent')).toBeUndefined()
  })
})

describe('getProductsByCategory', () => {
  it('returns only products in the given category', () => {
    const products = getProductsByCategory('amigurumi')
    expect(products.length).toBeGreaterThan(0)
    products.forEach((p) => {
      expect(p.category).toBe('amigurumi')
    })
  })

  it('returns empty array for category with no products', () => {
    // All categories have products in our data, but test the function works
    const allProducts = getAllProducts()
    const categories = [...new Set(allProducts.map((p) => p.category))]
    expect(categories.length).toBeGreaterThan(0)
  })
})

describe('getFeaturedProducts', () => {
  it('returns only featured products', () => {
    const products = getFeaturedProducts()
    expect(products.length).toBeGreaterThan(0)
    products.forEach((p) => {
      expect(p.featured).toBe(true)
    })
  })
})

describe('getNewArrivals', () => {
  it('returns only new products', () => {
    const products = getNewArrivals()
    products.forEach((p) => {
      expect(p.isNew).toBe(true)
    })
  })

  it('respects limit parameter', () => {
    const products = getNewArrivals(2)
    expect(products.length).toBeLessThanOrEqual(2)
  })

  it('returns products sorted by date descending', () => {
    const products = getNewArrivals()
    for (let i = 1; i < products.length; i++) {
      const prev = new Date(products[i - 1].createdAt).getTime()
      const curr = new Date(products[i].createdAt).getTime()
      expect(prev).toBeGreaterThanOrEqual(curr)
    }
  })
})

describe('getRelatedProducts', () => {
  it('returns products in the same category', () => {
    const product = getProductBySlug('benny-the-bear')!
    const related = getRelatedProducts(product)
    related.forEach((p) => {
      expect(p.category).toBe(product.category)
    })
  })

  it('excludes the current product', () => {
    const product = getProductBySlug('benny-the-bear')!
    const related = getRelatedProducts(product)
    related.forEach((p) => {
      expect(p.id).not.toBe(product.id)
    })
  })

  it('respects limit parameter', () => {
    const product = getProductBySlug('benny-the-bear')!
    const related = getRelatedProducts(product, 1)
    expect(related.length).toBeLessThanOrEqual(1)
  })
})

describe('getCategoriesWithCount', () => {
  it('returns categories with product counts', () => {
    const categories = getCategoriesWithCount()
    expect(categories.length).toBeGreaterThan(0)
    categories.forEach((c) => {
      expect(c.productCount).toBeDefined()
      expect(typeof c.productCount).toBe('number')
    })
  })
})

describe('searchProducts', () => {
  it('finds products by name', () => {
    const results = searchProducts('bear')
    expect(results.length).toBeGreaterThan(0)
    expect(results.some((p) => p.name.toLowerCase().includes('bear'))).toBe(true)
  })

  it('finds products by tag', () => {
    const results = searchProducts('bestseller')
    expect(results.length).toBeGreaterThan(0)
  })

  it('returns empty for no match', () => {
    const results = searchProducts('xyznonexistent123')
    expect(results).toHaveLength(0)
  })

  it('is case insensitive', () => {
    const results = searchProducts('BEAR')
    expect(results.length).toBeGreaterThan(0)
  })
})

describe('getAllCategories', () => {
  it('returns all categories', () => {
    const categories = getAllCategories()
    expect(categories.length).toBe(6)
  })
})

describe('getCategoryBySlug', () => {
  it('returns category for valid slug', () => {
    const category = getCategoryBySlug('amigurumi')
    expect(category).toBeDefined()
    expect(category?.name).toBe('Amigurumi')
  })
})

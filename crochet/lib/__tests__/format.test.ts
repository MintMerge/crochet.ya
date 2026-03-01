import { describe, it, expect } from 'vitest'
import { formatPrice, truncate, generateOrderId, formatOrderForTelegram } from '../format'
import type { Order } from '@/types'

describe('formatPrice', () => {
  it('formats INR prices correctly', () => {
    expect(formatPrice(499, 'INR')).toBe('Rs. 499')
  })

  it('formats larger INR prices with locale', () => {
    expect(formatPrice(1299, 'INR')).toContain('1,299')
  })

  it('defaults to INR', () => {
    expect(formatPrice(299)).toBe('Rs. 299')
  })

  it('formats USD prices', () => {
    expect(formatPrice(12.99, 'USD')).toBe('$12.99')
  })
})

describe('truncate', () => {
  it('truncates long strings', () => {
    expect(truncate('Hello World this is a long string', 11)).toBe('Hello World...')
  })

  it('does not truncate short strings', () => {
    expect(truncate('Hello', 10)).toBe('Hello')
  })

  it('handles exact length', () => {
    expect(truncate('Hello', 5)).toBe('Hello')
  })
})

describe('generateOrderId', () => {
  it('generates unique IDs', () => {
    const id1 = generateOrderId()
    const id2 = generateOrderId()
    expect(id1).not.toBe(id2)
  })

  it('starts with CY-', () => {
    expect(generateOrderId()).toMatch(/^CY-/)
  })
})

describe('formatOrderForTelegram', () => {
  const mockOrder: Order = {
    items: [
      {
        productId: 'p1',
        variantId: null,
        quantity: 2,
        price: 499,
        name: 'Test Product',
        image: '/test.jpg',
        variantName: null,
      },
      {
        productId: 'p2',
        variantId: 'v1',
        quantity: 1,
        price: 299,
        name: 'Another Product',
        image: '/test2.jpg',
        variantName: 'Pink',
      },
    ],
    customer: {
      customerName: 'Test User',
      phone: '9876543210',
      email: 'test@example.com',
      address: '123 Test Street',
      city: 'Mumbai',
      pincode: '400001',
      notes: 'Please wrap nicely',
    },
    totalAmount: 1297,
    orderDate: '2026-02-28T10:00:00Z',
  }

  it('includes customer name', () => {
    const msg = formatOrderForTelegram(mockOrder, 'CY-TEST')
    expect(msg).toContain('Test User')
  })

  it('includes phone number', () => {
    const msg = formatOrderForTelegram(mockOrder, 'CY-TEST')
    expect(msg).toContain('9876543210')
  })

  it('includes order items', () => {
    const msg = formatOrderForTelegram(mockOrder, 'CY-TEST')
    expect(msg).toContain('Test Product')
    expect(msg).toContain('Another Product')
  })

  it('includes variant name in parentheses', () => {
    const msg = formatOrderForTelegram(mockOrder, 'CY-TEST')
    expect(msg).toContain('(Pink)')
  })

  it('includes total amount', () => {
    const msg = formatOrderForTelegram(mockOrder, 'CY-TEST')
    expect(msg).toContain('1,297')
  })

  it('includes notes', () => {
    const msg = formatOrderForTelegram(mockOrder, 'CY-TEST')
    expect(msg).toContain('Please wrap nicely')
  })

  it('includes email when provided', () => {
    const msg = formatOrderForTelegram(mockOrder, 'CY-TEST')
    expect(msg).toContain('test@example.com')
  })

  it('includes order ID', () => {
    const msg = formatOrderForTelegram(mockOrder, 'CY-TEST')
    expect(msg).toContain('CY-TEST')
  })

  it('includes address with city and pincode', () => {
    const msg = formatOrderForTelegram(mockOrder, 'CY-TEST')
    expect(msg).toContain('123 Test Street')
    expect(msg).toContain('Mumbai')
    expect(msg).toContain('400001')
  })
})

import { describe, it, expect, beforeEach } from 'vitest'
import { useCartStore } from '../cart-store'

describe('Cart Store', () => {
  beforeEach(() => {
    useCartStore.setState({ items: [] })
  })

  const mockItem = {
    productId: 'test-1',
    variantId: null,
    price: 499,
    name: 'Test Product',
    image: '/test.jpg',
    variantName: null,
  }

  const mockItemWithVariant = {
    productId: 'test-1',
    variantId: 'var-1',
    price: 599,
    name: 'Test Product',
    image: '/test.jpg',
    variantName: 'Blue',
  }

  it('adds a new item to cart', () => {
    useCartStore.getState().addItem(mockItem)
    expect(useCartStore.getState().items).toHaveLength(1)
    expect(useCartStore.getState().items[0].quantity).toBe(1)
  })

  it('increments quantity for existing item', () => {
    useCartStore.getState().addItem(mockItem)
    useCartStore.getState().addItem(mockItem)
    expect(useCartStore.getState().items).toHaveLength(1)
    expect(useCartStore.getState().items[0].quantity).toBe(2)
  })

  it('treats different variants as separate items', () => {
    useCartStore.getState().addItem(mockItem)
    useCartStore.getState().addItem(mockItemWithVariant)
    expect(useCartStore.getState().items).toHaveLength(2)
  })

  it('adds item with custom quantity', () => {
    useCartStore.getState().addItem({ ...mockItem, quantity: 3 })
    expect(useCartStore.getState().items[0].quantity).toBe(3)
  })

  it('removes item from cart', () => {
    useCartStore.getState().addItem(mockItem)
    useCartStore.getState().removeItem('test-1', null)
    expect(useCartStore.getState().items).toHaveLength(0)
  })

  it('updates item quantity', () => {
    useCartStore.getState().addItem(mockItem)
    useCartStore.getState().updateQuantity('test-1', null, 5)
    expect(useCartStore.getState().items[0].quantity).toBe(5)
  })

  it('removes item when quantity set to 0', () => {
    useCartStore.getState().addItem(mockItem)
    useCartStore.getState().updateQuantity('test-1', null, 0)
    expect(useCartStore.getState().items).toHaveLength(0)
  })

  it('clears all items', () => {
    useCartStore.getState().addItem(mockItem)
    useCartStore.getState().addItem(mockItemWithVariant)
    useCartStore.getState().clearCart()
    expect(useCartStore.getState().items).toHaveLength(0)
  })

  it('calculates total item count', () => {
    useCartStore.getState().addItem({ ...mockItem, quantity: 2 })
    useCartStore.getState().addItem({ ...mockItemWithVariant, quantity: 3 })
    expect(useCartStore.getState().getItemCount()).toBe(5)
  })

  it('calculates total price', () => {
    useCartStore.getState().addItem({ ...mockItem, quantity: 2 })
    useCartStore.getState().addItem({ ...mockItemWithVariant, quantity: 1 })
    expect(useCartStore.getState().getTotalPrice()).toBe(499 * 2 + 599)
  })

  it('returns 0 for empty cart item count', () => {
    expect(useCartStore.getState().getItemCount()).toBe(0)
  })

  it('returns 0 for empty cart total price', () => {
    expect(useCartStore.getState().getTotalPrice()).toBe(0)
  })
})

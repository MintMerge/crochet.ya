import { describe, it, expect, beforeEach } from 'vitest'
import { useWishlistStore } from '../wishlist-store'

describe('Wishlist Store', () => {
  beforeEach(() => {
    useWishlistStore.setState({ items: [] })
  })

  it('adds a product to wishlist', () => {
    useWishlistStore.getState().addItem('prod-1')
    expect(useWishlistStore.getState().items).toContain('prod-1')
  })

  it('does not duplicate items', () => {
    useWishlistStore.getState().addItem('prod-1')
    useWishlistStore.getState().addItem('prod-1')
    expect(useWishlistStore.getState().items).toHaveLength(1)
  })

  it('removes a product from wishlist', () => {
    useWishlistStore.getState().addItem('prod-1')
    useWishlistStore.getState().removeItem('prod-1')
    expect(useWishlistStore.getState().items).toHaveLength(0)
  })

  it('toggles item - adds if not present', () => {
    useWishlistStore.getState().toggleItem('prod-1')
    expect(useWishlistStore.getState().items).toContain('prod-1')
  })

  it('toggles item - removes if present', () => {
    useWishlistStore.getState().addItem('prod-1')
    useWishlistStore.getState().toggleItem('prod-1')
    expect(useWishlistStore.getState().items).not.toContain('prod-1')
  })

  it('checks if product is wishlisted', () => {
    useWishlistStore.getState().addItem('prod-1')
    expect(useWishlistStore.getState().isWishlisted('prod-1')).toBe(true)
    expect(useWishlistStore.getState().isWishlisted('prod-2')).toBe(false)
  })

  it('returns correct count', () => {
    useWishlistStore.getState().addItem('prod-1')
    useWishlistStore.getState().addItem('prod-2')
    useWishlistStore.getState().addItem('prod-3')
    expect(useWishlistStore.getState().getCount()).toBe(3)
  })

  it('returns 0 count for empty wishlist', () => {
    expect(useWishlistStore.getState().getCount()).toBe(0)
  })
})

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Navbar } from '../navbar'
import { useCartStore } from '@/lib/stores/cart-store'
import { useWishlistStore } from '@/lib/stores/wishlist-store'

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: Record<string, unknown>) => (
      <div {...props}>{children as React.ReactNode}</div>
    ),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

// Mock useMounted to return true so badges are always visible in tests
vi.mock('@/hooks/use-mounted', () => ({
  useMounted: () => true,
}))

describe('Navbar', () => {
  beforeEach(() => {
    useCartStore.setState({ items: [] })
    useWishlistStore.setState({ items: [] })
  })

  it('renders brand name', () => {
    render(<Navbar />)
    expect(screen.getByText('Crochet Ya')).toBeInTheDocument()
  })

  it('renders navigation links', () => {
    render(<Navbar />)
    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('Products')).toBeInTheDocument()
    expect(screen.getByText('Wishlist')).toBeInTheDocument()
  })

  it('renders cart link', () => {
    render(<Navbar />)
    expect(screen.getByLabelText('Cart')).toBeInTheDocument()
  })

  it('renders wishlist link', () => {
    render(<Navbar />)
    expect(screen.getByLabelText('Wishlist')).toBeInTheDocument()
  })

  it('renders mobile menu button', () => {
    render(<Navbar />)
    expect(screen.getByLabelText('Open menu')).toBeInTheDocument()
  })

  it('does not show badge when cart is empty', () => {
    useCartStore.setState({ items: [] })
    render(<Navbar />)
    expect(screen.queryByText('0')).not.toBeInTheDocument()
  })

  it('shows cart badge count when items exist', () => {
    useCartStore.setState({
      items: [{ productId: 'p1', variantId: null, quantity: 2, price: 499, name: 'Bear', image: '/img.jpg', variantName: null }],
    })
    render(<Navbar />)
    expect(screen.getByText('2')).toBeInTheDocument()
  })

  it('shows wishlist badge count when items exist', () => {
    useWishlistStore.setState({ items: ['prod-1', 'prod-2'] })
    render(<Navbar />)
    expect(screen.getByText('2')).toBeInTheDocument()
  })

  it('does not show badge when wishlist is empty', () => {
    useWishlistStore.setState({ items: [] })
    render(<Navbar />)
    const badgeNumbers = screen.queryAllByText(/^\d+$/)
    expect(badgeNumbers).toHaveLength(0)
  })

  it('shows correct total count with multiple cart items', () => {
    useCartStore.setState({
      items: [
        { productId: 'p1', variantId: null, quantity: 3, price: 499, name: 'Bear', image: '/img.jpg', variantName: null },
        { productId: 'p2', variantId: null, quantity: 2, price: 299, name: 'Bunny', image: '/img2.jpg', variantName: null },
      ],
    })
    render(<Navbar />)
    expect(screen.getByText('5')).toBeInTheDocument()
  })
})

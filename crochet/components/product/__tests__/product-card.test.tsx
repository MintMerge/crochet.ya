import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ProductCard } from '../product-card'
import { useCartStore } from '@/lib/stores/cart-store'
import { useWishlistStore } from '@/lib/stores/wishlist-store'
import type { Product } from '@/types'

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: Record<string, unknown>) => (
      <div {...props}>{children as React.ReactNode}</div>
    ),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

// Mock sonner
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
  },
}))

const mockProduct: Product = {
  id: 'test-1',
  name: 'Test Crochet Bear',
  slug: 'test-crochet-bear',
  description: 'A beautiful test bear',
  shortDescription: 'Cuddly test bear',
  price: 499,
  compareAtPrice: 699,
  currency: 'INR',
  category: 'amigurumi',
  tags: ['new', 'gift'],
  images: [
    { src: 'https://example.com/test.jpg', alt: 'Test Bear', isPrimary: true },
  ],
  variants: [],
  featured: true,
  isNew: true,
  inStock: true,
  createdAt: '2026-01-01',
}

const outOfStockProduct: Product = {
  ...mockProduct,
  id: 'test-2',
  slug: 'test-out-of-stock',
  inStock: false,
}

describe('ProductCard — rendering', () => {
  it('renders product name', () => {
    render(<ProductCard product={mockProduct} />)
    expect(screen.getByText('Test Crochet Bear')).toBeInTheDocument()
  })

  it('renders product price', () => {
    render(<ProductCard product={mockProduct} />)
    expect(screen.getByText('Rs. 499')).toBeInTheDocument()
  })

  it('shows compare-at price with strikethrough', () => {
    render(<ProductCard product={mockProduct} />)
    expect(screen.getByText('Rs. 699')).toBeInTheDocument()
  })

  it('shows New badge when product is new', () => {
    render(<ProductCard product={mockProduct} />)
    expect(screen.getByText('New')).toBeInTheDocument()
  })

  it('shows Sale badge when compare price exists', () => {
    render(<ProductCard product={mockProduct} />)
    expect(screen.getByText('Sale')).toBeInTheDocument()
  })

  it('renders short description', () => {
    render(<ProductCard product={mockProduct} />)
    expect(screen.getByText('Cuddly test bear')).toBeInTheDocument()
  })

  it('links to product detail page', () => {
    render(<ProductCard product={mockProduct} />)
    const links = screen.getAllByRole('link')
    expect(links.some((l) => l.getAttribute('href') === '/products/test-crochet-bear')).toBe(true)
  })

  it('renders wishlist button', () => {
    render(<ProductCard product={mockProduct} />)
    expect(screen.getByLabelText(/wishlist/i)).toBeInTheDocument()
  })

  it('renders add to cart button', () => {
    render(<ProductCard product={mockProduct} />)
    expect(screen.getByLabelText(/add.*cart/i)).toBeInTheDocument()
  })

  it('add to cart button is disabled when out of stock', () => {
    render(<ProductCard product={outOfStockProduct} />)
    const btn = screen.getByLabelText(/add.*cart/i)
    expect(btn).toBeDisabled()
  })
})

describe('ProductCard — cart interactions', () => {
  beforeEach(() => {
    useCartStore.setState({ items: [] })
  })

  it('adds product to cart when add to cart button is clicked', async () => {
    const user = userEvent.setup()
    render(<ProductCard product={mockProduct} />)
    await user.click(screen.getByLabelText(/add.*cart/i))
    const { items } = useCartStore.getState()
    expect(items).toHaveLength(1)
    expect(items[0].productId).toBe('test-1')
    expect(items[0].quantity).toBe(1)
  })

  it('increments quantity when same product added twice', async () => {
    const user = userEvent.setup()
    render(<ProductCard product={mockProduct} />)
    await user.click(screen.getByLabelText(/add.*cart/i))
    await user.click(screen.getByLabelText(/add.*cart/i))
    const { items } = useCartStore.getState()
    expect(items).toHaveLength(1)
    expect(items[0].quantity).toBe(2)
  })

  it('does not add out of stock product to cart', async () => {
    const user = userEvent.setup()
    render(<ProductCard product={outOfStockProduct} />)
    const btn = screen.getByLabelText(/add.*cart/i)
    expect(btn).toBeDisabled()
    // Button is disabled — click should have no effect
    await user.click(btn).catch(() => {}) // userEvent throws on disabled buttons
    expect(useCartStore.getState().items).toHaveLength(0)
  })

  it('shows toast when item is added to cart', async () => {
    const { toast } = await import('sonner')
    const user = userEvent.setup()
    render(<ProductCard product={mockProduct} />)
    await user.click(screen.getByLabelText(/add.*cart/i))
    expect(toast.success).toHaveBeenCalled()
  })
})

describe('ProductCard — wishlist interactions', () => {
  beforeEach(() => {
    useWishlistStore.setState({ items: [] })
  })

  it('adds product to wishlist when heart button is clicked', async () => {
    const user = userEvent.setup()
    render(<ProductCard product={mockProduct} />)
    await user.click(screen.getByLabelText(/wishlist/i))
    expect(useWishlistStore.getState().isWishlisted('test-1')).toBe(true)
  })

  it('removes product from wishlist when heart clicked again', async () => {
    useWishlistStore.setState({ items: ['test-1'] })
    const user = userEvent.setup()
    render(<ProductCard product={mockProduct} />)
    await user.click(screen.getByLabelText(/wishlist/i))
    expect(useWishlistStore.getState().isWishlisted('test-1')).toBe(false)
  })
})

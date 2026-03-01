import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ProductCard } from '../product-card'
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

describe('ProductCard', () => {
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
})

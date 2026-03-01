import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CartItem } from '../cart-item'
import { useCartStore } from '@/lib/stores'
import type { CartItem as CartItemType } from '@/types'

// Mock next/image
vi.mock('next/image', () => ({
  default: (props: Record<string, unknown>) => <img {...props} />,
}))

const mockItem: CartItemType = {
  productId: 'test-1',
  variantId: null,
  quantity: 2,
  price: 499,
  name: 'Test Bear',
  image: 'https://example.com/bear.jpg',
  variantName: null,
}

const mockItemWithVariant: CartItemType = {
  ...mockItem,
  variantId: 'v1',
  variantName: 'Blush Pink',
}

describe('CartItem', () => {
  beforeEach(() => {
    useCartStore.setState({ items: [mockItem] })
  })

  it('renders item name', () => {
    render(<CartItem item={mockItem} />)
    expect(screen.getByText('Test Bear')).toBeInTheDocument()
  })

  it('renders formatted price', () => {
    render(<CartItem item={mockItem} />)
    expect(screen.getByText('Rs. 998')).toBeInTheDocument()
  })

  it('renders quantity', () => {
    render(<CartItem item={mockItem} />)
    expect(screen.getByText('2')).toBeInTheDocument()
  })

  it('shows variant name when present', () => {
    render(<CartItem item={mockItemWithVariant} />)
    expect(screen.getByText('Blush Pink')).toBeInTheDocument()
  })

  it('has increase and decrease buttons', () => {
    render(<CartItem item={mockItem} />)
    expect(screen.getByLabelText(/increase/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/decrease/i)).toBeInTheDocument()
  })

  it('has remove button', () => {
    render(<CartItem item={mockItem} />)
    expect(screen.getByLabelText(/remove/i)).toBeInTheDocument()
  })

  it('calls updateQuantity on increase', async () => {
    const user = userEvent.setup()
    render(<CartItem item={mockItem} />)
    await user.click(screen.getByLabelText(/increase/i))
    const updated = useCartStore.getState().items.find((i) => i.productId === 'test-1')
    expect(updated?.quantity).toBe(3)
  })
})

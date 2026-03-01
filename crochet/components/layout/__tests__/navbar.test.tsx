import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Navbar } from '../navbar'

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: Record<string, unknown>) => (
      <div {...props}>{children as React.ReactNode}</div>
    ),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

describe('Navbar', () => {
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
})

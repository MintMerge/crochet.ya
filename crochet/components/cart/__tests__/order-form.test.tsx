import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { OrderForm } from '../order-form'

describe('OrderForm', () => {
  const mockOnSubmit = vi.fn()

  beforeEach(() => {
    mockOnSubmit.mockClear()
  })

  it('renders all form fields', () => {
    render(<OrderForm onSubmit={mockOnSubmit} isSubmitting={false} error={null} />)

    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/phone/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/delivery address/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/city/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/pincode/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/special notes/i)).toBeInTheDocument()
  })

  it('shows validation errors for empty required fields', async () => {
    const user = userEvent.setup()
    render(<OrderForm onSubmit={mockOnSubmit} isSubmitting={false} error={null} />)

    await user.click(screen.getByRole('button', { name: /place order/i }))

    await waitFor(() => {
      expect(screen.getByText(/name must be at least/i)).toBeInTheDocument()
    })
  })

  it('shows validation error for invalid phone', async () => {
    const user = userEvent.setup()
    render(<OrderForm onSubmit={mockOnSubmit} isSubmitting={false} error={null} />)

    await user.type(screen.getByLabelText(/phone/i), '12345')
    await user.click(screen.getByRole('button', { name: /place order/i }))

    await waitFor(() => {
      expect(screen.getByText(/valid 10-digit/i)).toBeInTheDocument()
    })
  })

  it('shows validation error for invalid pincode', async () => {
    const user = userEvent.setup()
    render(<OrderForm onSubmit={mockOnSubmit} isSubmitting={false} error={null} />)

    await user.type(screen.getByLabelText(/pincode/i), '123')
    await user.click(screen.getByRole('button', { name: /place order/i }))

    await waitFor(() => {
      expect(screen.getByText(/valid 6-digit/i)).toBeInTheDocument()
    })
  })

  it('shows submit button with loading state', () => {
    render(<OrderForm onSubmit={mockOnSubmit} isSubmitting={true} error={null} />)
    expect(screen.getByText(/placing order/i)).toBeInTheDocument()
  })

  it('displays error message', () => {
    render(
      <OrderForm onSubmit={mockOnSubmit} isSubmitting={false} error="Something went wrong" />
    )
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
  })

  it('calls onSubmit with valid data', async () => {
    const user = userEvent.setup()
    render(<OrderForm onSubmit={mockOnSubmit} isSubmitting={false} error={null} />)

    await user.type(screen.getByLabelText(/full name/i), 'Test User')
    await user.type(screen.getByLabelText(/phone/i), '9876543210')
    await user.type(screen.getByLabelText(/delivery address/i), 'Test Address 123, Street Name')
    await user.type(screen.getByLabelText(/city/i), 'Mumbai')
    await user.type(screen.getByLabelText(/pincode/i), '400001')

    await user.click(screen.getByRole('button', { name: /place order/i }))

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          customerName: 'Test User',
          phone: '9876543210',
          city: 'Mumbai',
          pincode: '400001',
        }),
        expect.anything()
      )
    })
  })
})

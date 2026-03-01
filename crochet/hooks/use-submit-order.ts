'use client'

import { useState } from 'react'
import { useCartStore } from '@/lib/stores'
import { useRouter } from 'next/navigation'
import type { OrderFormValues } from '@/lib/validations/order'

export function useSubmitOrder() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const items = useCartStore((state) => state.items)
  const getTotalPrice = useCartStore((state) => state.getTotalPrice)
  const clearCart = useCartStore((state) => state.clearCart)
  const router = useRouter()

  const submitOrder = async (customer: OrderFormValues) => {
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          customer,
          totalAmount: getTotalPrice(),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Order failed')
      }

      clearCart()
      router.push(`/order-success?orderId=${data.orderId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsSubmitting(false)
    }
  }

  return { submitOrder, isSubmitting, error }
}

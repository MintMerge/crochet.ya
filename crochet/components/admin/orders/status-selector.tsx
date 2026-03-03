'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ORDER_STATUSES, type OrderStatus } from '@/types'

interface StatusSelectorProps {
  orderId: string
  currentStatus: OrderStatus
}

export function StatusSelector({ orderId, currentStatus }: StatusSelectorProps) {
  const [status, setStatus] = useState<OrderStatus>(currentStatus)
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async (newStatus: OrderStatus) => {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Update failed')
      return data
    },
    onSuccess: (_, newStatus) => {
      setStatus(newStatus)
      toast.success('Order status updated')
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] })
    },
    onError: (err: Error) => {
      toast.error(err.message)
    },
  })

  return (
    <Select
      value={status}
      onValueChange={(val) => mutation.mutate(val as OrderStatus)}
      disabled={mutation.isPending}
    >
      <SelectTrigger className="w-44">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {ORDER_STATUSES.map((s) => (
          <SelectItem key={s.value} value={s.value}>
            {s.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

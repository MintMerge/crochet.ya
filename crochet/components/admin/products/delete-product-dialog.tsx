'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/admin/shared/confirm-dialog'

interface DeleteProductDialogProps {
  productId: string
  productName: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onDeleted?: () => void
}

export function DeleteProductDialog({
  productId,
  productName,
  open,
  onOpenChange,
  onDeleted,
}: DeleteProductDialogProps) {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/admin/products/${productId}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Delete failed')
      }
    },
    onSuccess: () => {
      toast.success(`"${productName}" deleted`)
      queryClient.invalidateQueries({ queryKey: ['admin-products'] })
      onOpenChange(false)
      onDeleted?.()
    },
    onError: (err: Error) => {
      toast.error(err.message)
    },
  })

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Delete Product"
      description={`Are you sure you want to delete "${productName}"? This action cannot be undone.`}
      confirmLabel="Delete"
      onConfirm={() => mutation.mutate()}
      loading={mutation.isPending}
    />
  )
}

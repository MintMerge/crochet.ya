'use client'

import { useCartStore } from '@/lib/stores'
import { formatPrice } from '@/lib/format'
import { Separator } from '@/components/ui/separator'
import { useMounted } from '@/hooks/use-mounted'

export function CartSummary() {
  const mounted = useMounted()
  const items = useCartStore((s) => s.items)
  const getItemCount = useCartStore((s) => s.getItemCount)
  const getTotalPrice = useCartStore((s) => s.getTotalPrice)

  if (!mounted) return null

  return (
    <div className="rounded-2xl border-2 border-border bg-card p-6 shadow-hard-sm">
      <h3 className="font-heading text-lg font-bold mb-4">Order Summary</h3>

      <div className="space-y-2 text-sm">
        {items.map((item) => (
          <div key={`${item.productId}-${item.variantId}`} className="flex justify-between">
            <span className="text-muted-foreground truncate mr-2">
              {item.name} x{item.quantity}
            </span>
            <span className="font-medium whitespace-nowrap">
              {formatPrice(item.price * item.quantity)}
            </span>
          </div>
        ))}
      </div>

      <Separator className="my-4" />

      <div className="flex justify-between items-center">
        <span className="text-muted-foreground">
          {getItemCount()} {getItemCount() === 1 ? 'item' : 'items'}
        </span>
        <span className="font-heading text-xl font-bold text-primary">
          {formatPrice(getTotalPrice())}
        </span>
      </div>
    </div>
  )
}

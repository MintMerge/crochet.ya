'use client'

import Image from 'next/image'
import { Minus, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCartStore } from '@/lib/stores'
import { formatPrice } from '@/lib/format'
import type { CartItem as CartItemType } from '@/types'

interface CartItemProps {
  item: CartItemType
}

export function CartItem({ item }: CartItemProps) {
  const updateQuantity = useCartStore((s) => s.updateQuantity)
  const removeItem = useCartStore((s) => s.removeItem)

  return (
    <div className="flex gap-4 rounded-2xl border-2 border-border bg-card p-4 shadow-hard-sm">
      {/* Image */}
      <div className="relative h-20 w-20 sm:h-24 sm:w-24 flex-shrink-0 overflow-hidden rounded-xl border-2 border-border bg-muted">
        {item.image ? (
          <Image
            src={item.image}
            alt={item.name}
            fill
            className="object-cover"
            sizes="96px"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="text-2xl">🧶</span>
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex flex-1 flex-col justify-between min-w-0">
        <div>
          <h3 className="font-heading font-semibold text-sm sm:text-base truncate">
            {item.name}
          </h3>
          {item.variantName && (
            <p className="text-xs sm:text-sm text-muted-foreground">
              {item.variantName}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between mt-2">
          {/* Quantity controls */}
          <div className="flex items-center border-2 border-border rounded-full overflow-hidden">
            <button
              onClick={() =>
                updateQuantity(item.productId, item.variantId, item.quantity - 1)
              }
              className="h-9 w-9 flex items-center justify-center hover:bg-muted transition-colors cursor-pointer"
              aria-label="Decrease quantity"
            >
              <Minus className="h-3 w-3" strokeWidth={2.5} />
            </button>
            <span className="w-8 text-center text-sm font-medium">
              {item.quantity}
            </span>
            <button
              onClick={() =>
                updateQuantity(item.productId, item.variantId, item.quantity + 1)
              }
              className="h-9 w-9 flex items-center justify-center hover:bg-muted transition-colors cursor-pointer"
              aria-label="Increase quantity"
            >
              <Plus className="h-3 w-3" strokeWidth={2.5} />
            </button>
          </div>

          {/* Price + Remove */}
          <div className="flex items-center gap-3">
            <span className="font-heading font-bold text-primary">
              {formatPrice(item.price * item.quantity)}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              onClick={() => removeItem(item.productId, item.variantId)}
              aria-label="Remove item"
            >
              <Trash2 className="h-4 w-4" strokeWidth={2.5} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

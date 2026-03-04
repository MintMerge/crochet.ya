'use client'

import { PageContainer } from '@/components/layout'
import { CartItem, CartSummary, OrderForm, EmptyCart } from '@/components/cart'
import { useCartStore } from '@/lib/stores'
import { useSubmitOrder } from '@/hooks/use-submit-order'
import { useMounted } from '@/hooks/use-mounted'
import { Skeleton } from '@/components/ui/skeleton'
import { ShoppingBag } from 'lucide-react'

export default function CartPage() {
  const mounted = useMounted()
  const items = useCartStore((s) => s.items)
  const { submitOrder, isSubmitting, error } = useSubmitOrder()

  if (!mounted) {
    return (
      <PageContainer className="py-12">
        <h1 className="font-heading text-4xl font-bold mb-8 flex items-center gap-3">
          <ShoppingBag className="h-8 w-8 text-primary" strokeWidth={2.5} />
          Your Cart
        </h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex gap-4 rounded-2xl border-2 border-border bg-card p-4">
                <Skeleton className="h-20 w-20 rounded-xl shrink-0 bg-primary/10" />
                <div className="flex-1 space-y-2.5">
                  <Skeleton className="h-5 w-2/3 bg-primary/10" />
                  <Skeleton className="h-4 w-1/3 bg-primary/8" />
                  <div className="flex items-center justify-between pt-1">
                    <Skeleton className="h-8 w-24 rounded-full bg-primary/10" />
                    <Skeleton className="h-5 w-16 bg-primary/10" />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="space-y-4">
            <Skeleton className="h-36 w-full rounded-2xl bg-primary/10" />
            <Skeleton className="h-64 w-full rounded-2xl bg-primary/8" />
          </div>
        </div>
      </PageContainer>
    )
  }

  if (items.length === 0) {
    return (
      <PageContainer className="py-12">
        <h1 className="font-heading text-4xl font-bold mb-8 flex items-center gap-3">
          <ShoppingBag className="h-8 w-8 text-primary" strokeWidth={2.5} />
          Your Cart
        </h1>
        <EmptyCart />
      </PageContainer>
    )
  }

  return (
    <PageContainer className="py-12">
      <h1 className="font-heading text-4xl font-bold mb-8 flex items-center gap-3">
        <ShoppingBag className="h-8 w-8 text-primary" strokeWidth={2.5} />
        Your Cart
        <span className="text-lg text-muted-foreground font-normal">
          ({items.length} {items.length === 1 ? 'item' : 'items'})
        </span>
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <CartItem
              key={`${item.productId}-${item.variantId}`}
              item={item}
            />
          ))}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <CartSummary />
          <OrderForm
            onSubmit={submitOrder}
            isSubmitting={isSubmitting}
            error={error}
          />
        </div>
      </div>
    </PageContainer>
  )
}

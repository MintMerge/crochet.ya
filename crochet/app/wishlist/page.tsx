'use client'

import type { Metadata } from 'next'
import { PageContainer } from '@/components/layout'
import { ProductGrid } from '@/components/product'
import { EmptyWishlist } from '@/components/wishlist/empty-wishlist'
import { useWishlistStore } from '@/lib/stores'
import { useMounted } from '@/hooks/use-mounted'
import { getAllProducts } from '@/lib/data'
import { Skeleton } from '@/components/ui/skeleton'
import { Heart } from 'lucide-react'

export default function WishlistPage() {
  const mounted = useMounted()
  const wishlistItems = useWishlistStore((s) => s.items)

  if (!mounted) {
    return (
      <PageContainer className="py-12">
        <h1 className="font-heading text-4xl font-bold mb-8 flex items-center gap-3">
          <Heart className="h-8 w-8 text-primary" strokeWidth={2.5} />
          Your Wishlist
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl border-2 border-border overflow-hidden">
              <Skeleton className="aspect-square w-full" />
              <div className="p-4 space-y-3">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-6 w-1/3" />
              </div>
            </div>
          ))}
        </div>
      </PageContainer>
    )
  }

  const allProducts = getAllProducts()
  const wishlistedProducts = allProducts.filter((p) =>
    wishlistItems.includes(p.id)
  )

  return (
    <PageContainer className="py-12">
      <h1 className="font-heading text-4xl font-bold mb-8 flex items-center gap-3">
        <Heart className="h-8 w-8 text-primary fill-primary" strokeWidth={2.5} />
        Your Wishlist
        {wishlistedProducts.length > 0 && (
          <span className="text-lg text-muted-foreground font-normal">
            ({wishlistedProducts.length})
          </span>
        )}
      </h1>

      {wishlistedProducts.length === 0 ? (
        <EmptyWishlist />
      ) : (
        <ProductGrid products={wishlistedProducts} columns={4} />
      )}
    </PageContainer>
  )
}

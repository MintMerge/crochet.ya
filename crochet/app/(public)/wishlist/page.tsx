'use client'

import { PageContainer } from '@/components/layout'
import { ProductGrid } from '@/components/product'
import { ProductCardSkeleton } from '@/components/product/product-card-skeleton'
import { EmptyWishlist } from '@/components/wishlist/empty-wishlist'
import { useWishlistStore } from '@/lib/stores'
import { useMounted } from '@/hooks/use-mounted'
import { useQuery } from '@tanstack/react-query'
import { Heart } from 'lucide-react'
import type { Product } from '@/types'

export default function WishlistPage() {
  const mounted = useMounted()
  const wishlistItems = useWishlistStore((s) => s.items)

  const { data, isLoading } = useQuery<{ products: Product[] }>({
    queryKey: ['all-products'],
    queryFn: () => fetch('/api/products').then((r) => r.json()),
  })

  if (!mounted || isLoading) {
    return (
      <PageContainer className="py-12">
        <h1 className="font-heading text-4xl font-bold mb-8 flex items-center gap-3">
          <Heart className="h-8 w-8 text-primary" strokeWidth={2.5} />
          Your Wishlist
        </h1>
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </PageContainer>
    )
  }

  const allProducts = data?.products ?? []
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

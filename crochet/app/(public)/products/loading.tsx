import { PageContainer } from '@/components/layout'
import { ProductCardSkeleton } from '@/components/product/product-card-skeleton'
import { Skeleton } from '@/components/ui/skeleton'

export default function ProductsLoading() {
  return (
    <PageContainer className="py-12">
      {/* Centered header — mirrors the real products page */}
      <div className="text-center mb-12">
        <Skeleton className="h-12 w-64 mx-auto mb-4 bg-primary/10" />
        <Skeleton className="h-5 w-80 mx-auto bg-primary/8" />
      </div>

      {/* Category pill skeletons */}
      <div className="flex gap-2 pb-4 mb-12 overflow-hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-24 rounded-full shrink-0 bg-primary/10" />
        ))}
      </div>

      {/* Product grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </PageContainer>
  )
}

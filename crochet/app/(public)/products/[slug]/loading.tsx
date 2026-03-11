import { PageContainer } from '@/components/layout'
import { ProductCardSkeleton } from '@/components/product/product-card-skeleton'
import { Skeleton } from '@/components/ui/skeleton'

export default function ProductDetailLoading() {
  return (
    <PageContainer className="py-8">
      {/* Breadcrumb skeleton */}
      <div className="flex items-center gap-2 mb-8">
        <Skeleton className="h-4 w-12 bg-primary/10" />
        <Skeleton className="h-4 w-3 bg-primary/8" />
        <Skeleton className="h-4 w-16 bg-primary/10" />
        <Skeleton className="h-4 w-3 bg-primary/8" />
        <Skeleton className="h-4 w-24 bg-primary/10" />
      </div>

      {/* Product layout skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-16">
        {/* Gallery */}
        <div className="space-y-3">
          <Skeleton className="aspect-square w-full rounded-2xl bg-primary/10" />
          <div className="flex gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-20 rounded-xl bg-primary/8" />
            ))}
          </div>
        </div>

        {/* Product info */}
        <div className="space-y-4">
          <Skeleton className="h-5 w-24 rounded-full bg-primary/10" />
          <Skeleton className="h-10 w-3/4 bg-primary/10" />
          <Skeleton className="h-8 w-28 bg-primary/10" />
          <Skeleton className="h-px w-full bg-primary/8" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full bg-primary/8" />
            <Skeleton className="h-4 w-5/6 bg-primary/8" />
            <Skeleton className="h-4 w-4/6 bg-primary/8" />
          </div>
          <Skeleton className="h-px w-full bg-primary/8" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-20 bg-primary/10" />
            <div className="flex gap-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-9 w-20 rounded-full bg-primary/8" />
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Skeleton className="h-12 flex-1 rounded-2xl bg-primary/10" />
            <Skeleton className="h-12 w-12 rounded-2xl bg-primary/8" />
          </div>
        </div>
      </div>

      {/* Related products */}
      <div>
        <Skeleton className="h-8 w-48 mb-6 bg-primary/10" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </PageContainer>
  )
}

import { PageContainer } from '@/components/layout'
import { ProductCardSkeleton } from '@/components/product/product-card-skeleton'
import { Skeleton } from '@/components/ui/skeleton'

export default function HomeLoading() {
  return (
    <>
      {/* Hero placeholder */}
      <div className="w-full bg-primary/5 py-20 px-4">
        <div className="max-w-2xl mx-auto text-center space-y-4">
          <Skeleton className="h-12 w-72 mx-auto bg-primary/10" />
          <Skeleton className="h-6 w-96 mx-auto bg-primary/8" />
          <Skeleton className="h-12 w-40 mx-auto rounded-full bg-primary/10" />
        </div>
      </div>

      <PageContainer>
        {/* Featured products section */}
        <div className="py-12">
          <Skeleton className="h-8 w-48 mb-6 bg-primary/10" />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        </div>

        {/* Category grid section */}
        <div className="py-8">
          <Skeleton className="h-8 w-40 mb-6 bg-primary/10" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-2xl bg-primary/8" />
            ))}
          </div>
        </div>

        {/* New arrivals section */}
        <div className="py-8">
          <Skeleton className="h-8 w-40 mb-6 bg-primary/10" />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </PageContainer>
    </>
  )
}

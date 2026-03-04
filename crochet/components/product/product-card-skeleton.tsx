import { Skeleton } from '@/components/ui/skeleton'

export function ProductCardSkeleton() {
  return (
    <div className="w-full overflow-hidden rounded-2xl border-2 border-border bg-card">
      <Skeleton className="aspect-square w-full bg-primary/10" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-5 w-3/4 bg-primary/10" />
        <Skeleton className="h-4 w-full bg-primary/8" />
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-1/3 bg-primary/10" />
          <Skeleton className="h-9 w-9 rounded-full bg-primary/10" />
        </div>
      </div>
    </div>
  )
}

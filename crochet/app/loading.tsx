import { PageContainer } from '@/components/layout'
import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <PageContainer className="py-12">
      <Skeleton className="h-10 w-56 mb-3 bg-primary/10" />
      <Skeleton className="h-5 w-80 mb-10 bg-primary/8" />
    </PageContainer>
  )
}

import Link from 'next/link'
import { PageContainer } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

export default function ProductNotFound() {
  return (
    <PageContainer className="py-20 text-center">
      <div className="max-w-md mx-auto">
        <span className="text-6xl block mb-6">🔍</span>
        <h2 className="font-heading text-2xl font-bold mb-4">
          Product not found
        </h2>
        <p className="text-muted-foreground mb-8">
          This product might have been removed or the link is incorrect.
        </p>
        <Button asChild variant="playful" className="gap-2">
          <Link href="/products">
            Browse All Products
            <ArrowRight className="h-5 w-5" strokeWidth={2.5} />
          </Link>
        </Button>
      </div>
    </PageContainer>
  )
}

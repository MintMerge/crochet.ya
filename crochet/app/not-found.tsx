import Link from 'next/link'
import { PageContainer } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

export default function NotFound() {
  return (
    <PageContainer className="py-20 text-center">
      <div className="max-w-md mx-auto">
        <span className="text-7xl block mb-6">🧶</span>
        <h1 className="font-heading text-5xl font-bold mb-4">404</h1>
        <h2 className="font-heading text-xl font-semibold mb-4">
          Page not found
        </h2>
        <p className="text-muted-foreground mb-8">
          Looks like this page unraveled! The page you&apos;re looking for
          doesn&apos;t exist or has been moved.
        </p>
        <Button asChild variant="playful" className="gap-2">
          <Link href="/">
            Back to Home
            <ArrowRight className="h-5 w-5" strokeWidth={2.5} />
          </Link>
        </Button>
      </div>
    </PageContainer>
  )
}

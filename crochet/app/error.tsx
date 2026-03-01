'use client'

import { PageContainer } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <PageContainer className="py-20 text-center">
      <div className="max-w-md mx-auto">
        <span className="text-6xl block mb-6">🧶</span>
        <h2 className="font-heading text-2xl font-bold mb-4">
          Oops! Something tangled up
        </h2>
        <p className="text-muted-foreground mb-8">
          {error.message || "We hit a snag. Let's try that again."}
        </p>
        <Button variant="playful" onClick={reset} className="gap-2">
          <RefreshCw className="h-4 w-4" strokeWidth={2.5} />
          Try Again
        </Button>
      </div>
    </PageContainer>
  )
}

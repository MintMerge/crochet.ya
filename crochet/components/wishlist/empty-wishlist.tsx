import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function EmptyWishlist() {
  return (
    <div className="flex flex-col items-center justify-center py-16 sm:py-24 text-center px-4">
      {/* Icon ring */}
      <div className="relative mb-8">
        <div className="flex h-28 w-28 items-center justify-center rounded-full bg-primary/10 border-2 border-primary/20">
          <span className="text-5xl" role="img" aria-label="heart">🩷</span>
        </div>
        <span className="absolute -top-1 -right-1 text-2xl" role="img" aria-label="sparkle">✨</span>
        <span className="absolute -bottom-1 -left-1 text-xl" role="img" aria-label="star">⭐</span>
      </div>

      <h2 className="font-heading text-2xl sm:text-3xl font-bold mb-3">
        Your wishlist is empty
      </h2>
      <p className="text-muted-foreground mb-2 max-w-xs sm:max-w-sm text-sm sm:text-base">
        Tap the ♡ on any product to save it here for later.
      </p>
      <p className="text-muted-foreground/70 text-xs sm:text-sm mb-8">
        Your saved pieces will always be here waiting.
      </p>

      <Button asChild variant="playful" size="lg" className="gap-2 w-full sm:w-auto">
        <Link href="/products">
          Discover Products
          <ArrowRight className="h-5 w-5" strokeWidth={2.5} />
        </Link>
      </Button>
    </div>
  )
}

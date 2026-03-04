import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function EmptyCart() {
  return (
    <div className="flex flex-col items-center justify-center py-16 sm:py-24 text-center px-4">
      {/* Icon ring */}
      <div className="relative mb-8">
        <div className="flex h-28 w-28 items-center justify-center rounded-full bg-primary/10 border-2 border-primary/20">
          <span className="text-5xl" role="img" aria-label="shopping bag">🛍️</span>
        </div>
        <span className="absolute -top-1 -right-1 text-2xl" role="img" aria-label="sparkle">✨</span>
      </div>

      <h2 className="font-heading text-2xl sm:text-3xl font-bold mb-3">
        Your cart is empty
      </h2>
      <p className="text-muted-foreground mb-2 max-w-xs sm:max-w-sm text-sm sm:text-base">
        No handmade treasures here yet — but they&apos;re waiting for you!
      </p>
      <p className="text-muted-foreground/70 text-xs sm:text-sm mb-8">
        Each piece is made with love, just for you.
      </p>

      <Button asChild variant="playful" size="lg" className="gap-2 w-full sm:w-auto">
        <Link href="/products">
          Browse Products
          <ArrowRight className="h-5 w-5" strokeWidth={2.5} />
        </Link>
      </Button>
    </div>
  )
}

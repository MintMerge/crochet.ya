import Link from 'next/link'
import { Heart, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function EmptyWishlist() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-muted border-2 border-border">
        <Heart className="h-10 w-10 text-muted-foreground" strokeWidth={2} />
      </div>
      <h2 className="font-heading text-2xl font-bold mb-2">
        Your wishlist is empty
      </h2>
      <p className="text-muted-foreground mb-8 max-w-sm">
        Save your favorite handmade pieces by tapping the heart icon on any product.
      </p>
      <Button asChild variant="playful" size="lg" className="gap-2">
        <Link href="/products">
          Discover Products
          <ArrowRight className="h-5 w-5" strokeWidth={2.5} />
        </Link>
      </Button>
    </div>
  )
}

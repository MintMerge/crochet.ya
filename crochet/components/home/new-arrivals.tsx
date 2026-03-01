import Link from 'next/link'
import { ArrowRight, Sparkles } from 'lucide-react'
import { ProductGrid } from '@/components/product'
import { getNewArrivals } from '@/lib/data'
import { Button } from '@/components/ui/button'

export function NewArrivals() {
  const products = getNewArrivals(4)

  if (products.length === 0) return null

  return (
    <section className="py-16">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h2 className="font-heading text-3xl sm:text-4xl font-bold mb-2 flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-tertiary" strokeWidth={2.5} />
            Fresh Off the Hook
          </h2>
          <p className="text-muted-foreground text-lg">
            Our newest handmade additions
          </p>
        </div>
        <Button asChild variant="ghost" className="hidden sm:flex gap-1">
          <Link href="/products">
            See More
            <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
          </Link>
        </Button>
      </div>

      <ProductGrid products={products} columns={4} />
    </section>
  )
}

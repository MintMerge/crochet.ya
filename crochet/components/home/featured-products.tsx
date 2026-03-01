import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { ProductGrid } from '@/components/product'
import { getFeaturedProducts } from '@/lib/data'
import { Button } from '@/components/ui/button'

export function FeaturedProducts() {
  const products = getFeaturedProducts()

  if (products.length === 0) return null

  return (
    <section className="py-16">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h2 className="font-heading text-3xl sm:text-4xl font-bold mb-2">
            Featured Creations
          </h2>
          <p className="text-muted-foreground text-lg">
            Our most loved handmade pieces
          </p>
        </div>
        <Button asChild variant="ghost" className="hidden sm:flex gap-1">
          <Link href="/products">
            View All
            <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
          </Link>
        </Button>
      </div>

      <ProductGrid products={products} columns={4} />

      <div className="mt-8 text-center sm:hidden">
        <Button asChild variant="outline-playful" className="gap-1">
          <Link href="/products">
            View All Products
            <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
          </Link>
        </Button>
      </div>
    </section>
  )
}

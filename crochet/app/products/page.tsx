import type { Metadata } from 'next'
import { PageContainer } from '@/components/layout'
import { ProductGrid } from '@/components/product'
import { getProductsByCategory, getCategoriesWithCount } from '@/lib/data'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Products',
  description:
    'Browse our full collection of handmade crochet products - amigurumi, accessories, home decor, clothing, keychains and custom orders.',
}

export default function ProductsPage() {
  const categoriesWithCount = getCategoriesWithCount()

  return (
    <PageContainer className="py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="font-heading text-4xl sm:text-5xl font-bold mb-4">
          Our Creations
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Each piece is handmade with care and love. Browse by category or
          scroll through our full collection.
        </p>
      </div>

      {/* Category Pills */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-12 scrollbar-hide">
        <Link href="#all">
          <Badge
            variant="outline"
            className="rounded-full px-4 py-2 text-sm cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors whitespace-nowrap"
          >
            All
          </Badge>
        </Link>
        {categoriesWithCount.map((cat) => (
          <Link key={cat.slug} href={`#${cat.slug}`}>
            <Badge
              variant="outline"
              className="rounded-full px-4 py-2 text-sm cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors whitespace-nowrap"
            >
              {cat.emoji} {cat.name} ({cat.productCount})
            </Badge>
          </Link>
        ))}
      </div>

      {/* Category Sections */}
      <div className="space-y-16" id="all">
        {categoriesWithCount
          .filter((cat) => cat.productCount > 0)
          .map((cat) => {
            const categoryProducts = getProductsByCategory(cat.slug)
            return (
              <section key={cat.slug} id={cat.slug}>
                <div className="mb-6">
                  <h2 className="font-heading text-2xl sm:text-3xl font-bold flex items-center gap-2">
                    <span>{cat.emoji}</span>
                    {cat.name}
                  </h2>
                  <p className="text-muted-foreground mt-1">{cat.description}</p>
                </div>
                <ProductGrid products={categoryProducts} columns={4} />
              </section>
            )
          })}
      </div>
    </PageContainer>
  )
}

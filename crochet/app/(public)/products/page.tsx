import type { Metadata } from 'next'
import { PageContainer } from '@/components/layout'
import { ProductGrid } from '@/components/product'
import { getCategoriesWithCount, getProductsByCategory, getAllProducts } from '@/lib/data'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Products',
  description:
    'Browse our full collection of handmade crochet products - amigurumi, accessories, home decor, clothing, keychains and custom orders.',
}

export default async function ProductsPage() {
  const categoriesWithCount = await getCategoriesWithCount()

  // Fetch products for each category that has items
  const categoriesWithProducts = await Promise.all(
    categoriesWithCount
      .filter((cat) => cat.productCount > 0)
      .map(async (cat) => ({
        ...cat,
        products: await getProductsByCategory(cat.slug),
      }))
  )

  // Fallback: if no categories seeded yet, show all products in a flat grid
  if (categoriesWithProducts.length === 0) {
    const allProducts = await getAllProducts()
    return (
      <PageContainer className="py-12">
        <div className="text-center mb-12">
          <h1 className="font-heading text-4xl sm:text-5xl font-bold mb-4">
            Our Creations
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Each piece is handmade with care and love. Browse our full collection.
          </p>
        </div>
        {allProducts.length > 0 ? (
          <ProductGrid products={allProducts} columns={4} />
        ) : (
          <p className="text-center text-muted-foreground py-16">
            No products yet. Check back soon!
          </p>
        )}
      </PageContainer>
    )
  }

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
        {categoriesWithProducts.map((cat) => (
          <section key={cat.slug} id={cat.slug}>
            <div className="mb-6">
              <h2 className="font-heading text-2xl sm:text-3xl font-bold flex items-center gap-2">
                <span>{cat.emoji}</span>
                {cat.name}
              </h2>
              <p className="text-muted-foreground mt-1">{cat.description}</p>
            </div>
            <ProductGrid products={cat.products} columns={4} />
          </section>
        ))}
      </div>
    </PageContainer>
  )
}

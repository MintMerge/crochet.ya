import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronRight } from 'lucide-react'
import { PageContainer } from '@/components/layout'
import { ProductGallery, ProductInfo, ProductGrid } from '@/components/product'
import { getProductBySlug, getRelatedProducts, getCategoryBySlug } from '@/lib/data'

interface ProductPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) return { title: 'Product Not Found' }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://crochet-ya.vercel.app'
  const primaryImage = product.images.find((img) => img.isPrimary) ?? product.images[0]

  return {
    title: product.name,
    description: product.shortDescription,
    openGraph: {
      title: product.name,
      description: product.shortDescription,
      type: 'website',
      url: `${baseUrl}/products/${product.slug}`,
      images: primaryImage ? [{ url: primaryImage.src, alt: primaryImage.alt }] : [],
    },
  }
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params
  const product = await getProductBySlug(slug)

  if (!product) {
    notFound()
  }

  const [relatedProducts, category] = await Promise.all([
    getRelatedProducts(product, 4),
    getCategoryBySlug(product.category),
  ])

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://crochet-ya.vercel.app'
  const primaryImage = product.images.find((img) => img.isPrimary) ?? product.images[0]

  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: primaryImage?.src,
    url: `${baseUrl}/products/${product.slug}`,
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: product.currency,
      availability: product.inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
    },
  }

  return (
    <PageContainer className="py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />

      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-8">
        <Link href="/" className="hover:text-primary transition-colors">
          Home
        </Link>
        <ChevronRight className="h-4 w-4" />
        <Link href="/products" className="hover:text-primary transition-colors">
          Products
        </Link>
        <ChevronRight className="h-4 w-4" />
        {category && (
          <>
            <Link
              href={`/products#${product.category}`}
              className="hover:text-primary transition-colors"
            >
              {category.name}
            </Link>
            <ChevronRight className="h-4 w-4" />
          </>
        )}
        <span className="text-foreground font-medium">{product.name}</span>
      </nav>

      {/* Product Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-16">
        <ProductGallery images={product.images} productName={product.name} />
        <ProductInfo product={product} />
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section>
          <h2 className="font-heading text-2xl font-bold mb-6">
            You might also like
          </h2>
          <ProductGrid products={relatedProducts} columns={4} />
        </section>
      )}
    </PageContainer>
  )
}

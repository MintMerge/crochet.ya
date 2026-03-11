import type { Metadata } from 'next'
import { PageContainer } from '@/components/layout'
import { HeroSection, CategoryGrid, FeaturedProducts, NewArrivals } from '@/components/home'
import { getFeaturedProducts, getNewArrivals, getCategoriesWithCount, getAllProducts } from '@/lib/data'

export const metadata: Metadata = {
  title: 'crochet.ya | Handmade with Love',
  description:
    'Shop handmade crochet amigurumi, accessories, home decor and custom pieces — each crafted with care.',
  openGraph: {
    title: 'crochet.ya | Handmade with Love',
    description: 'Shop handmade crochet amigurumi, accessories, home decor and custom pieces — each crafted with care.',
    type: 'website',
  },
}

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'crochet.ya',
  description: 'Handmade crochet products — amigurumi, accessories, home decor and custom pieces crafted with care.',
  url: process.env.NEXT_PUBLIC_APP_URL || 'https://crochet-ya.vercel.app',
}

export default async function HomePage() {
  const results = await Promise.allSettled([
    getFeaturedProducts(),
    getNewArrivals(4),
    getCategoriesWithCount(),
    getAllProducts(),
  ])
  const [featuredProducts, newArrivals, categories, allProducts] = results.map((r) =>
    r.status === 'fulfilled' ? r.value : []
  ) as [
    Awaited<ReturnType<typeof getFeaturedProducts>>,
    Awaited<ReturnType<typeof getNewArrivals>>,
    Awaited<ReturnType<typeof getCategoriesWithCount>>,
    Awaited<ReturnType<typeof getAllProducts>>,
  ]

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <HeroSection />
      <PageContainer>
        <FeaturedProducts products={featuredProducts.length > 0 ? featuredProducts : allProducts} />
        <CategoryGrid categories={categories} />
        <NewArrivals products={newArrivals} />
      </PageContainer>
    </>
  )
}

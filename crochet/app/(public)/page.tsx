import { PageContainer } from '@/components/layout'
import { HeroSection, CategoryGrid, FeaturedProducts, NewArrivals } from '@/components/home'
import { getFeaturedProducts, getNewArrivals, getCategoriesWithCount, getAllProducts } from '@/lib/data'

export const dynamic = 'force-dynamic'

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
      <HeroSection />
      <PageContainer>
        <FeaturedProducts products={featuredProducts.length > 0 ? featuredProducts : allProducts} />
        <CategoryGrid categories={categories} />
        <NewArrivals products={newArrivals} />
      </PageContainer>
    </>
  )
}

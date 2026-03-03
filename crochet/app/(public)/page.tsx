import { PageContainer } from '@/components/layout'
import { HeroSection, CategoryGrid, FeaturedProducts, NewArrivals } from '@/components/home'
import { getFeaturedProducts, getNewArrivals, getCategoriesWithCount } from '@/lib/data'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const [featuredProducts, newArrivals, categories] = await Promise.all([
    getFeaturedProducts(),
    getNewArrivals(4),
    getCategoriesWithCount(),
  ])

  return (
    <>
      <HeroSection />
      <PageContainer>
        <FeaturedProducts products={featuredProducts} />
        <CategoryGrid categories={categories} />
        <NewArrivals products={newArrivals} />
      </PageContainer>
    </>
  )
}

import { PageContainer } from '@/components/layout'
import { HeroSection, CategoryGrid, FeaturedProducts, NewArrivals } from '@/components/home'

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <PageContainer>
        <FeaturedProducts />
        <CategoryGrid />
        <NewArrivals />
      </PageContainer>
    </>
  )
}

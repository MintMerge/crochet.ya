import { useWishlistStore } from '@/lib/stores'
import { toast } from 'sonner'

export function useWishlistToggle() {
  const toggleItem = useWishlistStore((state) => state.toggleItem)
  const isWishlisted = useWishlistStore((state) => state.isWishlisted)

  return (productId: string, productName: string) => {
    const wasWishlisted = isWishlisted(productId)
    toggleItem(productId)
    toast.success(
      wasWishlisted ? 'Removed from wishlist' : `${productName} added to wishlist!`
    )
  }
}

import { useCartStore } from '@/lib/stores'
import { toast } from 'sonner'
import type { Product, ProductVariant } from '@/types'

export function useAddToCart() {
  const addItem = useCartStore((state) => state.addItem)

  return (product: Product, variant?: ProductVariant, quantity?: number) => {
    addItem({
      productId: product.id,
      variantId: variant?.id ?? null,
      price: variant?.price ?? product.price,
      name: product.name,
      image:
        product.images.find((i) => i.isPrimary)?.src ??
        product.images[0]?.src ??
        '',
      variantName: variant?.name ?? null,
      quantity: quantity ?? 1,
    })
    toast.success(`${product.name} added to cart!`, {
      description: variant ? variant.name : undefined,
    })
  }
}

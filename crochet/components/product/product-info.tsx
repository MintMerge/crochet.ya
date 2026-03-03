'use client'

import { useState } from 'react'
import { Heart, ShoppingBag, Minus, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useWishlistStore } from '@/lib/stores'
import { useAddToCart } from '@/hooks/use-add-to-cart'
import { useWishlistToggle } from '@/hooks/use-wishlist-toggle'
import { useMounted } from '@/hooks/use-mounted'
import { formatPrice } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { Product, ProductVariant } from '@/types'

interface ProductInfoProps {
  product: Product
}

export function ProductInfo({ product }: ProductInfoProps) {
  const mounted = useMounted()
  const wishlisted = useWishlistStore((s) => s.isWishlisted(product.id))
  const toggleWishlist = useWishlistToggle()
  const addToCart = useAddToCart()

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(
    product.variants.find((v) => v.inStock) ?? product.variants[0]
  )
  const [quantity, setQuantity] = useState(1)
  const currentPrice = selectedVariant?.price ?? product.price

  const handleAddToCart = () => {
    addToCart(product, selectedVariant, quantity)
    setQuantity(1)
  }

  const hasColorVariants = product.variants.some((v) => v.colorHex)
  const hasSizeVariants = product.variants.some((v) => v.size)

  return (
    <div className="space-y-6">
      {/* Category */}
      <Badge variant="outline" className="rounded-full text-xs">
        {product.category.replace('-', ' ')}
      </Badge>

      {/* Name */}
      <h1 className="font-heading text-3xl sm:text-4xl font-bold">
        {product.name}
      </h1>

      {/* Price */}
      <div className="flex items-baseline gap-3">
        <span className="font-heading text-3xl font-bold text-primary">
          {formatPrice(currentPrice)}
        </span>
        {product.compareAtPrice && (
          <span className="text-lg text-muted-foreground line-through">
            {formatPrice(product.compareAtPrice)}
          </span>
        )}
      </div>

      {/* Short description */}
      <p className="text-muted-foreground leading-relaxed">
        {product.shortDescription}
      </p>

      <Separator />

      {/* Variants - Color */}
      {hasColorVariants && (
        <div>
          <h3 className="font-heading font-semibold text-sm mb-3 uppercase tracking-wide">
            Color: {selectedVariant?.color}
          </h3>
          <div className="flex gap-2">
            {product.variants
              .filter((v) => v.colorHex)
              .map((variant) => (
                <button
                  key={variant.id}
                  onClick={() => setSelectedVariant(variant)}
                  disabled={!variant.inStock}
                  className={cn(
                    'h-10 w-10 rounded-full border-2 transition-all',
                    selectedVariant?.id === variant.id
                      ? 'border-foreground shadow-hard-sm scale-110'
                      : 'border-border hover:border-foreground/50',
                    !variant.inStock && 'opacity-40 cursor-not-allowed'
                  )}
                  style={{ backgroundColor: variant.colorHex }}
                  aria-label={`Select ${variant.name}${!variant.inStock ? ' (Out of stock)' : ''}`}
                  title={variant.name}
                />
              ))}
          </div>
        </div>
      )}

      {/* Variants - Size */}
      {hasSizeVariants && (
        <div>
          <h3 className="font-heading font-semibold text-sm mb-3 uppercase tracking-wide">
            Size: {selectedVariant?.size}
          </h3>
          <div className="flex gap-2">
            {product.variants
              .filter((v) => v.size)
              .map((variant) => (
                <button
                  key={variant.id}
                  onClick={() => setSelectedVariant(variant)}
                  disabled={!variant.inStock}
                  className={cn(
                    'h-10 px-4 rounded-full border-2 font-medium text-sm transition-all',
                    selectedVariant?.id === variant.id
                      ? 'border-foreground bg-foreground text-background'
                      : 'border-border hover:border-foreground/50',
                    !variant.inStock && 'opacity-40 cursor-not-allowed line-through'
                  )}
                  aria-label={`Select size ${variant.size}${!variant.inStock ? ' (Out of stock)' : ''}`}
                >
                  {variant.size}
                </button>
              ))}
          </div>
        </div>
      )}

      {/* Quantity */}
      <div>
        <h3 className="font-heading font-semibold text-sm mb-3 uppercase tracking-wide">
          Quantity
        </h3>
        <div className="flex items-center gap-3">
          <div className="flex items-center border-2 border-border rounded-full overflow-hidden">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="h-10 w-10 flex items-center justify-center hover:bg-muted transition-colors"
              aria-label="Decrease quantity"
            >
              <Minus className="h-4 w-4" strokeWidth={2.5} />
            </button>
            <span className="w-12 text-center font-medium">{quantity}</span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="h-10 w-10 flex items-center justify-center hover:bg-muted transition-colors"
              aria-label="Increase quantity"
            >
              <Plus className="h-4 w-4" strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          variant="playful"
          size="lg"
          className="flex-1 gap-2"
          onClick={handleAddToCart}
          disabled={!product.inStock}
        >
          <ShoppingBag className="h-5 w-5" strokeWidth={2.5} />
          {product.inStock ? 'Add to Cart' : 'Out of Stock'}
        </Button>

        <Button
          variant="outline-playful"
          size="lg"
          className="w-14"
          onClick={() => toggleWishlist(product.id, product.name)}
          aria-label={mounted && wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart
            className={cn(
              'h-5 w-5',
              mounted && wishlisted ? 'fill-primary text-primary' : ''
            )}
            strokeWidth={2.5}
          />
        </Button>
      </div>

      <Separator />

      {/* Full description */}
      <div>
        <h3 className="font-heading font-semibold mb-2">About this product</h3>
        <p className="text-muted-foreground leading-relaxed text-sm">
          {product.description}
        </p>
      </div>

      {/* Tags */}
      {product.tags.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {product.tags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="rounded-full text-xs capitalize"
            >
              {tag}
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}

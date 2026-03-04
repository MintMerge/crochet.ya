'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Heart, ShoppingBag } from 'lucide-react'
import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useWishlistStore } from '@/lib/stores'
import { useAddToCart } from '@/hooks/use-add-to-cart'
import { useWishlistToggle } from '@/hooks/use-wishlist-toggle'
import { useMounted } from '@/hooks/use-mounted'
import { formatPrice } from '@/lib/format'
import { truncate } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { Product } from '@/types'

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const mounted = useMounted()
  const wishlisted = useWishlistStore((s) => s.isWishlisted(product.id))
  const toggleWishlist = useWishlistToggle()
  const addToCart = useAddToCart()

  const primaryImage =
    product.images.find((i) => i.isPrimary) ?? product.images[0]

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="group"
    >
      <div className="relative overflow-hidden rounded-2xl border-2 border-border bg-card shadow-hard-sm transition-shadow hover:shadow-hard">
        {/* Image */}
        <Link href={`/products/${product.slug}`} className="block">
          <div className="relative aspect-square overflow-hidden bg-muted">
            {primaryImage && (
              <Image
                src={primaryImage.src}
                alt={primaryImage.alt}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
            )}

            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-1.5">
              {product.isNew && (
                <Badge className="bg-tertiary text-tertiary-foreground border-2 border-foreground font-bold text-xs">
                  New
                </Badge>
              )}
              {product.compareAtPrice && (
                <Badge className="bg-destructive text-destructive-foreground border-2 border-foreground font-bold text-xs">
                  Sale
                </Badge>
              )}
            </div>
          </div>
        </Link>

        {/* Wishlist button */}
        <button
          onClick={(e) => {
            e.preventDefault()
            toggleWishlist(product.id, product.name)
          }}
          className="absolute top-3 right-3 flex h-10 w-10 items-center justify-center rounded-full bg-card/90 border-2 border-border backdrop-blur-sm transition-all hover:scale-110 cursor-pointer"
          aria-label={mounted && wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart
            className={cn(
              'h-4 w-4 transition-colors',
              mounted && wishlisted ? 'fill-primary text-primary' : 'text-muted-foreground'
            )}
            strokeWidth={2.5}
          />
        </button>

        {/* Content */}
        <div className="p-4">
          <Link href={`/products/${product.slug}`}>
            <h3 className="font-heading font-semibold text-base mb-1 hover:text-primary transition-colors">
              {product.name}
            </h3>
          </Link>
          <p className="text-sm text-muted-foreground mb-3">
            {truncate(product.shortDescription, 60)}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <span className="font-heading font-bold text-lg text-primary">
                {formatPrice(product.price)}
              </span>
              {product.compareAtPrice && (
                <span className="text-sm text-muted-foreground line-through">
                  {formatPrice(product.compareAtPrice)}
                </span>
              )}
            </div>

            <Button
              variant="playful"
              size="sm"
              className="h-10 w-10 p-0"
              onClick={(e) => {
                e.preventDefault()
                addToCart(product)
              }}
              aria-label={`Add ${product.name} to cart`}
              disabled={!product.inStock}
            >
              <ShoppingBag className="h-4 w-4" strokeWidth={2.5} />
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

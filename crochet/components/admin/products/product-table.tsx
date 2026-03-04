'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { Pencil, Trash2, Plus, Package } from 'lucide-react'
import { SearchInput } from '@/components/admin/shared/search-input'
import { DeleteProductDialog } from './delete-product-dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { formatPrice } from '@/lib/format'
import type { Product } from '@/types'

const CATEGORY_LABELS: Record<string, string> = {
  amigurumi: '🧸 Amigurumi',
  accessories: '🎀 Accessories',
  'home-decor': '🏡 Home Decor',
  clothing: '👚 Clothing',
  keychains: '🔑 Keychains',
  custom: '✨ Custom',
}

const CATEGORIES = ['all', 'amigurumi', 'accessories', 'home-decor', 'clothing', 'keychains', 'custom']

export function ProductTable() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null)

  const params = new URLSearchParams()
  if (search) params.set('q', search)
  if (category !== 'all') params.set('category', category)

  const { data, isLoading, error } = useQuery<{ products: Product[] }>({
    queryKey: ['admin-products', search, category],
    queryFn: () =>
      fetch(`/api/admin/products?${params.toString()}`).then((r) => r.json()),
  })

  const products = data?.products ?? []

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search products..."
          className="w-64"
        />
        <div className="flex gap-1 flex-wrap">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors border ${
                category === cat
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'border-border text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              {cat === 'all' ? 'All' : CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>
        <div className="ml-auto">
          <Button asChild size="sm" className="gap-1.5">
            <Link href="/admin/products/new">
              <Plus className="h-4 w-4" />
              New Product
            </Link>
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-4 space-y-0">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 border-b border-border/50 py-3 px-4">
                <Skeleton className="h-10 w-10 rounded-md shrink-0 bg-primary/10" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-4 w-40 bg-primary/10" />
                  <Skeleton className="h-3 w-24 bg-primary/8" />
                </div>
                <Skeleton className="h-4 w-24 bg-primary/8 hidden sm:block" />
                <Skeleton className="h-4 w-16 bg-primary/10 hidden md:block" />
                <Skeleton className="h-6 w-16 rounded-full bg-primary/10 hidden lg:block" />
                <Skeleton className="h-8 w-16 rounded-md bg-primary/8 ml-auto" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-16 text-destructive text-sm">
            Failed to load products
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-center px-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <Package className="h-7 w-7 text-muted-foreground" strokeWidth={1.5} />
            </div>
            <p className="font-medium text-sm">
              {search || category !== 'all' ? 'No products match your search' : 'No products yet'}
            </p>
            <p className="text-muted-foreground text-xs max-w-xs">
              {search || category !== 'all'
                ? 'Try a different search term or category'
                : 'Add your first product to get started'}
            </p>
            {!search && category === 'all' && (
              <Button asChild size="sm" className="mt-1">
                <Link href="/admin/products/new">
                  <Plus className="h-4 w-4 mr-1.5" />
                  Add your first product
                </Link>
              </Button>
            )}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Product</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Category</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Price</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Stock</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Badges</th>
                <th className="py-3 px-4" />
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                const primaryImage = product.images.find((img) => img.isPrimary) ?? product.images[0]
                return (
                  <tr key={product.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        {primaryImage && (
                          <div className="relative w-10 h-10 rounded-md overflow-hidden bg-muted shrink-0">
                            <Image
                              src={primaryImage.src}
                              alt={primaryImage.alt}
                              fill
                              className="object-cover"
                              sizes="40px"
                            />
                          </div>
                        )}
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-xs text-muted-foreground font-mono">{product.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {CATEGORY_LABELS[product.category] ?? product.category}
                    </td>
                    <td className="py-3 px-4 font-medium">
                      {formatPrice(product.price)}
                      {product.compareAtPrice && (
                        <span className="text-xs text-muted-foreground line-through ml-1.5">
                          {formatPrice(product.compareAtPrice)}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          product.inStock
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {product.inStock ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-1 flex-wrap">
                        {product.featured && (
                          <Badge variant="outline" className="text-xs">Featured</Badge>
                        )}
                        {product.isNew && (
                          <Badge variant="outline" className="text-xs">New</Badge>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1 justify-end">
                        <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                          <Link href={`/admin/products/${product.id}`}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:text-destructive"
                          onClick={() => setDeleteTarget({ id: product.id, name: product.name })}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {deleteTarget && (
        <DeleteProductDialog
          productId={deleteTarget.id}
          productName={deleteTarget.name}
          open={Boolean(deleteTarget)}
          onOpenChange={(open) => !open && setDeleteTarget(null)}
        />
      )}
    </div>
  )
}

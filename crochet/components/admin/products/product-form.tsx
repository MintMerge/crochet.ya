'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { productFormSchema, CATEGORY_SLUGS, type ProductFormValues } from '@/lib/validations/product'
import { ImageUpload } from './image-upload'
import { VariantEditor } from './variant-editor'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Product } from '@/types'

const CATEGORY_LABELS: Record<string, string> = {
  amigurumi: '🧸 Amigurumi',
  accessories: '🎀 Accessories',
  'home-decor': '🏡 Home Decor',
  clothing: '👚 Clothing',
  keychains: '🔑 Keychains',
  custom: '✨ Custom Orders',
}

interface ProductFormProps {
  product?: Product
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export function ProductForm({ product }: ProductFormProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const isEditing = Boolean(product)
  const slugEditedManually = useRef(false)

  const methods = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: product
      ? {
          name: product.name,
          slug: product.slug,
          description: product.description,
          shortDescription: product.shortDescription,
          price: product.price,
          compareAtPrice: product.compareAtPrice ?? undefined,
          currency: product.currency,
          category: product.category,
          tags: product.tags,
          images: product.images,
          variants: product.variants,
          featured: product.featured,
          isNew: product.isNew,
          inStock: product.inStock,
        }
      : {
          name: '',
          slug: '',
          description: '',
          shortDescription: '',
          price: 0,
          currency: 'INR',
          category: 'amigurumi',
          tags: [],
          images: [],
          variants: [],
          featured: false,
          isNew: false,
          inStock: true,
        },
  })

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = methods

  const nameValue = watch('name')
  const imagesValue = watch('images')

  // Auto-generate slug from name unless user edited it manually
  useEffect(() => {
    if (!isEditing && !slugEditedManually.current && nameValue) {
      setValue('slug', slugify(nameValue), { shouldValidate: false })
    }
  }, [nameValue, isEditing, setValue])

  const [tagsInput, setTagsInput] = useState(product?.tags.join(', ') ?? '')

  const mutation = useMutation({
    mutationFn: async (values: ProductFormValues) => {
      const url = isEditing
        ? `/api/admin/products/${product!.id}`
        : '/api/admin/products'
      const method = isEditing ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to save product')
      return data.product as Product
    },
    onSuccess: (saved) => {
      toast.success(isEditing ? 'Product updated!' : 'Product created!')
      queryClient.invalidateQueries({ queryKey: ['admin-products'] })
      router.push('/admin/products')
    },
    onError: (err: Error) => {
      toast.error(err.message)
    },
  })

  function onSubmit(values: ProductFormValues) {
    // Parse tags from the comma-separated input
    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
    mutation.mutate({ ...values, tags })
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-3xl">
        {/* Basic Info */}
        <section className="bg-card border border-border rounded-xl p-6 space-y-4">
          <h2 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Basic Info</h2>

          <div className="space-y-1.5">
            <Label htmlFor="name">Product Name *</Label>
            <Input id="name" {...register('name')} placeholder="e.g. Benny the Bear" />
            {errors.name && <p className="text-destructive text-xs">{errors.name.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="slug">URL Slug *</Label>
            <Input
              id="slug"
              {...register('slug')}
              placeholder="benny-the-bear"
              onChange={(e) => {
                slugEditedManually.current = true
                setValue('slug', e.target.value)
              }}
            />
            {errors.slug && <p className="text-destructive text-xs">{errors.slug.message}</p>}
            <p className="text-xs text-muted-foreground">
              Used in the URL: /products/<span className="font-mono">{watch('slug') || 'your-slug'}</span>
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="shortDescription">Short Description *</Label>
            <Input
              id="shortDescription"
              {...register('shortDescription')}
              placeholder="A short 1-line summary shown on product cards"
            />
            {errors.shortDescription && (
              <p className="text-destructive text-xs">{errors.shortDescription.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Full Description *</Label>
            <textarea
              id="description"
              {...register('description')}
              rows={5}
              placeholder="Detailed product description..."
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-y"
            />
            {errors.description && (
              <p className="text-destructive text-xs">{errors.description.message}</p>
            )}
          </div>
        </section>

        {/* Pricing & Category */}
        <section className="bg-card border border-border rounded-xl p-6 space-y-4">
          <h2 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Pricing & Category</h2>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="price">Price (INR) *</Label>
              <Input
                id="price"
                type="number"
                {...register('price', { valueAsNumber: true })}
                placeholder="899"
              />
              {errors.price && <p className="text-destructive text-xs">{errors.price.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="compareAtPrice">Compare At Price</Label>
              <Input
                id="compareAtPrice"
                type="number"
                {...register('compareAtPrice', { valueAsNumber: true, setValueAs: (v) => (v === '' || isNaN(v) ? undefined : Number(v)) })}
                placeholder="1099 (optional)"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Category *</Label>
            <Select
              defaultValue={product?.category ?? 'amigurumi'}
              onValueChange={(val) => setValue('category', val as ProductFormValues['category'])}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORY_SLUGS.map((slug) => (
                  <SelectItem key={slug} value={slug}>
                    {CATEGORY_LABELS[slug]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && <p className="text-destructive text-xs">{errors.category.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="tags">Tags</Label>
            <Input
              id="tags"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="bestseller, gift, new (comma-separated)"
            />
            <p className="text-xs text-muted-foreground">Comma-separated list of tags</p>
          </div>
        </section>

        {/* Images */}
        <section className="bg-card border border-border rounded-xl p-6 space-y-4">
          <h2 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Images</h2>
          <ImageUpload
            images={imagesValue}
            onChange={(imgs) => setValue('images', imgs, { shouldValidate: true })}
          />
          {errors.images && (
            <p className="text-destructive text-xs">
              {typeof errors.images === 'object' && 'message' in errors.images
                ? errors.images.message as string
                : 'At least one image is required'}
            </p>
          )}
        </section>

        {/* Variants */}
        <section className="bg-card border border-border rounded-xl p-6 space-y-4">
          <h2 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Variants</h2>
          <VariantEditor />
        </section>

        {/* Visibility */}
        <section className="bg-card border border-border rounded-xl p-6 space-y-4">
          <h2 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Visibility</h2>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="inStock"
                {...register('inStock')}
                className="rounded border-border w-4 h-4"
              />
              <Label htmlFor="inStock" className="cursor-pointer">In Stock</Label>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="featured"
                {...register('featured')}
                className="rounded border-border w-4 h-4"
              />
              <Label htmlFor="featured" className="cursor-pointer">Featured (shown on homepage)</Label>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isNew"
                {...register('isNew')}
                className="rounded border-border w-4 h-4"
              />
              <Label htmlFor="isNew" className="cursor-pointer">New Arrival badge</Label>
            </div>
          </div>
        </section>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : isEditing ? (
              'Save Changes'
            ) : (
              'Create Product'
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/admin/products')}
            disabled={mutation.isPending}
          >
            Cancel
          </Button>
        </div>
      </form>
    </FormProvider>
  )
}

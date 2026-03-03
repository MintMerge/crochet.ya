'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { AdminPageHeader } from '@/components/admin/shared/admin-page-header'
import { CategoryRow, type CategoryRowData } from '@/components/admin/categories/category-row'
import { Button } from '@/components/ui/button'

export default function CategoriesPage() {
  const queryClient = useQueryClient()
  const [localCategories, setLocalCategories] = useState<CategoryRowData[] | null>(null)

  const { data, isLoading } = useQuery<{ categories: CategoryRowData[] }>({
    queryKey: ['admin-categories'],
    queryFn: () => fetch('/api/admin/categories').then((r) => r.json()),
  })

  // Initialize local state once data loads
  useEffect(() => {
    if (data?.categories && !localCategories) {
      setLocalCategories(data.categories)
    }
  }, [data, localCategories])

  const categories = localCategories ?? data?.categories ?? []

  const mutation = useMutation({
    mutationFn: async (cats: CategoryRowData[]) => {
      const res = await fetch('/api/admin/categories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categories: cats }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Save failed')
      return json
    },
    onSuccess: () => {
      toast.success('Categories saved!')
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] })
    },
    onError: (err: Error) => {
      toast.error(err.message)
    },
  })

  function handleChange(index: number, updated: CategoryRowData) {
    setLocalCategories((prev) => {
      const next = [...(prev ?? [])]
      next[index] = updated
      return next
    })
  }

  return (
    <div>
      <AdminPageHeader
        title="Categories"
        description="Edit category names, descriptions, and images"
        action={
          <Button
            onClick={() => mutation.mutate(categories)}
            disabled={mutation.isPending || isLoading}
            size="sm"
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        }
      />

      <div className="bg-card border border-border rounded-xl p-5">
        {/* Header row */}
        <div className="grid grid-cols-[auto_1fr_2fr_1fr_auto] gap-3 mb-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">
          <span className="w-16">Emoji</span>
          <span>Name</span>
          <span>Description</span>
          <span>Image URL</span>
          <span className="w-24 text-right">Slug</span>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">
            Loading...
          </div>
        ) : (
          <div>
            {categories.map((cat, index) => (
              <CategoryRow
                key={cat.slug}
                category={cat}
                onChange={(updated) => handleChange(index, updated)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

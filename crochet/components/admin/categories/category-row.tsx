'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'

export interface CategoryRowData {
  slug: string
  name: string
  description: string
  image: string
  emoji: string
  sort_order: number
}

interface CategoryRowProps {
  category: CategoryRowData
  onChange: (updated: CategoryRowData) => void
}

export function CategoryRow({ category, onChange }: CategoryRowProps) {
  function update(field: keyof CategoryRowData, value: string | number) {
    onChange({ ...category, [field]: value })
  }

  return (
    <div className="grid grid-cols-[auto_1fr_2fr_1fr_auto] gap-3 items-center py-3 border-b border-border/50 last:border-0">
      {/* Emoji */}
      <Input
        value={category.emoji}
        onChange={(e) => update('emoji', e.target.value)}
        className="w-16 h-8 text-center text-lg"
        maxLength={2}
        title="Emoji"
      />

      {/* Name */}
      <Input
        value={category.name}
        onChange={(e) => update('name', e.target.value)}
        placeholder="Category name"
        className="h-8 text-sm"
      />

      {/* Description */}
      <Input
        value={category.description}
        onChange={(e) => update('description', e.target.value)}
        placeholder="Short description"
        className="h-8 text-sm"
      />

      {/* Image URL */}
      <Input
        value={category.image}
        onChange={(e) => update('image', e.target.value)}
        placeholder="Image URL"
        className="h-8 text-xs"
      />

      {/* Slug (read-only) */}
      <span className="text-xs text-muted-foreground font-mono w-24 text-right shrink-0">
        {category.slug}
      </span>
    </div>
  )
}

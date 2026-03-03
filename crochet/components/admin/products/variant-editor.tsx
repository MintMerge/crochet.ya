'use client'

import { useFieldArray, useFormContext } from 'react-hook-form'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { ProductFormValues } from '@/lib/validations/product'

export function VariantEditor() {
  const { register, control, formState: { errors } } = useFormContext<ProductFormValues>()
  const { fields, append, remove } = useFieldArray({ control, name: 'variants' })

  function addVariant() {
    const id = `var-${Date.now()}`
    append({ id, name: '', color: '', size: '', colorHex: '', inStock: true })
  }

  return (
    <div className="space-y-3">
      {fields.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No variants. Add variants for different colors, sizes, etc.
        </p>
      )}

      {fields.map((field, index) => (
        <div key={field.id} className="border border-border rounded-lg p-3 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Variant {index + 1}</p>
            <button
              type="button"
              onClick={() => remove(index)}
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Hidden ID */}
            <input type="hidden" {...register(`variants.${index}.id`)} />

            {/* Name */}
            <div className="space-y-1">
              <Label className="text-xs">Name *</Label>
              <Input
                {...register(`variants.${index}.name`)}
                placeholder="e.g. Honey, Small"
                className="h-8"
              />
              {errors.variants?.[index]?.name && (
                <p className="text-destructive text-xs">{errors.variants[index]!.name!.message}</p>
              )}
            </div>

            {/* Color */}
            <div className="space-y-1">
              <Label className="text-xs">Color</Label>
              <Input
                {...register(`variants.${index}.color`)}
                placeholder="e.g. Honey"
                className="h-8"
              />
            </div>

            {/* Size */}
            <div className="space-y-1">
              <Label className="text-xs">Size</Label>
              <Input
                {...register(`variants.${index}.size`)}
                placeholder="e.g. S, M, L"
                className="h-8"
              />
            </div>

            {/* Color Hex */}
            <div className="space-y-1">
              <Label className="text-xs">Color Hex</Label>
              <div className="flex gap-2">
                <Input
                  {...register(`variants.${index}.colorHex`)}
                  placeholder="#D4A574"
                  className="h-8 flex-1"
                />
              </div>
            </div>
          </div>

          {/* In Stock */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id={`variant-instock-${index}`}
              {...register(`variants.${index}.inStock`)}
              className="rounded border-border"
            />
            <Label htmlFor={`variant-instock-${index}`} className="text-xs cursor-pointer">
              In Stock
            </Label>
          </div>
        </div>
      ))}

      <Button type="button" variant="outline" size="sm" onClick={addVariant} className="gap-1.5">
        <Plus className="h-3.5 w-3.5" />
        Add Variant
      </Button>
    </div>
  )
}

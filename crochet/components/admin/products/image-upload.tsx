'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { Upload, X, Star, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { ProductImage } from '@/types'

interface ImageUploadProps {
  images: ProductImage[]
  onChange: (images: ProductImage[]) => void
}

export function ImageUpload({ images, onChange }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (files.length === 0) return

    setUploading(true)
    const uploaded: ProductImage[] = []

    for (const file of files) {
      const formData = new FormData()
      formData.append('file', file)

      try {
        const res = await fetch('/api/admin/upload', { method: 'POST', body: formData })
        const data = await res.json()

        if (!res.ok) {
          toast.error(data.error ?? 'Upload failed')
          continue
        }

        uploaded.push({
          src: data.url,
          alt: file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '),
          isPrimary: images.length === 0 && uploaded.length === 0,
        })
      } catch {
        toast.error(`Failed to upload ${file.name}`)
      }
    }

    if (uploaded.length > 0) {
      onChange([...images, ...uploaded])
      toast.success(`${uploaded.length} image${uploaded.length > 1 ? 's' : ''} uploaded`)
    }

    setUploading(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function setPrimary(index: number) {
    onChange(images.map((img, i) => ({ ...img, isPrimary: i === index })))
  }

  function removeImage(index: number) {
    const next = images.filter((_, i) => i !== index)
    // Ensure at least one primary
    if (next.length > 0 && !next.some((img) => img.isPrimary)) {
      next[0] = { ...next[0], isPrimary: true }
    }
    onChange(next)
  }

  function updateAlt(index: number, alt: string) {
    onChange(images.map((img, i) => (i === index ? { ...img, alt } : img)))
  }

  return (
    <div className="space-y-3">
      {/* Upload button */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-colors"
      >
        {uploading ? (
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin" />
            <p className="text-sm">Uploading...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <Upload className="h-6 w-6" />
            <p className="text-sm font-medium">Click to upload images</p>
            <p className="text-xs">PNG, JPG, WEBP — max 5MB each</p>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFileSelect}
          disabled={uploading}
        />
      </div>

      {/* Image list */}
      {images.length > 0 && (
        <div className="space-y-2">
          {images.map((img, index) => (
            <div
              key={index}
              className="flex items-center gap-3 border border-border rounded-lg p-2 bg-card"
            >
              {/* Thumbnail */}
              <div className="relative w-12 h-12 rounded-md overflow-hidden bg-muted shrink-0">
                <Image src={img.src} alt={img.alt} fill className="object-cover" sizes="48px" />
              </div>

              {/* Alt text */}
              <Input
                value={img.alt}
                onChange={(e) => updateAlt(index, e.target.value)}
                placeholder="Alt text..."
                className="flex-1 h-8 text-xs"
              />

              {/* Primary star */}
              <button
                type="button"
                onClick={() => setPrimary(index)}
                title={img.isPrimary ? 'Primary image' : 'Set as primary'}
                className={img.isPrimary ? 'text-yellow-500' : 'text-muted-foreground hover:text-yellow-500'}
              >
                <Star className="h-4 w-4" fill={img.isPrimary ? 'currentColor' : 'none'} />
              </button>

              {/* Remove */}
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="text-muted-foreground hover:text-destructive"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

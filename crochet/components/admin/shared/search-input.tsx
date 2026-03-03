'use client'

import { useEffect, useState } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'

interface SearchInputProps {
  placeholder?: string
  value: string
  onChange: (value: string) => void
  debounceMs?: number
  className?: string
}

export function SearchInput({
  placeholder = 'Search...',
  value,
  onChange,
  debounceMs = 300,
  className,
}: SearchInputProps) {
  const [local, setLocal] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => onChange(local), debounceMs)
    return () => clearTimeout(timer)
  }, [local, debounceMs, onChange])

  useEffect(() => {
    setLocal(value)
  }, [value])

  return (
    <div className={`relative ${className ?? ''}`}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        placeholder={placeholder}
        className="pl-9"
      />
    </div>
  )
}

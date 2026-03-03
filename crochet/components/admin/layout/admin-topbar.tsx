'use client'

import { usePathname } from 'next/navigation'
import { ChevronRight } from 'lucide-react'

const LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  products: 'Products',
  orders: 'Orders',
  categories: 'Categories',
  settings: 'Settings',
  new: 'New',
}

export function AdminTopbar() {
  const pathname = usePathname()
  // Build breadcrumb from pathname segments
  const segments = pathname
    .replace('/admin/', '')
    .replace('/admin', '')
    .split('/')
    .filter(Boolean)

  return (
    <header className="h-14 border-b border-border bg-background flex items-center px-6 gap-2 text-sm">
      <span className="text-muted-foreground">Admin</span>
      {segments.map((seg, i) => (
        <span key={i} className="flex items-center gap-2">
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
          <span className={i === segments.length - 1 ? 'font-medium' : 'text-muted-foreground'}>
            {LABELS[seg] ?? seg}
          </span>
        </span>
      ))}
    </header>
  )
}

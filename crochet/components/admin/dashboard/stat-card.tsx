import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  description?: string
  className?: string
}

export function StatCard({ title, value, icon: Icon, description, className }: StatCardProps) {
  return (
    <div
      className={cn(
        'bg-card border border-border rounded-xl p-5 flex items-start justify-between gap-4',
        className
      )}
    >
      <div>
        <p className="text-sm text-muted-foreground font-medium">{title}</p>
        <p className="text-2xl font-bold mt-1">{value}</p>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      <div className="p-2 bg-primary/10 rounded-lg shrink-0">
        <Icon className="h-5 w-5 text-primary" />
      </div>
    </div>
  )
}

import { ORDER_STATUSES, type OrderStatus } from '@/types'
import { cn } from '@/lib/utils'

interface StatusBadgeProps {
  status: OrderStatus
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = ORDER_STATUSES.find((s) => s.value === status)
  if (!config) return null

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        config.color,
        className
      )}
    >
      {config.label}
    </span>
  )
}

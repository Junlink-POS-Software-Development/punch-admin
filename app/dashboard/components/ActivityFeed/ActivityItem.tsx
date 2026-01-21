import { 
  ShoppingBag, 
  UserPlus, 
  Store as StoreIcon, 
  AlertCircle,
  CreditCard
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { formatRelativeTime } from '@/lib/utils/formatters'
import type { Activity } from './activityFeed.types'

interface ActivityItemProps {
  activity: Activity
}

const iconMap = {
  payment: CreditCard,
  transaction: ShoppingBag,
  staff: UserPlus,
  store: StoreIcon,
  system: AlertCircle
}

const statusColors = {
  success: 'text-emerald-500 bg-emerald-500/10',
  warning: 'text-amber-500 bg-amber-500/10',
  error: 'text-rose-500 bg-rose-500/10',
  info: 'text-blue-500 bg-blue-500/10'
}

export function ActivityItem({ activity }: ActivityItemProps) {
  const Icon = iconMap[activity.type] || AlertCircle
  const colorClass = statusColors[activity.status] || statusColors.info

  return (
    <div className="group flex items-start gap-4 px-6 py-4 transition-colors hover:bg-muted/50">
      <div className={cn(
        "flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-transform group-hover:scale-110",
        colorClass
      )}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-medium text-foreground truncate">
            {activity.title}
          </p>
          <span className="text-xs text-muted-foreground shrink-0">
            {formatRelativeTime(activity.timestamp)}
          </span>
        </div>
        <p className="text-sm text-muted-foreground truncate">
          {activity.description}
        </p>
      </div>
    </div>
  )
}

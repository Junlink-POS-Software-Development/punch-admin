'use client'

import { ACTIVITY_EVENTS } from '@/app/dashboard/data'
import { formatCurrency } from '@/lib/utils/formatters'
import { formatDistanceToNow, parseISO } from 'date-fns'
import { cn } from '@/lib/utils/cn'
import {
  ShoppingCart,
  Package,
  Receipt,
} from 'lucide-react'

const typeConfig = {
  sale: {
    icon: ShoppingCart,
    color: 'bg-success/10 text-success',
    line: 'border-success/30',
  },
  restock: {
    icon: Package,
    color: 'bg-primary/10 text-primary',
    line: 'border-primary/30',
  },
  expense: {
    icon: Receipt,
    color: 'bg-warning/10 text-warning',
    line: 'border-warning/30',
  },
}

export function ActivityFeed() {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h3 className="text-sm font-semibold text-foreground mb-4">
        Recent Activity
      </h3>

      <div className="relative space-y-0">
        {/* Timeline line */}
        <div className="absolute left-[17px] top-3 bottom-3 w-px bg-border" />

        {ACTIVITY_EVENTS.map((event, index) => {
          const config = typeConfig[event.type]
          const Icon = config.icon

          return (
            <div
              key={event.id}
              className={cn(
                'relative flex items-start gap-3 py-3',
                index < ACTIVITY_EVENTS.length - 1 && 'border-b border-border/30'
              )}
            >
              {/* Icon dot */}
              <div
                className={cn(
                  'relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
                  config.color
                )}
              >
                <Icon className="h-4 w-4" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground truncate">
                  {event.description}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {formatDistanceToNow(parseISO(event.timestamp), {
                    addSuffix: true,
                  })}
                </p>
              </div>

              {/* Amount */}
              <span
                className={cn(
                  'text-sm font-semibold shrink-0',
                  event.type === 'sale'
                    ? 'text-success'
                    : event.type === 'expense'
                    ? 'text-destructive'
                    : 'text-foreground'
                )}
              >
                {event.type === 'expense' ? '−' : event.type === 'sale' ? '+' : ''}
                {formatCurrency(event.amount)}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

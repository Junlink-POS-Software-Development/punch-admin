'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatRelativeTime, formatCurrency } from '@/lib/utils/formatters'
import { Receipt, UserPlus, Store, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface Activity {
  id: string
  type: 'transaction' | 'staff' | 'store'
  title: string
  description: string
  timestamp: string
  amount?: number
}

const typeIcons = {
  transaction: Receipt,
  staff: UserPlus,
  store: Store,
}

const typeColors = {
  transaction: 'bg-primary/10 text-primary',
  staff: 'bg-success/10 text-success',
  store: 'bg-warning/10 text-warning',
}

export function ActivityFeed() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchActivities() {
      try {
        // Fetch recent transactions
        const { data: transactions } = await supabase
          .from('transactions')
          .select('id, item_name, total_price, transaction_time, store_id')
          .order('transaction_time', { ascending: false })
          .limit(5)

        // Fetch recent staff
        const { data: staff } = await supabase
          .from('members')
          .select('user_id, first_name, last_name, store_id')
          .order('user_id', { ascending: false })
          .limit(3)

        const activityList: Activity[] = []

        // Add transactions to activity list
        if (transactions) {
          transactions.forEach((t) => {
            activityList.push({
              id: t.id,
              type: 'transaction',
              title: 'New Transaction',
              description: t.item_name || 'Sale recorded',
              timestamp: t.transaction_time,
              amount: t.total_price,
            })
          })
        }

        // Add staff to activity list
        if (staff) {
          staff.forEach((m) => {
            activityList.push({
              id: m.user_id,
              type: 'staff',
              title: 'Staff Enrolled',
              description: `${m.first_name || ''} ${m.last_name || ''}`.trim() || 'New staff',
              timestamp: new Date().toISOString(), // Staff don't have created_at in schema
            })
          })
        }

        // Sort by timestamp
        activityList.sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        )

        setActivities(activityList.slice(0, 8))
      } catch (error) {
        console.error('Failed to fetch activities:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchActivities()
  }, [supabase])

  if (loading) {
    return (
      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg animate-shimmer" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 rounded animate-shimmer" />
                <div className="h-3 w-48 rounded animate-shimmer" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (activities.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Recent Activity</h3>
        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
          <AlertCircle className="h-8 w-8 mb-2" />
          <p>No recent activity</p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">Recent Activity</h3>
      <div className="space-y-4">
        {activities.map((activity) => {
          const Icon = typeIcons[activity.type]
          return (
            <div key={activity.id} className="flex items-start gap-4 animate-fade-in">
              <div className={cn(
                'flex h-10 w-10 items-center justify-center rounded-lg flex-shrink-0',
                typeColors[activity.type]
              )}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium text-foreground truncate">{activity.title}</p>
                  {activity.amount && (
                    <span className="text-sm font-medium text-foreground">
                      {formatCurrency(activity.amount)}
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground truncate">{activity.description}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatRelativeTime(activity.timestamp)}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

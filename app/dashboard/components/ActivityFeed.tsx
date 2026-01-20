'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatRelativeTime } from '@/lib/utils/formatters'
import { 
  ShoppingBag, 
  UserPlus, 
  Store as StoreIcon, 
  AlertCircle,
  CheckCircle2,
  Clock
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface Activity {
  id: string
  type: 'transaction' | 'staff' | 'store' | 'system'
  title: string
  description: string
  timestamp: string
  status: 'success' | 'warning' | 'info' | 'error'
}

export function ActivityFeed() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchActivity() {
      try {
        // Fetch recent transactions
        const { data: transactions } = await supabase
          .from('transactions')
          .select('id, item_name, total_price, transaction_time')
          .order('transaction_time', { ascending: false })
          .limit(5)

        const transactionActivities: Activity[] = (transactions || []).map(t => ({
          id: t.id,
          type: 'transaction',
          title: 'New Transaction',
          description: `Sold ${t.item_name} for ₱${t.total_price}`,
          timestamp: t.transaction_time,
          status: 'success'
        }))

        // Fetch recent staff additions
        const { data: staff } = await supabase
          .from('staff_permissions')
          .select('created_at, users (user_id, first_name, last_name)')
          .order('created_at', { ascending: false })
          .limit(3)

        const staffActivities: Activity[] = (staff || []).map((s: any) => ({
          id: s.users?.user_id,
          type: 'staff',
          title: 'New Staff Member',
          description: `${s.users?.first_name} ${s.users?.last_name} joined the team`,
          timestamp: s.created_at || new Date().toISOString(),
          status: 'info'
        }))

        // Combine and sort
        const combined = [...transactionActivities, ...staffActivities]
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          .slice(0, 8)

        setActivities(combined)
      } catch (error) {
        console.error('Failed to fetch activity:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchActivity()
  }, [supabase])

  const getIcon = (type: Activity['type']) => {
    switch (type) {
      case 'transaction': return ShoppingBag
      case 'staff': return UserPlus
      case 'store': return StoreIcon
      default: return AlertCircle
    }
  }

  const getStatusColor = (status: Activity['status']) => {
    switch (status) {
      case 'success': return 'text-emerald-500 bg-emerald-500/10'
      case 'warning': return 'text-amber-500 bg-amber-500/10'
      case 'error': return 'text-rose-500 bg-rose-500/10'
      default: return 'text-blue-500 bg-blue-500/10'
    }
  }

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="border-b border-border bg-muted/50 px-6 py-4">
        <h2 className="font-semibold text-foreground">Recent Activity</h2>
      </div>
      
      <div className="divide-y divide-border">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-6 py-4 animate-pulse">
              <div className="h-10 w-10 rounded-full bg-muted" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-1/4 rounded bg-muted" />
                <div className="h-3 w-1/2 rounded bg-muted" />
              </div>
            </div>
          ))
        ) : activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Clock className="h-12 w-12 mb-4 opacity-20" />
            <p>No recent activity to show</p>
          </div>
        ) : (
          activities.map((activity) => {
            const Icon = getIcon(activity.type)
            return (
              <div key={activity.id} className="group flex items-start gap-4 px-6 py-4 transition-colors hover:bg-muted/50">
                <div className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-transform group-hover:scale-110",
                  getStatusColor(activity.status)
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
          })
        )}
      </div>
    </div>
  )
}

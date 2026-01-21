'use client'

import { useActivityFeed } from '../../hooks/useActivityFeed'
import { ActivityItem } from './ActivityItem'
import { ActivitySkeleton } from './ActivitySkeleton'
import { ActivityEmpty } from './ActivityEmpty'

export function ActivityFeed() {
  const { activities, loading } = useActivityFeed()

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="border-b border-border bg-muted/50 px-6 py-4">
        <h2 className="font-semibold text-foreground">Recent Activity</h2>
      </div>
      
      <div className="divide-y divide-border">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <ActivitySkeleton key={i} />
          ))
        ) : activities.length === 0 ? (
          <ActivityEmpty />
        ) : (
          activities.map((activity) => (
            <ActivityItem key={activity.id} activity={activity} />
          ))
        )}
      </div>
    </div>
  )
}

export { ActivityItem } from './ActivityItem'
export { ActivitySkeleton } from './ActivitySkeleton'
export { ActivityEmpty } from './ActivityEmpty'
export type { Activity, ActivityType, ActivityStatus } from './activityFeed.types'

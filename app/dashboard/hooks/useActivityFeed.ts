'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Activity } from '../components/ActivityFeed/activityFeed.types'
import {
  fetchRecentPayments,
  fetchRecentStaff,
  mapPaymentsToActivities,
  mapStaffToActivities,
  combineAndSortActivities
} from '../components/ActivityFeed/activityFeed.service'

export function useActivityFeed() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchActivity() {
      try {
        const [payments, staff] = await Promise.all([
          fetchRecentPayments(supabase),
          fetchRecentStaff(supabase)
        ])

        const paymentActivities = mapPaymentsToActivities(payments)
        const staffActivities = mapStaffToActivities(staff)
        const combined = combineAndSortActivities([...paymentActivities, ...staffActivities])

        setActivities(combined)
      } catch (error: any) {
        console.error('Failed to fetch activity:', error?.message || error)
      } finally {
        setLoading(false)
      }
    }

    fetchActivity()
  }, [supabase])

  return { activities, loading }
}

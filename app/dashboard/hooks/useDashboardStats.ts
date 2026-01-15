import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { getDashboardStats } from '../services/dashboardService'

import { useDashboardStore } from '@/app/stores/dashboardStore'

export function useDashboardStats() {
  const supabase = createClient()
  const { dateRange } = useDashboardStore()

  return useQuery({
    queryKey: ['dashboard-stats', dateRange],
    queryFn: () => getDashboardStats(supabase, dateRange.from, dateRange.to),
  })
}

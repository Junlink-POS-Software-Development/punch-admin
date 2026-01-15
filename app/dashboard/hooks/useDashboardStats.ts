import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { getDashboardStats } from '../services/dashboardService'

export function useDashboardStats() {
  const supabase = createClient()

  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => getDashboardStats(supabase),
  })
}

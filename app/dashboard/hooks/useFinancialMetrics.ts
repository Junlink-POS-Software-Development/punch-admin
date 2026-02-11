import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { getFinancialMetrics } from '../services/dashboardService'
import { useDashboardStore } from '../../stores/dashboardStore'

export function useFinancialMetrics() {
  const { selectedBranch, dateRange } = useDashboardStore()
  const supabase = createClient()

  // Use ISO strings directly from the store
  const startDate = dateRange.from
  const endDate = dateRange.to

  // Enable for individual branches or 'all'
  const isEnabled = !!selectedBranch

  return useQuery({
    queryKey: ['financial-metrics', selectedBranch, startDate, endDate],
    queryFn: () => getFinancialMetrics(
      supabase, 
      selectedBranch === 'all' ? null : selectedBranch, 
      startDate, 
      endDate
    ),
    enabled: isEnabled,
  })
}

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { getFinancialMetrics } from '../services/dashboardService'
import { useDashboardStore } from '../../stores/dashboardStore'

export function useFinancialMetrics() {
  const { selectedBranch, dateRange } = useDashboardStore()
  const supabase = createClient()

  // Convert Date objects to ISO strings for the RPC
  const startDate = dateRange.from.toISOString()
  const endDate = dateRange.to.toISOString()

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

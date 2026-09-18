'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { useDashboardStore } from '@/app/stores/dashboardStore'
import { getAvailableCashPosition, type CashPositionData } from '../services/dashboardService'

export function useCashPosition() {
  const { selectedBranch, dateRange, datePreset } = useDashboardStore()
  const supabase = createClient()

  const startDate = dateRange.from
  const endDate = dateRange.to
  const storeId = (!selectedBranch || selectedBranch === 'all') ? null : selectedBranch

  return useQuery<CashPositionData>({
    queryKey: ['available-cash-position', storeId, startDate, endDate, datePreset],
    queryFn: () => getAvailableCashPosition(supabase, storeId, startDate, endDate),
    enabled: !!selectedBranch && !!startDate && !!endDate,
    staleTime: 10_000,
    refetchInterval: 30_000,
  })
}

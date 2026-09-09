import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { useDashboardStore } from '@/app/stores/dashboardStore'
import type { DashboardInventoryItem } from '../types'

export function useDashboardLowStock(limit: number = 20) {
  const { selectedBranch } = useDashboardStore()
  const supabase = createClient()
  const storeId = selectedBranch === 'all' ? null : selectedBranch

  return useQuery<DashboardInventoryItem[]>({
    queryKey: ['dashboard-low-stock', storeId, limit],
    queryFn: async () => {
      let query = supabase
        .from('inventory_monitor_view')
        .select('*')
        .in('stock_status', ['low_stock', 'out_of_stock'])
        .order('current_stock', { ascending: true })
        .limit(limit)

      if (storeId) {
        query = query.eq('store_id', storeId)
      }

      const { data, error } = await query

      if (error) {
        console.error('[useDashboardLowStock] Error fetching low stock items:', error)
        throw error
      }

      return (data as DashboardInventoryItem[]) || []
    },
    staleTime: 10_000,
    refetchInterval: 30_000,
  })
}

export function useDashboardMostStocked(limit: number = 20) {
  const { selectedBranch } = useDashboardStore()
  const supabase = createClient()
  const storeId = selectedBranch === 'all' ? null : selectedBranch

  return useQuery<DashboardInventoryItem[]>({
    queryKey: ['dashboard-most-stocked', storeId, limit],
    queryFn: async () => {
      let query = supabase
        .from('inventory_monitor_view')
        .select('*')
        .gt('current_stock', 0)
        .order('current_stock', { ascending: false })
        .limit(limit)

      if (storeId) {
        query = query.eq('store_id', storeId)
      }

      const { data, error } = await query

      if (error) {
        console.error('[useDashboardMostStocked] Error fetching most stocked items:', error)
        throw error
      }

      return (data as DashboardInventoryItem[]) || []
    },
    staleTime: 10_000,
    refetchInterval: 30_000,
  })
}

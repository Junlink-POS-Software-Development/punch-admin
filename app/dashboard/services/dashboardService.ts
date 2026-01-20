import { SupabaseClient } from '@supabase/supabase-js'

export interface DashboardStats {
  totalRevenue: number
  activeStaff: number
  totalStores: number
  pendingTransactions: number
  revenueTrend: number
  staffTrend: number
}

export async function getDashboardStats(
  supabase: SupabaseClient,
  startDate: Date,
  endDate: Date
): Promise<DashboardStats> {
  // Get total revenue from transactions (within date range)
  const { data: revenueData } = await supabase
    .from('transactions')
    .select('total_price')
    .gte('transaction_time', startDate.toISOString())
    .lte('transaction_time', endDate.toISOString())

  const totalRevenue = revenueData?.reduce((sum, t) => sum + (t.total_price || 0), 0) || 0

  // Get staff count
  const { count: staffCount } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })

  // Get store count
  const { count: storeCount } = await supabase
    .from('stores')
    .select('*', { count: 'exact', head: true })

  // Get transactions count (within date range)
  const { count: periodTransactions } = await supabase
    .from('transactions')
    .select('*', { count: 'exact', head: true })
    .gte('transaction_time', startDate.toISOString())
    .lte('transaction_time', endDate.toISOString())

  return {
    totalRevenue,
    activeStaff: staffCount || 0,
    totalStores: storeCount || 0,
    pendingTransactions: periodTransactions || 0,
    revenueTrend: 12.5, // Mock trend data
    staffTrend: 8.2,
  }
}

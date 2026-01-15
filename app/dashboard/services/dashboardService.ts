import { SupabaseClient } from '@supabase/supabase-js'

export interface DashboardStats {
  totalRevenue: number
  activeStaff: number
  totalStores: number
  pendingTransactions: number
  revenueTrend: number
  staffTrend: number
}

export async function getDashboardStats(supabase: SupabaseClient): Promise<DashboardStats> {
  // Get total revenue from transactions (this month)
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const { data: revenueData } = await supabase
    .from('transactions')
    .select('total_price')
    .gte('transaction_time', startOfMonth.toISOString())

  const totalRevenue = revenueData?.reduce((sum, t) => sum + (t.total_price || 0), 0) || 0

  // Get staff count
  const { count: staffCount } = await supabase
    .from('members')
    .select('*', { count: 'exact', head: true })

  // Get store count
  const { count: storeCount } = await supabase
    .from('stores')
    .select('*', { count: 'exact', head: true })

  // Get pending transactions (today's transactions as a proxy)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const { count: todayTransactions } = await supabase
    .from('transactions')
    .select('*', { count: 'exact', head: true })
    .gte('transaction_time', today.toISOString())

  return {
    totalRevenue,
    activeStaff: staffCount || 0,
    totalStores: storeCount || 0,
    pendingTransactions: todayTransactions || 0,
    revenueTrend: 12.5, // Mock trend data
    staffTrend: 8.2,
  }
}

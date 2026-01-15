import { SupabaseClient } from '@supabase/supabase-js'
import type { Payment, Store } from '@/lib/types/database'

export interface PaymentWithStore extends Payment {
  stores?: { store_name: string } | null
}

export async function getPayments(
  supabase: SupabaseClient,
  dateRange: string,
  storeId?: string
): Promise<PaymentWithStore[]> {
  let query = supabase
    .from('payments')
    .select(`
      *,
      stores (store_name)
    `)
    .order('transaction_time', { ascending: false })
    .limit(100)

  if (storeId) {
    query = query.eq('store_id', storeId)
  }

  if (dateRange !== 'all') {
    const now = new Date()
    const startDate = new Date()
    
    switch (dateRange) {
      case 'today':
        startDate.setHours(0, 0, 0, 0)
        break
      case 'week':
        startDate.setDate(now.getDate() - 7)
        break
      case 'month':
        startDate.setMonth(now.getMonth() - 1)
        break
    }
    
    query = query.gte('transaction_time', startDate.toISOString())
  }

  const { data, error } = await query
  if (error) throw error
  return data || []
}

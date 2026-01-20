import { SupabaseClient } from '@supabase/supabase-js'
import type { Transaction, Store, Payment } from '@/lib/types/database'

export interface TransactionWithStore extends Transaction {
  stores?: { store_name: string } | null
  payments?: Payment | null
}

export async function getTransactions(
  supabase: SupabaseClient,
  dateRange: string,
  storeId?: string
): Promise<TransactionWithStore[]> {
  let query = supabase
    .from('transactions')
    .select(`
      *,
      stores (store_name),
      payments (*)
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

export async function getStores(supabase: SupabaseClient): Promise<Store[]> {
  const { data, error } = await supabase
    .from('stores')
    .select('*')
    .order('store_name')

  if (error) throw error
  return data || []
}

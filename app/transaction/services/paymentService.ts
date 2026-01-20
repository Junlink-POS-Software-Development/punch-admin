import { SupabaseClient } from '@supabase/supabase-js'
import type { Payment, Store } from '@/lib/types/database'

export interface PaymentWithStore extends Payment {
  stores?: { store_name: string } | null
}

export async function getPayments(
  supabase: SupabaseClient,
  dateRange: string,
  storeId?: string,
  page: number = 0,
  limit: number = 20
): Promise<{ data: PaymentWithStore[]; nextCursor: number | null }> {
  let query = supabase
    .from('payments')
    .select(`
      *,
      stores (store_name)
    `)
    .order('transaction_time', { ascending: false })
    .range(page * limit, (page + 1) * limit - 1)

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

  const hasMore = (data || []).length === limit
  const nextCursor = hasMore ? page + 1 : null

  return { data: data || [], nextCursor }
}

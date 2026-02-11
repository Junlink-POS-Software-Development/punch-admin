import { SupabaseClient } from '@supabase/supabase-js'
import type { FinancialMetrics } from '../types'

/**
 * Fetch financial metrics using the get_financial_metrics RPC
 */
export async function getFinancialMetrics(
  supabase: SupabaseClient,
  storeId: string | null,
  startDate: string,
  endDate: string
): Promise<FinancialMetrics | null> {
  const { data, error } = await supabase.rpc('get_financial_metrics', {
    store_id_param: storeId,
    start_date: startDate,
    end_date: endDate,
  })

  if (error) {
    console.error('Error fetching financial metrics:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code
    })
    return null
  }

  return data as FinancialMetrics
}

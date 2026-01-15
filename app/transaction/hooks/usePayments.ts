import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { getPayments } from '../services/paymentService'

export function usePayments(dateRange: string, storeId?: string) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['payments', dateRange, storeId],
    queryFn: () => getPayments(supabase, dateRange, storeId),
  })
}

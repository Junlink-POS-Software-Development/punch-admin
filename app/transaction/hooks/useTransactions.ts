import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { getTransactions } from '../services/transactionService'

export function useTransactions(dateRange: string, storeId?: string) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['transactions', dateRange, storeId],
    queryFn: () => getTransactions(supabase, dateRange, storeId),
  })
}

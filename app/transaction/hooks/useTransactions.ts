import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { getTransactions } from '../services/transactionService'

export function useTransactions(dateRange: string) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['transactions', dateRange],
    queryFn: () => getTransactions(supabase, dateRange),
  })
}

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { getStores } from '../services/transactionService'

export function useTransactionStores() {
  const supabase = createClient()

  return useQuery({
    queryKey: ['transaction-stores'],
    queryFn: () => getStores(supabase),
  })
}

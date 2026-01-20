import { useInfiniteQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { getTransactions } from '../services/transactionService'

export function useTransactions(dateRange: string, storeId?: string) {
  const supabase = createClient()

  return useInfiniteQuery({
    queryKey: ['transactions', dateRange, storeId],
    queryFn: ({ pageParam = 0 }) => getTransactions(supabase, dateRange, storeId, pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  })
}

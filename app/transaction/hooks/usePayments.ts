import { useInfiniteQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { getPayments } from '../services/paymentService'

export function usePayments(dateRange: string, storeId?: string) {
  const supabase = createClient()

  return useInfiniteQuery({
    queryKey: ['payments', dateRange, storeId],
    queryFn: ({ pageParam = 0 }) => getPayments(supabase, dateRange, storeId, pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  })
}

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { getStoreStats } from '../services/storeService'

export function useStoreStats(storeId: string) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['store-stats', storeId],
    queryFn: () => getStoreStats(supabase, storeId),
    enabled: !!storeId,
  })
}

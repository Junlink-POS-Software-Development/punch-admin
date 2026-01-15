import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { getStoreById } from '../services/storeService'

export function useStore(storeId: string) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['store', storeId],
    queryFn: () => getStoreById(supabase, storeId),
    enabled: !!storeId,
  })
}

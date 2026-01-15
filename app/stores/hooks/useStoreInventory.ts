import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { getStoreInventory } from '../services/storeService'

export function useStoreInventory(storeId: string) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['store-inventory', storeId],
    queryFn: () => getStoreInventory(supabase, storeId),
    enabled: !!storeId,
  })
}

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { getStoresWithStaffCount } from '../services/storeService'

export function useStores() {
  const supabase = createClient()

  return useQuery({
    queryKey: ['stores'],
    queryFn: () => getStoresWithStaffCount(supabase),
  })
}

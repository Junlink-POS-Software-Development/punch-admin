import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { getStores } from '../services/staffService'

export function useStaffStores() {
  const supabase = createClient()

  return useQuery({
    queryKey: ['staff-stores'],
    queryFn: () => getStores(supabase),
  })
}

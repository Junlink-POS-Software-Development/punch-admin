import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { getStaff } from '../services/staffService'

export function useStaff() {
  const supabase = createClient()

  return useQuery({
    queryKey: ['staff'],
    queryFn: () => getStaff(supabase),
  })
}

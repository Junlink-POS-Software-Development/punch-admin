import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { createStore, uploadStoreImage } from '../services/storeService'
import type { StoreAddress } from '@/lib/types/database'

interface CreateStoreData {
  store_name: string
  address: StoreAddress
  enrollment_id?: string
  image?: File | null
}

export function useCreateStore() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async (data: CreateStoreData) => {
      let store_img: string | undefined = undefined
      if (data.image) {
        store_img = await uploadStoreImage(supabase, data.image)
      }

      return createStore(supabase, {
        store_name: data.store_name,
        address: data.address,
        enrollment_id: data.enrollment_id,
        store_img,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stores'] })
    },
  })
}

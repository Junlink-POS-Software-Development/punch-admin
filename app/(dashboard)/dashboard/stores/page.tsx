'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { StoreCard } from '@/components/stores/StoreCard'
import { CreateStoreCard } from '@/components/stores/CreateStoreCard'
import { Store, Search } from 'lucide-react'
import type { StoreWithStaffCount } from '@/lib/types/database'

export default function StoresPage() {
  const [stores, setStores] = useState<StoreWithStaffCount[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const supabase = createClient()

  useEffect(() => {
    async function fetchStores() {
      try {
        // Fetch stores
        const { data: storesData, error } = await supabase
          .from('stores')
          .select('*')
          .order('store_name')

        if (error) throw error

        // Get staff counts for each store
        const storesWithCounts: StoreWithStaffCount[] = await Promise.all(
          (storesData || []).map(async (store) => {
            const { count } = await supabase
              .from('members')
              .select('*', { count: 'exact', head: true })
              .eq('store_id', store.store_id)

            return {
              ...store,
              staff_count: count || 0,
            }
          })
        )

        setStores(storesWithCounts)
      } catch (error) {
        console.error('Failed to fetch stores:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStores()
  }, [supabase])

  const filteredStores = stores.filter((store) =>
    store.store_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    store.enrollment_id?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Stores</h1>
          <p className="text-muted-foreground">
            Manage your store network and performance
          </p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search stores..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-input bg-background py-2 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      {/* Store Grid */}
      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="h-40 animate-shimmer" />
              <div className="p-4 space-y-3">
                <div className="h-5 w-32 rounded animate-shimmer" />
                <div className="h-4 w-full rounded animate-shimmer" />
                <div className="h-6 w-24 rounded animate-shimmer" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredStores.length === 0 && searchQuery ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <Store className="h-12 w-12 mb-4" />
          <p className="text-lg font-medium">No stores found</p>
          <p className="text-sm">Try adjusting your search</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <CreateStoreCard />
          {filteredStores.map((store) => (
            <StoreCard key={store.store_id} store={store} />
          ))}
        </div>
      )}
    </div>
  )
}

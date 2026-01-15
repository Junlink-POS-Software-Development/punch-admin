import { SupabaseClient } from '@supabase/supabase-js'
import type { StoreWithStaffCount, StoreAddress } from '@/lib/types/database'

// Define the shape of the Store return data
// This helps TypeScript understand what 'data' contains after an insert
export interface Store {
  store_id: string;
  store_name: string;
  store_address: StoreAddress;
  user_id: string;
  enrollment_id?: string | null;
  store_img?: string | null;
  created_at?: string;
}

export interface InventoryItem {
  item_id: string;
  item_name: string;
  sku: string;
  category: string | null;
  cost_price: number;
  low_stock_threshold: number | null;
  quantity_in: number;
  quantity_manual_out: number;
  quantity_sold: number;
  current_stock: number;
  stock_status: 'out_of_stock' | 'low_stock' | 'in_stock';
  store_id: string;
}

/**
 * Fetch all stores the user has access to (via RLS) and include the member count.
 */
export async function getStoresWithStaffCount(supabase: SupabaseClient): Promise<StoreWithStaffCount[]> {
  // 1. Fetch stores
  // We rely on RLS policies to filter stores automatically.
  const { data: storesData, error } = await supabase
    .from('stores')
    .select('*')
    .order('store_name', { ascending: true })

  if (error) {
    console.error('Error fetching stores:', error)
    throw error
  }

  if (!storesData || storesData.length === 0) {
    return []
  }

  // 2. Get staff counts for each store
  // We use Promise.all to fetch counts in parallel for performance
  const storesWithCounts: StoreWithStaffCount[] = await Promise.all(
    storesData.map(async (store) => {
      const { count, error: countError } = await supabase
        .from('members')
        .select('*', { count: 'exact', head: true }) // 'head: true' fetches only the count
        .eq('store_id', store.store_id)

      if (countError) {
        console.warn(`Could not fetch staff count for store ${store.store_id}`, countError)
      }

      return {
        ...store,
        staff_count: count || 0,
      } as StoreWithStaffCount
    })
  )

  return storesWithCounts
}

/**
 * Create a new store.
 * Requires the user to be authenticated and present in the 'admin' table.
 */
export async function createStore(
  supabase: SupabaseClient, 
  storeData: { 
    store_name: string; 
    address: StoreAddress;
    enrollment_id?: string;
    store_img?: string;
  }
): Promise<Store> {
  // 1. Verify Authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) throw new Error('Not authenticated')

  // 2. Authorization Check
  // Ensures the user exists in the 'admin' table before allowing creation.
  const { data: adminData, error: adminError } = await supabase
    .from('admin')
    .select('user_id')
    .eq('user_id', user.id)
    .single()

  if (adminError || !adminData) {
    throw new Error('Unauthorized: You do not have permission to create a store.')
  }

  // 3. Prepare Insert Payload
  // Explicitly map fields and handle optional undefined values by converting to null
  const insertPayload = {
    store_name: storeData.store_name,
    store_address: storeData.address,
    user_id: user.id, // Use the authenticated user's ID directly
    enrollment_id: storeData.enrollment_id || null,
    store_img: storeData.store_img || null
  }

  // 4. Insert and Return
  const { data, error } = await supabase
    .from('stores')
    .insert(insertPayload)
    .select()
    .single()

  if (error) {
    console.error('Error creating store:', error)
    throw error
  }

  // 5. Add creator as a member (Owner)
  const { error: memberError } = await supabase
    .from('members')
    .insert({
      user_id: user.id,
      store_id: data.store_id,
      email: user.email,
      job_title: 'Owner',
    })

  if (memberError) {
    console.error('Error adding creator to members:', memberError)
  }

  return data as Store
}

/**
 * Upload a store image to Supabase Storage and return the public URL.
 */
export async function uploadStoreImage(supabase: SupabaseClient, file: File): Promise<string> {
  const fileExt = file.name.split('.').pop()
  const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
  const filePath = `store-images/${fileName}`

  // 1. Upload the file
  const { error: uploadError } = await supabase.storage
    .from('store-images')
    .upload(filePath, file)

  if (uploadError) throw uploadError

  // 2. Get the public URL
  const { data: { publicUrl } } = supabase.storage
    .from('store-images')
    .getPublicUrl(filePath)

  return publicUrl
}


// Add this interface
export interface StoreDashboardStats {
  cash_on_hand: number
  daily_gross_income: number
  daily_expenses: number
  monthly_gross_income: number
}

/**
 * Fetch a single store by ID
 */
export async function getStoreById(supabase: SupabaseClient, storeId: string): Promise<Store | null> {
  const { data, error } = await supabase
    .from('stores')
    .select('*')
    .eq('store_id', storeId)
    .single()

  if (error) {
    console.error('Error fetching store:', error)
    return null
  }
  return data
}

/**
 * Fetch dashboard statistics using the Database RPC
 */

export async function getStoreStats(supabase: SupabaseClient, storeId: string): Promise<StoreDashboardStats> {
  // CHANGED: calling 'get_dashboard_stats_via_view' instead of 'get_store_dashboard_stats'
  const { data, error } = await supabase
    .rpc('get_dashboard_stats_via_view', { target_store_id: storeId })

  if (error) {
    console.error('Error fetching store stats:', error)
    return {
      cash_on_hand: 0,
      daily_gross_income: 0,
      daily_expenses: 0,
      monthly_gross_income: 0
    }
  }

  return data as StoreDashboardStats
}

/**
 * Fetch store inventory from the inventory_monitor_view
 */
export async function getStoreInventory(supabase: SupabaseClient, storeId: string): Promise<InventoryItem[]> {
  const { data, error } = await supabase
    .from('inventory_monitor_view')
    .select('*')
    .eq('store_id', storeId)
    .order('item_name', { ascending: true })
    .limit(100)

  if (error) {
    console.error('Error fetching store inventory:', error)
    return []
  }

  return data as InventoryItem[]
}

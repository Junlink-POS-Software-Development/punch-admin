import { SupabaseClient } from '@supabase/supabase-js'
import type { Activity, PaymentForActivity } from './activityFeed.types'

export async function fetchRecentPayments(
  supabase: SupabaseClient
): Promise<PaymentForActivity[]> {
  const { data, error } = await supabase
    .from('payments')
    .select('invoice_no, customer_name, grand_total, transaction_time, stores (store_name)')
    .order('transaction_time', { ascending: false })
    .limit(5)

  if (error) throw error
  return (data || []) as unknown as PaymentForActivity[]
}

export async function fetchRecentStaff(
  supabase: SupabaseClient
): Promise<{ user_id: string; first_name: string | null; last_name: string | null; created_at: string }[]> {
  const { data, error } = await supabase
    .from('staff_permissions')
    .select('created_at, users (user_id, first_name, last_name)')
    .order('created_at', { ascending: false })
    .limit(3)

  if (error) throw error
  
  return (data || []).map((s: any) => ({
    user_id: s.users?.user_id,
    first_name: s.users?.first_name,
    last_name: s.users?.last_name,
    created_at: s.created_at || new Date().toISOString()
  }))
}

export function mapPaymentsToActivities(payments: PaymentForActivity[]): Activity[] {
  return payments.map((p) => ({
    id: p.invoice_no,
    type: 'payment',
    title: 'New Payment',
    description: `${p.customer_name || 'Guest'} paid ₱${p.grand_total?.toLocaleString() || 0}`,
    timestamp: p.transaction_time,
    status: 'success'
  }))
}

export function mapStaffToActivities(
  staff: { user_id: string; first_name: string | null; last_name: string | null; created_at: string }[]
): Activity[] {
  return staff.map((s) => ({
    id: s.user_id,
    type: 'staff',
    title: 'New Staff Member',
    description: `${s.first_name} ${s.last_name} joined the team`,
    timestamp: s.created_at,
    status: 'info'
  }))
}

export function combineAndSortActivities(activities: Activity[], limit: number = 8): Activity[] {
  return activities
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, limit)
}

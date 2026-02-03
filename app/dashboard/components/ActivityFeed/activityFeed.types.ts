import type { Payment } from '@/lib/types/database'

export type ActivityType = 'payment' | 'staff' | 'store' | 'system'
export type ActivityStatus = 'success' | 'warning' | 'info' | 'error'

export interface Activity {
  id: string
  type: ActivityType
  title: string
  description: string
  timestamp: string
  status: ActivityStatus
}

export interface PaymentForActivity extends Pick<Payment, 'invoice_no' | 'customer_name' | 'amount_paid' | 'transaction_time'> {
  stores?: { store_name: string } | null
}

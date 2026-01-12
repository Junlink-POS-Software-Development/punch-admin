// Database types based on existing Supabase schema

export interface User {
  user_id: string
  first_name: string | null
  last_name: string | null
  role: string
  email: string | null
  store_id: string | null
}

export interface Admin {
  user_id: string
  first_name: string | null
  last_name: string | null
  business_name: string | null
  job_title: string | null
  avatar: string | null
  email: string | null
}

export interface Staff {
  user_id: string
  first_name: string | null
  last_name: string | null
  job_title: string | null
  email: string | null
  avatar: string | null
  store_id: string
}

export interface StoreAddress {
  street?: string
  city?: string
  state?: string
  postal_code?: string
  country?: string
}

export interface Store {
  store_id: string
  store_name: string | null
  store_address: StoreAddress | null
  store_img: string | null
  user_id: string
  enrollment_id: string
}

export interface StoreWithStaffCount extends Store {
  staff_count: number
}

export interface StoreSubscription {
  id: string
  store_id: string
  status: string
  payer_user_id: string | null
  created_at: string | null
  updated_at: string | null
  amount_paid: number | null
  xendit_invoice_id: string | null
  start_date: string | null
  end_date: string | null
}

export interface Transaction {
  id: string
  sku: string | null
  item_name: string | null
  cost_price: number
  total_price: number
  discount: number | null
  cashier: string | null
  store_id: string | null
  quantity: number | null
  invoice_no: string | null
  transaction_time: string
  category_id: string | null
}

export interface Payment {
  invoice_no: string
  customer_name: string | null
  amount_rendered: number | null
  voucher: number | null
  grand_total: number | null
  change: number | null
  transaction_no: string | null
  transaction_time: string
  cashier_id: string | null
  store_id: string | null
}

export interface Item {
  id: string
  created_at: string
  item_name: string
  sku: string
  cost_price: number | null
  description: string | null
  store_id: string | null
  user_id: string | null
  low_stock_threshold: number | null
  category_id: string | null
}

export interface ProductCategory {
  id: string
  category: string
  store_id: string
  created_at: string | null
  is_default_voucher_source: boolean
}

export interface Expense {
  id: string
  created_at: string
  transaction_date: string
  classification: string | null
  amount: number
  receipt_no: string | null
  notes: string | null
  user_id: string
  store_id: string
  source: string | null
  category_id: string | null
}

export interface StockFlow {
  id: string
  item_name: string
  flow: string
  quantity: number
  capital_price: number
  notes: string | null
  time_stamp: string | null
  user_id: string | null
  store_id: string | null
  item_id: string | null
}

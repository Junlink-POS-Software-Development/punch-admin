'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Search, Receipt, Calendar, Filter } from 'lucide-react'
import { formatCurrency, formatDateTime } from '@/lib/utils/formatters'
import { cn } from '@/lib/utils/cn'
import Link from 'next/link'
import type { Transaction, Store } from '@/lib/types/database'

interface TransactionWithStore extends Transaction {
  stores?: { store_name: string } | null
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<TransactionWithStore[]>([])
  const [stores, setStores] = useState<Store[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStore, setSelectedStore] = useState<string>('')
  const [dateRange, setDateRange] = useState<string>('all')
  const supabase = createClient()

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch stores for filter
        const { data: storesData } = await supabase
          .from('stores')
          .select('*')
          .order('store_name')

        setStores(storesData || [])

        // Build query
        let query = supabase
          .from('transactions')
          .select(`
            *,
            stores (store_name)
          `)
          .order('transaction_time', { ascending: false })
          .limit(100)

        // Apply date filter
        if (dateRange !== 'all') {
          const now = new Date()
          let startDate = new Date()
          
          switch (dateRange) {
            case 'today':
              startDate.setHours(0, 0, 0, 0)
              break
            case 'week':
              startDate.setDate(now.getDate() - 7)
              break
            case 'month':
              startDate.setMonth(now.getMonth() - 1)
              break
          }
          
          query = query.gte('transaction_time', startDate.toISOString())
        }

        const { data, error } = await query

        if (error) throw error
        setTransactions(data || [])
      } catch (error) {
        console.error('Failed to fetch transactions:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [supabase, dateRange])

  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch = 
      tx.item_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.invoice_no?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.sku?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStore = !selectedStore || tx.store_id === selectedStore

    return matchesSearch && matchesStore
  })

  const totalAmount = filteredTransactions.reduce((sum, tx) => sum + (tx.total_price || 0), 0)

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Transactions</h1>
          <p className="text-muted-foreground">
            View and manage all transaction records
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/5 border border-primary/10">
          <span className="text-sm text-muted-foreground">Total:</span>
          <span className="text-lg font-bold text-primary">{formatCurrency(totalAmount)}</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by item, invoice, or SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-input bg-background py-2 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <select
          value={selectedStore}
          onChange={(e) => setSelectedStore(e.target.value)}
          className="rounded-lg border border-input bg-background px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">All Stores</option>
          {stores.map((store) => (
            <option key={store.store_id} value={store.store_id}>
              {store.store_name}
            </option>
          ))}
        </select>
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="rounded-lg border border-input bg-background px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="all">All Time</option>
          <option value="today">Today</option>
          <option value="week">Last 7 Days</option>
          <option value="month">Last 30 Days</option>
        </select>
      </div>

      {/* Transactions Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Item
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Store
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Invoice
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Qty
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                [...Array(8)].map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4"><div className="h-4 w-32 rounded animate-shimmer" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-40 rounded animate-shimmer" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-24 rounded animate-shimmer" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-20 rounded animate-shimmer" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-8 rounded animate-shimmer ml-auto" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-20 rounded animate-shimmer ml-auto" /></td>
                  </tr>
                ))
              ) : filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <Receipt className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-lg font-medium text-foreground">No transactions found</p>
                    <p className="text-sm text-muted-foreground">Try adjusting your search or filters</p>
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4 text-sm text-muted-foreground whitespace-nowrap">
                      {formatDateTime(tx.transaction_time)}
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-foreground truncate max-w-[200px]">
                          {tx.item_name || 'Unknown Item'}
                        </p>
                        {tx.sku && <p className="text-xs text-muted-foreground font-mono">{tx.sku}</p>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                        {tx.stores?.store_name || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground font-mono">
                      {tx.invoice_no || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground text-right">
                      {tx.quantity || 1}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-foreground text-right">
                      {formatCurrency(tx.total_price)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

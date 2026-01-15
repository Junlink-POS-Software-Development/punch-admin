'use client'

import { useState } from 'react'
import { Search, Receipt, LayoutList } from 'lucide-react'
import { useTransactionStores } from './hooks/useTransactionStores'
import TransactionsView from './components/TransactionsView'
import PaymentsView from './components/PaymentsView'
import { cn } from '@/lib/utils/cn'

type ViewMode = 'transactions' | 'payments'

export default function TransactionsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStore, setSelectedStore] = useState<string>('')
  const [dateRange, setDateRange] = useState<string>('all')
  const [viewMode, setViewMode] = useState<ViewMode>('transactions')

  const { data: stores = [] } = useTransactionStores()

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {viewMode === 'transactions' ? 'Transactions' : 'Payments History'}
          </h1>
          <p className="text-muted-foreground">
            {viewMode === 'transactions' 
              ? 'View and manage all transaction records' 
              : 'View and manage payment invoices'}
          </p>
        </div>
        
        {/* View Switcher */}
        <div className="flex p-1 bg-muted rounded-lg border border-border">
          <button
            onClick={() => setViewMode('transactions')}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-all",
              viewMode === 'transactions' 
                ? "bg-background text-foreground shadow-sm" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <LayoutList className="w-4 h-4" />
            Transactions
          </button>
          <button
            onClick={() => setViewMode('payments')}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-all",
              viewMode === 'payments' 
                ? "bg-background text-foreground shadow-sm" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Receipt className="w-4 h-4" />
            Payments
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder={viewMode === 'transactions' ? "Search by item, invoice, or SKU..." : "Search by invoice or customer..."}
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

      {/* Content View */}
      {viewMode === 'transactions' ? (
        <TransactionsView 
          searchQuery={searchQuery}
          selectedStore={selectedStore}
          dateRange={dateRange}
        />
      ) : (
        <PaymentsView 
          searchQuery={searchQuery}
          selectedStore={selectedStore}
          dateRange={dateRange}
        />
      )}
    </div>
  )
}

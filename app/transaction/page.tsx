'use client'

import { useState, useMemo } from 'react'
import { Search, Receipt, ArrowUpDown } from 'lucide-react'
import { formatCurrency, formatDateTime } from '@/lib/utils/formatters'
import { cn } from '@/lib/utils/cn'

import type { Transaction, Store } from '@/lib/types/database'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  createColumnHelper,
  SortingState,
} from '@tanstack/react-table'


const columnHelper = createColumnHelper<TransactionWithStore>()

import { useTransactions } from './hooks/useTransactions'
import { useTransactionStores } from './hooks/useTransactionStores'
import type { TransactionWithStore } from './services/transactionService'

export default function TransactionsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStore, setSelectedStore] = useState<string>('')
  const [dateRange, setDateRange] = useState<string>('all')
  const [sorting, setSorting] = useState<SortingState>([])

  const { data: transactions = [], isLoading: transactionsLoading } = useTransactions(dateRange)
  const { data: stores = [], isLoading: storesLoading } = useTransactionStores()

  const loading = transactionsLoading || storesLoading

  const columns = useMemo(
    () => [
      columnHelper.accessor('transaction_time', {
        header: ({ column }) => (
          <div
            className="flex items-center gap-2 cursor-pointer hover:text-foreground transition-colors"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Date & Time <ArrowUpDown className="w-3 h-3" />
          </div>
        ),
        cell: (info) => (
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            {formatDateTime(info.getValue())}
          </span>
        ),
      }),
      columnHelper.accessor('item_name', {
        header: ({ column }) => (
          <div
            className="flex items-center gap-2 cursor-pointer hover:text-foreground transition-colors"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Item <ArrowUpDown className="w-3 h-3" />
          </div>
        ),
        cell: (info) => {
          const tx = info.row.original
          return (
            <div>
              <p className="font-medium text-foreground truncate max-w-[200px]">
                {info.getValue() || 'Unknown Item'}
              </p>
              {tx.sku && <p className="text-xs text-muted-foreground font-mono">{tx.sku}</p>}
            </div>
          )
        },
      }),
      columnHelper.accessor((row) => row.stores?.store_name, {
        id: 'store_name',
        header: 'Store',
        cell: (info) => (
          <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
            {info.getValue() || 'Unknown'}
          </span>
        ),
      }),
      columnHelper.accessor('invoice_no', {
        header: 'Invoice',
        cell: (info) => (
          <span className="text-sm text-muted-foreground font-mono">
            {info.getValue() || '-'}
          </span>
        ),
      }),
      columnHelper.accessor('quantity', {
        header: () => <div className="text-right">Qty</div>,
        cell: (info) => (
          <div className="text-sm text-foreground text-right">
            {info.getValue() || 1}
          </div>
        ),
      }),
      columnHelper.accessor('total_price', {
        header: ({ column }) => (
          <div
            className="flex items-center justify-end gap-2 cursor-pointer hover:text-foreground transition-colors"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Amount <ArrowUpDown className="w-3 h-3" />
          </div>
        ),
        cell: (info) => (
          <div className="text-sm font-medium text-foreground text-right">
            {formatCurrency(info.getValue())}
          </div>
        ),
      }),
    ],
    []
  )

  const filteredData = useMemo(() => {
    return transactions.filter((tx) => {
      const matchesStore = !selectedStore || tx.store_id === selectedStore
      return matchesStore
    })
  }, [transactions, selectedStore])

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      sorting,
      globalFilter: searchQuery,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setSearchQuery,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: (row, columnId, filterValue) => {
      const tx = row.original
      const search = filterValue.toLowerCase()
      return !!(
        tx.item_name?.toLowerCase().includes(search) ||
        tx.invoice_no?.toLowerCase().includes(search) ||
        tx.sku?.toLowerCase().includes(search)
      )
    },
  })

  const totalAmount = table.getFilteredRowModel().rows.reduce((sum, row) => sum + (row.original.total_price || 0), 0)

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
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b border-border bg-muted/50">
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
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
              ) : table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-12 text-center">
                    <Receipt className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-lg font-medium text-foreground">No transactions found</p>
                    <p className="text-sm text-muted-foreground">Try adjusting your search or filters</p>
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="hover:bg-muted/50 transition-colors">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-6 py-4">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
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

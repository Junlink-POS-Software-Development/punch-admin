'use client'

import { useMemo, useState } from 'react'
import { ArrowUpDown, Receipt } from 'lucide-react'
import { formatCurrency, formatDateTime } from '@/lib/utils/formatters'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  createColumnHelper,
  SortingState,
} from '@tanstack/react-table'
import { useTransactions } from '../hooks/useTransactions'
import type { TransactionWithStore } from '../services/transactionService'

const columnHelper = createColumnHelper<TransactionWithStore>()

interface TransactionsViewProps {
  searchQuery: string
  selectedStore: string
  dateRange: string
}

export default function TransactionsView({ searchQuery, selectedStore, dateRange }: TransactionsViewProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const { data: transactions = [], isLoading } = useTransactions(dateRange)

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
      columnHelper.accessor((row) => row.payments?.customer_name, {
        id: 'customer_name',
        header: 'Customer',
        cell: (info) => (
          <span className="text-sm text-muted-foreground">
            {info.getValue() || '-'}
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

  return (
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
            {isLoading ? (
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
  )
}

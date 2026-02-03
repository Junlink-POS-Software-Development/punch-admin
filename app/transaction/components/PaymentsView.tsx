'use client'
import { useMemo, useState, useEffect } from 'react'
import { useInView } from 'react-intersection-observer'
import { Loader2 } from 'lucide-react'
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
import { usePayments } from '../hooks/usePayments'
import type { PaymentWithStore } from '../services/paymentService'

const columnHelper = createColumnHelper<PaymentWithStore>()

interface PaymentsViewProps {
  searchQuery: string
  selectedStore: string
  dateRange: string
}

export default function PaymentsView({ searchQuery, selectedStore, dateRange }: PaymentsViewProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const { ref, inView } = useInView()

  const { 
    data, 
    isLoading, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage 
  } = usePayments(dateRange, selectedStore)

  const payments = useMemo(() => {
    return data?.pages.flatMap((page) => page.data) || []
  }, [data])

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage()
    }
  }, [inView, hasNextPage, fetchNextPage])

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
      columnHelper.accessor('invoice_no', {
        header: ({ column }) => (
          <div
            className="flex items-center gap-2 cursor-pointer hover:text-foreground transition-colors"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Invoice No <ArrowUpDown className="w-3 h-3" />
          </div>
        ),
        cell: (info) => (
          <span className="text-sm font-mono text-foreground">
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor('customer_name', {
        header: 'Customer',
        cell: (info) => (
          <span className="text-sm text-foreground">
            {info.getValue() || 'Guest'}
          </span>
        ),
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
      columnHelper.accessor('amount_paid', {
        header: ({ column }) => (
          <div
            className="flex items-center justify-end gap-2 cursor-pointer hover:text-foreground transition-colors"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Total Amount <ArrowUpDown className="w-3 h-3" />
          </div>
        ),
        cell: (info) => (
          <div className="text-sm font-medium text-foreground text-right">
            {formatCurrency(info.getValue() || 0)}
          </div>
        ),
      }),
    ],
    []
  )

  const filteredData = useMemo(() => {
    return payments.filter((payment) => {
      // Client-side filtering for search query if needed, 
      // but store filtering is now handled by the API
      return true 
    })
  }, [payments])

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
      const payment = row.original
      const search = filterValue.toLowerCase()
      return !!(
        payment.invoice_no?.toLowerCase().includes(search) ||
        payment.customer_name?.toLowerCase().includes(search)
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
                  <td className="px-6 py-4"><div className="h-4 w-24 rounded animate-shimmer" /></td>
                  <td className="px-6 py-4"><div className="h-4 w-32 rounded animate-shimmer" /></td>
                  <td className="px-6 py-4"><div className="h-4 w-24 rounded animate-shimmer" /></td>
                  <td className="px-6 py-4"><div className="h-4 w-20 rounded animate-shimmer ml-auto" /></td>
                </tr>
              ))
            ) : table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center">
                  <Receipt className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-lg font-medium text-foreground">No payments found</p>
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
      {(isFetchingNextPage || (isLoading && payments.length > 0)) && (
        <div className="py-4 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}
      <div ref={ref} className="h-4" />
    </div>
  )
}

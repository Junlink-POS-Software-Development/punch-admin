'use client'

import { useState, useMemo } from 'react'
import { Search, Filter, Shield, User, Settings, Database, ArrowUpDown } from 'lucide-react'
import { formatDateTime } from '@/lib/utils/formatters'
import { cn } from '@/lib/utils/cn'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  createColumnHelper,
  SortingState,
} from '@tanstack/react-table'

// Mock audit log data
const mockLogs = [
  { id: '1', action: 'User Login', user: 'john@junlink.com', type: 'auth', timestamp: new Date().toISOString(), ip: '192.168.1.1' },
  { id: '2', action: 'Store Created', user: 'sarah@junlink.com', type: 'store', timestamp: new Date(Date.now() - 3600000).toISOString(), ip: '192.168.1.2' },
  { id: '3', action: 'Staff Added', user: 'john@junlink.com', type: 'staff', timestamp: new Date(Date.now() - 7200000).toISOString(), ip: '192.168.1.1' },
  { id: '4', action: 'Settings Updated', user: 'john@junlink.com', type: 'settings', timestamp: new Date(Date.now() - 10800000).toISOString(), ip: '192.168.1.1' },
  { id: '5', action: 'Transaction Deleted', user: 'sarah@junlink.com', type: 'transaction', timestamp: new Date(Date.now() - 14400000).toISOString(), ip: '192.168.1.2' },
  { id: '6', action: 'User Password Reset', user: 'mike@junlink.com', type: 'auth', timestamp: new Date(Date.now() - 18000000).toISOString(), ip: '192.168.1.3' },
]

const typeIcons: Record<string, typeof Shield> = {
  auth: Shield,
  store: Database,
  staff: User,
  settings: Settings,
  transaction: Database,
}

const typeColors: Record<string, string> = {
  auth: 'bg-primary/10 text-primary',
  store: 'bg-success/10 text-success',
  staff: 'bg-warning/10 text-warning',
  settings: 'bg-muted text-muted-foreground',
  transaction: 'bg-destructive/10 text-destructive',
}

interface AuditLog {
  id: string
  action: string
  user: string
  type: string
  timestamp: string
  ip: string
}

const columnHelper = createColumnHelper<AuditLog>()

export default function AuditLogsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState<string>('')
  const [sorting, setSorting] = useState<SortingState>([])

  const columns = useMemo(
    () => [
      columnHelper.accessor('action', {
        header: ({ column }) => (
          <div
            className="flex items-center gap-2 cursor-pointer hover:text-foreground transition-colors"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Action <ArrowUpDown className="w-3 h-3" />
          </div>
        ),
        cell: (info) => {
          const log = info.row.original
          const Icon = typeIcons[log.type] || Shield
          return (
            <div className="flex items-center gap-3">
              <div className={cn(
                'flex h-8 w-8 items-center justify-center rounded-lg',
                typeColors[log.type]
              )}>
                <Icon className="h-4 w-4" />
              </div>
              <span className="font-medium text-foreground">{info.getValue()}</span>
            </div>
          )
        },
      }),
      columnHelper.accessor('user', {
        header: 'User',
        cell: (info) => <span className="text-sm text-muted-foreground">{info.getValue()}</span>,
      }),
      columnHelper.accessor('type', {
        header: 'Type',
        cell: (info) => (
          <span className={cn(
            'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize',
            typeColors[info.getValue()]
          )}>
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor('ip', {
        header: 'IP Address',
        cell: (info) => <span className="text-sm text-muted-foreground font-mono">{info.getValue()}</span>,
      }),
      columnHelper.accessor('timestamp', {
        header: ({ column }) => (
          <div
            className="flex items-center gap-2 cursor-pointer hover:text-foreground transition-colors"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Timestamp <ArrowUpDown className="w-3 h-3" />
          </div>
        ),
        cell: (info) => <span className="text-sm text-muted-foreground">{formatDateTime(info.getValue())}</span>,
      }),
    ],
    []
  )

  const filteredData = useMemo(() => {
    return mockLogs.filter((log) => {
      const matchesType = !selectedType || log.type === selectedType
      return matchesType
    })
  }, [selectedType])

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
      const log = row.original
      const search = filterValue.toLowerCase()
      return (
        log.action.toLowerCase().includes(search) ||
        log.user.toLowerCase().includes(search)
      )
    },
  })

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Audit Logs</h1>
        <p className="text-muted-foreground">
          Security and compliance activity logs
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search logs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-input bg-background py-2 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="rounded-lg border border-input bg-background px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">All Types</option>
          <option value="auth">Authentication</option>
          <option value="store">Store</option>
          <option value="staff">Staff</option>
          <option value="settings">Settings</option>
          <option value="transaction">Transaction</option>
        </select>
      </div>

      {/* Logs Table */}
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
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="hover:bg-muted/50 transition-colors">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-6 py-4">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

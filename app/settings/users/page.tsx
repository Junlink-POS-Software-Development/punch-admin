'use client'

import { useState, useMemo } from 'react'
import { User, Shield, MoreHorizontal, UserPlus, Search, ArrowUpDown } from 'lucide-react'
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

// Mock user data
const mockUsers = [
  { id: '1', name: 'John Admin', email: 'john@junlink.com', role: 'admin', status: 'active' },
  { id: '2', name: 'Sarah Manager', email: 'sarah@junlink.com', role: 'manager', status: 'active' },
  { id: '3', name: 'Mike Cashier', email: 'mike@junlink.com', role: 'member', status: 'active' },
  { id: '4', name: 'Jane Doe', email: 'jane@junlink.com', role: 'member', status: 'inactive' },
]

const roleColors: Record<string, string> = {
  admin: 'bg-primary/10 text-primary',
  manager: 'bg-warning/10 text-warning',
  member: 'bg-success/10 text-success',
}

interface UserData {
  id: string
  name: string
  email: string
  role: string
  status: string
}

const columnHelper = createColumnHelper<UserData>()

export default function UsersPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [sorting, setSorting] = useState<SortingState>([])

  const columns = useMemo(
    () => [
      columnHelper.accessor('name', {
        header: ({ column }) => (
          <div
            className="flex items-center gap-2 cursor-pointer hover:text-foreground transition-colors"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            User <ArrowUpDown className="w-3 h-3" />
          </div>
        ),
        cell: (info) => {
          const user = info.row.original
          return (
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
                {user.name.charAt(0)}
              </div>
              <div>
                <p className="font-medium text-foreground">{user.name}</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>
          )
        },
      }),
      columnHelper.accessor('role', {
        header: 'Role',
        cell: (info) => (
          <span className={cn(
            'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize',
            roleColors[info.getValue()]
          )}>
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor('status', {
        header: 'Status',
        cell: (info) => {
          const status = info.getValue()
          return (
            <span className={cn(
              'inline-flex items-center gap-1.5 text-sm capitalize',
              status === 'active' ? 'text-success' : 'text-muted-foreground'
            )}>
              <span className={cn(
                'h-2 w-2 rounded-full',
                status === 'active' ? 'bg-success' : 'bg-muted-foreground'
              )} />
              {status}
            </span>
          )
        },
      }),
      columnHelper.display({
        id: 'actions',
        header: () => <div className="text-right">Actions</div>,
        cell: () => (
          <div className="text-right">
            <button className="rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>
        ),
      }),
    ],
    []
  )

  const table = useReactTable({
    data: mockUsers,
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
      const user = row.original
      const search = filterValue.toLowerCase()
      return (
        user.name.toLowerCase().includes(search) ||
        user.email.toLowerCase().includes(search)
      )
    },
  })

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">User Management</h1>
          <p className="text-muted-foreground">
            Manage user accounts and permissions
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
          <UserPlus className="h-4 w-4" />
          Add User
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-lg border border-input bg-background py-2 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {/* Users Table */}
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

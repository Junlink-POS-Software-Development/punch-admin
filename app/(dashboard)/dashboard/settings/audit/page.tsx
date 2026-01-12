'use client'

import { useState } from 'react'
import { Search, Filter, Shield, User, Settings, Database } from 'lucide-react'
import { formatDateTime } from '@/lib/utils/formatters'
import { cn } from '@/lib/utils/cn'

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

export default function AuditLogsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState<string>('')
  const [logs] = useState(mockLogs)

  const filteredLogs = logs.filter((log) => {
    const matchesSearch = 
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.user.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = !selectedType || log.type === selectedType
    return matchesSearch && matchesType
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
              <tr className="border-b border-border bg-muted/50">
                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Action
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  IP Address
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Timestamp
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredLogs.map((log) => {
                const Icon = typeIcons[log.type] || Shield
                return (
                  <tr key={log.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          'flex h-8 w-8 items-center justify-center rounded-lg',
                          typeColors[log.type]
                        )}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <span className="font-medium text-foreground">{log.action}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {log.user}
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize',
                        typeColors[log.type]
                      )}>
                        {log.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground font-mono">
                      {log.ip}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {formatDateTime(log.timestamp)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

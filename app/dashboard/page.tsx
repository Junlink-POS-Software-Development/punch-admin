'use client'

import { KPICard } from './components/KPICard'
import { QuickActions } from './components/QuickActions'
import { ActivityFeed } from './components/ActivityFeed'
import { DollarSign, Users, Store, Clock } from 'lucide-react'


import { useDashboardStats } from './hooks/useDashboardStats'

import { Calendar } from './components/Calendar'

export default function DashboardPage() {
  const { data: stats = {
    totalRevenue: 0,
    activeStaff: 0,
    totalStores: 0,
    pendingTransactions: 0,
    revenueTrend: 12.5,
    staffTrend: 8.2,
  }, isLoading: loading } = useDashboardStats()

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's an overview of your POS system.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Revenue"
          value={stats.totalRevenue}
          icon={DollarSign}
          variant="primary"
          format="currency"
          trend={{ value: stats.revenueTrend, isPositive: true }}
          subtitle="in selected period"
          action={<Calendar />}
        />
        <KPICard
          title="Active Staff"
          value={stats.activeStaff}
          icon={Users}
          variant="success"
          format="number"
          trend={{ value: stats.staffTrend, isPositive: true }}
          subtitle="total enrolled"
        />
        <KPICard
          title="Total Stores"
          value={stats.totalStores}
          icon={Store}
          variant="warning"
          format="number"
        />
        <KPICard
          title="Transactions"
          value={stats.pendingTransactions}
          icon={Clock}
          variant="default"
          format="number"
          subtitle="in selected period"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Activity Feed - Takes 2 columns */}
        <div className="lg:col-span-2">
          <ActivityFeed />
        </div>

        {/* Quick Actions */}
        <div>
          <QuickActions />
        </div>
      </div>
    </div>
  )
}

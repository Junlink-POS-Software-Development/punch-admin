'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { KPICard } from '@/components/dashboard/KPICard'
import { QuickActions } from '@/components/dashboard/QuickActions'
import { ActivityFeed } from '@/components/dashboard/ActivityFeed'
import { DollarSign, Users, Store, Clock } from 'lucide-react'

interface DashboardStats {
  totalRevenue: number
  activeStaff: number
  totalStores: number
  pendingTransactions: number
  revenueTrend: number
  staffTrend: number
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    activeStaff: 0,
    totalStores: 0,
    pendingTransactions: 0,
    revenueTrend: 12.5,
    staffTrend: 8.2,
  })
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchStats() {
      try {
        // Get total revenue from transactions (this month)
        const startOfMonth = new Date()
        startOfMonth.setDate(1)
        startOfMonth.setHours(0, 0, 0, 0)

        const { data: revenueData } = await supabase
          .from('transactions')
          .select('total_price')
          .gte('transaction_time', startOfMonth.toISOString())

        const totalRevenue = revenueData?.reduce((sum, t) => sum + (t.total_price || 0), 0) || 0

        // Get staff count
        const { count: staffCount } = await supabase
          .from('members')
          .select('*', { count: 'exact', head: true })

        // Get store count
        const { count: storeCount } = await supabase
          .from('stores')
          .select('*', { count: 'exact', head: true })

        // Get pending transactions (today's transactions as a proxy)
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const { count: todayTransactions } = await supabase
          .from('transactions')
          .select('*', { count: 'exact', head: true })
          .gte('transaction_time', today.toISOString())

        setStats({
          totalRevenue,
          activeStaff: staffCount || 0,
          totalStores: storeCount || 0,
          pendingTransactions: todayTransactions || 0,
          revenueTrend: 12.5, // Mock trend data
          staffTrend: 8.2,
        })
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [supabase])

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's an overview of your POS system.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Monthly Revenue"
          value={stats.totalRevenue}
          icon={DollarSign}
          variant="primary"
          format="currency"
          trend={{ value: stats.revenueTrend, isPositive: true }}
          subtitle="vs last month"
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
          title="Today's Transactions"
          value={stats.pendingTransactions}
          icon={Clock}
          variant="default"
          format="number"
          subtitle="transactions today"
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

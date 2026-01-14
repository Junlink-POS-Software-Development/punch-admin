'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useParams } from 'next/navigation'
import { getStoreById, getStoreStats, type Store, type StoreDashboardStats } from '../services/storeService'
import { ArrowLeft, Wallet, TrendingUp, TrendingDown, Calendar } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils/cn'

export default function StoreDashboardPage() {
  const params = useParams()
  const storeId = params.id as string
  const supabase = createClient()

  const [store, setStore] = useState<Store | null>(null)
  const [stats, setStats] = useState<StoreDashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      if (!storeId) return
      
      try {
        // Fetch both store details and stats in parallel
        const [storeData, statsData] = await Promise.all([
          getStoreById(supabase, storeId),
          getStoreStats(supabase, storeId)
        ])

        setStore(storeData)
        setStats(statsData)
      } catch (error) {
        console.error('Failed to load dashboard:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [storeId, supabase])

  if (loading) {
    return <div className="flex h-screen items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
  }

  if (!store || !stats) {
    return <div className="p-8 text-center">Store not found</div>
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4">
        <Link href="/stores" className="rounded-full p-2 hover:bg-muted transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">{store.store_name}</h1>
          <p className="text-sm text-muted-foreground">Dashboard Overview</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Cash on Hand" 
          value={stats.cash_on_hand} 
          icon={Wallet}
          description="Categorized Balance"
          trend="neutral"
        />
        <StatCard 
          title="Daily Gross" 
          value={stats.daily_gross_income} 
          icon={TrendingUp}
          description="Today's Sales"
          trend="positive"
        />
        <StatCard 
          title="Daily Expenses" 
          value={stats.daily_expenses} 
          icon={TrendingDown}
          description="Today's Costs"
          trend="negative"
        />
        <StatCard 
          title="Monthly Gross" 
          value={stats.monthly_gross_income} 
          icon={Calendar}
          description="Current Month"
          trend="positive"
        />
      </div>
      
      {/* Placeholder for future sections (Charts/Tables) */}
      <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
        <p>Transaction history and charts will appear here.</p>
      </div>
    </div>
  )
}

// Sub-component for clean cards
function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  description,
  trend 
}: { 
  title: string
  value: number
  icon: any
  description: string
  trend: 'positive' | 'negative' | 'neutral'
}) {
  const formatter = new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
  })

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between space-y-0 pb-2">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <Icon className={cn(
          "h-4 w-4",
          trend === 'positive' ? "text-green-500" : 
          trend === 'negative' ? "text-red-500" : "text-blue-500"
        )} />
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="text-2xl font-bold">{formatter.format(value)}</h3>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}
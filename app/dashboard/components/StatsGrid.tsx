'use client'

import React from 'react'
import { StatCard } from './StatCard'
import { useDashboardData } from '../hooks/useDashboardData'
import { DollarSign, TrendingUp, ShoppingBag, CreditCard } from 'lucide-react'

// Helper to format currency
const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2
  }).format(val)
}

export const StatsGrid = () => {
  const { data, isLoading } = useDashboardData()

  if (isLoading || !data) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-40 bg-muted/40 rounded-xl border border-border/40" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Gross Sales"
        value={formatCurrency(data.grossSales)}
        icon={DollarSign}
        trend={data.trends.grossSales}
        variant="default" 
      />
      
      <StatCard
        title="Net Profit"
        value={formatCurrency(data.netProfit)}
        icon={TrendingUp}
        trend={data.trends.netProfit}
        variant="highlight"
        tooltip="Gross Profit - (COGS + Operating Expenses)"
      />

      <StatCard
        title="Transactions"
        value={data.transactionCount}
        icon={ShoppingBag}
        trend={data.trends.transactionCount}
        subtext={`Peak: ${data.busiestHour}`}
      />

      <StatCard
        title="Avg. Order Value"
        value={formatCurrency(data.averageOrderValue)}
        icon={CreditCard}
        trend={data.trends.averageOrderValue}
      />
    </div>
  )
}

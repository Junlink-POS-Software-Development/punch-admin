'use client'

import { useFinancialMetrics } from '../hooks/useFinancialMetrics'
import { formatCurrency, formatNumber } from '@/lib/utils/formatters'
import { PulseCard } from './PulseCard'
import {
  DollarSign,
  TrendingUp,
  ShoppingCart,
  Receipt,
} from 'lucide-react'

export function StatsGrid() {
  const { data: realData } = useFinancialMetrics()

  // Only use data from the RPC, no mock fallbacks
  const stats = {
    grossSales: realData?.gross_sales ?? 0,
    netProfit: realData?.net_profit ?? 0,
    transactionCount: 0, // Not yet in RPC
    aov: 0, // Not yet in RPC
    grossSalesTrend: 0,
    netProfitTrend: 0,
    transactionTrend: 0,
    aovTrend: 0,
    peakHour: 'N/A',
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <PulseCard
        title="Gross Sales"
        value={formatCurrency(stats.grossSales)}
        trend={stats.grossSalesTrend}
        subtitle="vs prev. period"
        icon={<DollarSign className="h-5 w-5" />}
        accentColor="bg-primary/10 text-primary"
        isRealtime={!!realData}
      />

      <PulseCard
        title="Net Profit"
        value={formatCurrency(stats.netProfit)}
        trend={stats.netProfitTrend}
        subtitle="vs prev. period"
        tooltip="Revenue minus Costs & Expenses"
        icon={<TrendingUp className="h-5 w-5" />}
        accentColor="bg-success/10 text-success"
        isRealtime={!!realData}
      />

      <PulseCard
        title="Transactions"
        value={formatNumber(stats.transactionCount)}
        trend={stats.transactionTrend}
        subtitle={`Busiest at ${stats.peakHour}`}
        icon={<Receipt className="h-5 w-5" />}
        accentColor="bg-warning/10 text-warning"
      />

      <PulseCard
        title="Avg. Order Value"
        value={formatCurrency(stats.aov)}
        trend={stats.aovTrend}
        subtitle="per transaction"
        icon={<ShoppingCart className="h-5 w-5" />}
        accentColor="bg-accent text-accent-foreground"
      />
    </div>
  )
}

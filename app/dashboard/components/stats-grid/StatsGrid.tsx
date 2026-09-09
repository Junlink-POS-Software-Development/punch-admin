'use client'

import { usePulseMetrics } from '../../hooks/usePulseMetrics'
import { formatCurrency, formatNumber } from '@/lib/utils/formatters'
import { PulseCard } from './PulseCard'
import { useState, useEffect } from 'react'
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  Receipt,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'

export function StatsGrid() {
  const [showNetSales, setShowNetSales] = useState(false)
  const [mounted, setMounted] = useState(false)

  const {
    grossSales,
    netSales,
    discounts,
    netProfit,
    transactionCount,
    aov,
    grossSalesTrend,
    netSalesTrend,
    netProfitTrend,
    transactionTrend,
    aovTrend,
    peakHour,
    comparisonLabel,
    hasRealData,
  } = usePulseMetrics()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 animate-pulse">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-40 rounded-xl bg-card border border-border" />
        ))}
      </div>
    )
  }

  const activeSales = showNetSales ? netSales : grossSales
  const activeSalesTrend = showNetSales ? netSalesTrend : grossSalesTrend
  const isSalesTrendPositive = activeSalesTrend !== undefined && activeSalesTrend >= 0

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {/* Gross / Net Sales Pulse Card */}
      <div className="relative group overflow-hidden rounded-xl border border-border bg-card p-6 transition-all card-hover">
        <div className="absolute inset-x-0 top-0 h-1 rounded-t-xl bg-primary/60" />
        
        <div className="flex items-start justify-between mb-2">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                {showNetSales ? 'Net Sales' : 'Gross Sales'}
              </p>
              <div className="flex bg-muted rounded-lg p-0.5 border border-border/50 -translate-y-px">
                <button
                  onClick={() => setShowNetSales(false)}
                  className={cn(
                    "text-[10px] px-2 py-0.5 rounded-md font-bold transition-all",
                    !showNetSales ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  GROSS
                </button>
                <button
                  onClick={() => setShowNetSales(true)}
                  className={cn(
                    "text-[10px] px-2 py-0.5 rounded-md font-bold transition-all",
                    showNetSales ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  NET
                </button>
              </div>
            </div>
            <h3 className={cn(
              "text-3xl font-bold tracking-tight",
              hasRealData ? "text-amber-500" : "text-foreground"
            )}>
              {formatCurrency(activeSales)}
            </h3>
          </div>
          <div className="bg-primary/10 text-primary p-2.5 rounded-xl">
            <DollarSign className="h-5 w-5" />
          </div>
        </div>

        {/* Sales Trend & Comparison Period */}
        <div className="flex items-center gap-2 flex-wrap mb-4">
          {activeSalesTrend !== undefined && (
            <span
              className={cn(
                'inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-semibold',
                isSalesTrendPositive
                  ? 'bg-success/10 text-success'
                  : 'bg-destructive/10 text-destructive'
              )}
            >
              {isSalesTrendPositive ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {Math.abs(activeSalesTrend).toFixed(1)}%
            </span>
          )}
          <span className="text-xs text-muted-foreground">{comparisonLabel}</span>
        </div>

        <div className="space-y-2 border-t border-border/50 pt-3">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-muted-foreground font-medium">Breakdown</span>
            <div className="flex items-center gap-1.5 text-success font-bold">
              <span>{formatCurrency(discounts)}</span>
              <span className="text-[9px] bg-success/10 px-1 rounded">DISCOUNTS</span>
            </div>
          </div>
          <div className="flex items-center gap-2 overflow-hidden rounded-full bg-muted h-1.5">
            <div 
              className="h-full bg-primary/80 transition-all duration-500" 
              style={{ width: `${(netSales / (grossSales || 1)) * 100}%` }}
            />
            <div 
              className="h-full bg-success/60 transition-all duration-500" 
              style={{ width: `${(discounts / (grossSales || 1)) * 100}%` }}
            />
          </div>
          <p className="text-[10px] text-muted-foreground italic">
            {showNetSales ? 'Excluding discounts' : 'Including all discounts'}
          </p>
        </div>
      </div>

      <PulseCard
        title="Net Profit"
        value={formatCurrency(netProfit)}
        trend={netProfitTrend}
        subtitle={comparisonLabel}
        tooltip="Revenue minus Costs & Expenses"
        icon={<TrendingUp className="h-5 w-5" />}
        accentColor="bg-success/10 text-success"
        isRealtime={hasRealData}
      />

      <PulseCard
        title="Transactions"
        value={formatNumber(transactionCount)}
        trend={transactionTrend}
        subtitle={peakHour !== 'N/A' ? `Busiest at ${peakHour}` : comparisonLabel}
        icon={<Receipt className="h-5 w-5" />}
        accentColor="bg-warning/10 text-warning"
        isRealtime={hasRealData}
      />

      <PulseCard
        title="Avg. Order Value"
        value={formatCurrency(aov)}
        trend={aovTrend}
        subtitle={comparisonLabel}
        icon={<ShoppingCart className="h-5 w-5" />}
        accentColor="bg-accent text-accent-foreground"
        isRealtime={hasRealData}
      />
    </div>
  )
}

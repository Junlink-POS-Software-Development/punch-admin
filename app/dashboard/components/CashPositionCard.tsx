'use client'

import { useFinancialMetrics } from '../hooks/useFinancialMetrics'
import { formatCurrency } from '@/lib/utils/formatters'
import {
  Wallet,
  TrendingUp,
  Package,
  Building2,
  UserMinus,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface BreakdownLine {
  label: string
  value: number
  type: 'positive' | 'negative'
  icon: React.ReactNode
  isRealtime?: boolean
}

export function CashPositionCard() {
  const { data: realData } = useFinancialMetrics()

  // Only use data from the RPC, no mock fallbacks
  const data = {
    availableCash: 0, // Not yet in RPC
    netProfit: realData?.net_profit ?? 0,
    totalExpenses: realData?.total_expenses ?? 0,
    ownerDrawings: 0, // Included in totalExpenses now as per user, but kept for visual if needed?
    // Actually the user said expenses table records EVERYTHING. 
    // So "availableCash" would be "net_sales - total_expenses" if they want current drawer state?
    // But let's stick to showing the total expenses as the main negative driver.
  }

  const hasRealData = !!realData

  const breakdownLines: BreakdownLine[] = [
    {
      label: 'Net Profit',
      value: data.netProfit,
      type: 'positive',
      icon: <TrendingUp className="h-4 w-4" />,
      isRealtime: hasRealData,
    },
    {
      label: 'Total Expenses',
      value: data.totalExpenses,
      type: 'negative',
      icon: <Package className="h-4 w-4" />,
      isRealtime: hasRealData,
    },
  ]

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success/10">
          <Wallet className="h-5 w-5 text-success" />
        </div>
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">
            Available Cash
          </h3>
          <p className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
            {formatCurrency(data.availableCash)}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Breakdown
        </p>
        {breakdownLines.map((line) => (
          <div
            key={line.label}
            className="flex items-center justify-between py-2 border-b border-border/50 last:border-0"
          >
            <div className="flex items-center gap-2.5">
              <div
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-lg',
                  line.type === 'positive'
                    ? 'bg-success/10 text-success'
                    : 'bg-destructive/10 text-destructive'
                )}
              >
                {line.icon}
              </div>
              <span className="text-sm text-foreground">{line.label}</span>
            </div>
            <span
              className={cn(
                'text-sm font-semibold',
                line.isRealtime 
                  ? 'text-amber-500' 
                  : line.type === 'positive' ? 'text-success' : 'text-destructive'
              )}
            >
              {line.type === 'positive' ? '+' : '−'}{' '}
              {formatCurrency(line.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

'use client'

import { useDashboardStore } from '@/app/stores/dashboardStore'
import { getLiquidityData } from '@/app/dashboard/data'
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
}

export function CashPositionCard() {
  const { selectedBranch, datePreset } = useDashboardStore()
  const data = getLiquidityData(selectedBranch, datePreset)

  const breakdownLines: BreakdownLine[] = [
    {
      label: 'Net Profit',
      value: data.netProfit,
      type: 'positive',
      icon: <TrendingUp className="h-4 w-4" />,
    },
    {
      label: 'COGS',
      value: data.cogs,
      type: 'negative',
      icon: <Package className="h-4 w-4" />,
    },
    {
      label: 'Operating Expenses',
      value: data.operatingExpenses,
      type: 'negative',
      icon: <Building2 className="h-4 w-4" />,
    },
    {
      label: 'Owner Drawings',
      value: data.ownerDrawings,
      type: 'negative',
      icon: <UserMinus className="h-4 w-4" />,
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
                line.type === 'positive' ? 'text-success' : 'text-destructive'
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

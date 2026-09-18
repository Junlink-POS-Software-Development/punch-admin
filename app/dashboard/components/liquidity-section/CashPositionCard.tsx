'use client'

import { useCashPosition } from '../../hooks/useCashPosition'
import { useDashboardStore } from '../../../stores/dashboardStore'
import { formatCurrency } from '@/lib/utils/formatters'
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  RotateCcw,
  RefreshCw,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { format } from 'date-fns'

export function CashPositionCard() {
  const { data, isLoading, isError, refetch, isFetching } = useCashPosition()
  const { datePreset, dateRange } = useDashboardStore()

  // Avoid UTC timezone shifts by parsing YYYY-MM-DD safely
  const parseSafe = (s: string) => {
    const [y, m, d] = s.split('-').map(Number)
    return new Date(y, m - 1, d)
  }

  const toDate = parseSafe(dateRange.to)
  const isToday = datePreset === 'today'
  const dateSubtitle = isToday
    ? 'Live Cash in Register'
    : `Ending Cash (as of ${format(toDate, 'MMM d, yyyy')})`

  const availableCash = data?.availableCash ?? 0
  const openingBalance = data?.openingBalance ?? 0
  const totalCashIn = data?.totalCashIn ?? 0
  const totalCashOut = data?.totalCashOut ?? 0
  const netCashFlow = data?.netCashFlow ?? 0

  return (
    <div className="rounded-xl border border-border bg-card p-6 flex flex-col justify-between">
      {/* Card Header & Main Stat */}
      <div>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success/10 text-success">
              <Wallet className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">
                Available Cash
              </h3>
              <p className="text-[11px] text-muted-foreground font-medium">
                {dateSubtitle}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="p-1.5 rounded-lg border border-border/50 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
            title="Refresh cash position"
          >
            <RefreshCw className={cn('h-3.5 w-3.5', isFetching && 'animate-spin text-primary')} />
          </button>
        </div>

        {isLoading ? (
          <div className="h-9 w-40 rounded bg-muted animate-pulse mb-6" />
        ) : isError ? (
          <p className="text-lg font-bold text-destructive mb-6">Error loading balance</p>
        ) : (
          <p className="text-3xl font-bold text-foreground tracking-tight mb-6">
            {formatCurrency(availableCash)}
          </p>
        )}

        {/* Reconciled Cash Flow Breakdown */}
        <div className="space-y-3 border-t border-border/50 pt-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Cash Reconciliation
            </p>
            <span
              className={cn(
                'text-[11px] font-bold px-2 py-0.5 rounded-full',
                netCashFlow >= 0 ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
              )}
            >
              Net Flow: {netCashFlow >= 0 ? '+' : ''}
              {formatCurrency(netCashFlow)}
            </span>
          </div>

          {/* Row 1: Forwarded / Starting Cash */}
          <div className="flex items-center justify-between py-1.5 border-b border-border/30">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-muted text-muted-foreground">
                <RotateCcw className="h-3.5 w-3.5" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm text-foreground">Starting Cash</span>
                <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.2 rounded font-medium">
                  FORWARDED
                </span>
              </div>
            </div>
            <span className="text-sm font-semibold text-foreground">
              {formatCurrency(openingBalance)}
            </span>
          </div>

          {/* Row 2: Cash In (Sales & Deposits) */}
          <div className="flex items-center justify-between py-1.5 border-b border-border/30">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-success/10 text-success">
                <ArrowDownLeft className="h-3.5 w-3.5" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm text-foreground">Total Cash In</span>
                <span className="text-[10px] text-success bg-success/10 px-1.5 py-0.2 rounded font-medium">
                  INFLOWS
                </span>
              </div>
            </div>
            <span className="text-sm font-semibold text-success">
              + {formatCurrency(totalCashIn)}
            </span>
          </div>

          {/* Row 3: Cash Out (Expenses & Remittances) */}
          <div className="flex items-center justify-between py-1.5 border-b border-border/30">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-destructive/10 text-destructive">
                <ArrowUpRight className="h-3.5 w-3.5" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm text-foreground">Total Cash Out</span>
                <span className="text-[10px] text-destructive bg-destructive/10 px-1.5 py-0.2 rounded font-medium">
                  EXPENSES & REMIT
                </span>
              </div>
            </div>
            <span className="text-sm font-semibold text-destructive">
              − {formatCurrency(totalCashOut)}
            </span>
          </div>
        </div>
      </div>

      {/* Accounting Footnote */}
      <div className="mt-4 pt-2 border-t border-border/30">
        <p className="text-[10px] text-muted-foreground italic text-center">
          Starting Cash + Inflows − Outflows = Available Cash
        </p>
      </div>
    </div>
  )
}

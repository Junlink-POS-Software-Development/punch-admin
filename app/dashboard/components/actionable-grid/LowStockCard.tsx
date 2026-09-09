'use client'

import { useMemo } from 'react'
import { useDashboardLowStock } from '../../hooks/useDashboardInventory'
import { useStores } from '@/app/stores/hooks/useStores'
import { useDashboardStore } from '@/app/stores/dashboardStore'
import { formatNumber } from '@/lib/utils/formatters'
import { cn } from '@/lib/utils/cn'
import { AlertTriangle, CheckCircle2, PackageX, RefreshCw } from 'lucide-react'

function SkeletonRow() {
  return (
    <div className="flex items-center justify-between py-3 border-b border-border/30 animate-pulse">
      <div className="space-y-1.5 flex-1">
        <div className="h-3.5 w-3/5 rounded bg-muted" />
        <div className="h-2.5 w-1/3 rounded bg-muted/60" />
      </div>
      <div className="h-6 w-12 rounded-full bg-muted shrink-0" />
    </div>
  )
}

export function LowStockCard() {
  const { data: items, isLoading, isError, error, refetch, isFetching } = useDashboardLowStock()
  const { data: stores } = useStores()
  const { selectedBranch } = useDashboardStore()
  const isAllStores = selectedBranch === 'all'

  const storeMap = useMemo(() => {
    const map = new Map<string, string>()
    if (stores) {
      stores.forEach((s: any) => map.set(s.store_id, s.store_name))
    }
    return map
  }, [stores])

  const alerts = items || []

  return (
    <div className="rounded-xl border border-border bg-card p-6 flex flex-col h-[500px] overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5 shrink-0">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-destructive/10">
          <AlertTriangle className="h-4.5 w-4.5 text-destructive" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            Low Stock Alerts
          </h3>
          <p className="text-[11px] text-muted-foreground">
            {isAllStores ? 'Across all stores' : 'Selected store'}
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {alerts.length > 0 && (
            <span className="rounded-full bg-destructive/10 px-2.5 py-0.5 text-xs font-bold text-destructive">
              {alerts.length}
            </span>
          )}
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="p-1 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40"
            title="Refresh low stock"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", isFetching && "animate-spin text-primary")} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pr-1">
        {isLoading ? (
          <div className="space-y-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonRow key={i} />
            ))}
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center h-full py-10 text-center px-4">
            <PackageX className="h-8 w-8 text-destructive/60 mb-2" />
            <p className="text-xs text-destructive font-medium">
              {error instanceof Error ? error.message : 'Failed to load stock alerts'}
            </p>
            <button
              onClick={() => refetch()}
              className="mt-3 text-xs text-primary font-semibold hover:underline"
            >
              Try again
            </button>
          </div>
        ) : alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-10 text-center px-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success/10 mb-3">
              <CheckCircle2 className="h-5 w-5 text-success" />
            </div>
            <h4 className="text-sm font-semibold text-foreground mb-1">
              Stock Levels Healthy
            </h4>
            <p className="text-xs text-muted-foreground max-w-[200px] leading-relaxed">
              No items currently at or below their low stock threshold.
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-card z-10">
              <tr className="border-b border-border/50">
                <th className="pb-2 text-left text-xs font-medium text-muted-foreground">
                  Item
                </th>
                <th className="pb-2 text-right text-xs font-medium text-muted-foreground">
                  Stock
                </th>
                <th className="pb-2 text-right text-xs font-medium text-muted-foreground">
                  Threshold
                </th>
              </tr>
            </thead>
            <tbody>
              {alerts.map((item) => {
                const threshold = item.low_stock_threshold || 10
                const isOutOfStock = item.current_stock <= 0
                const isCritical = isOutOfStock || item.current_stock <= threshold * 0.3
                const storeName = storeMap.get(item.store_id)

                return (
                  <tr
                    key={`${item.store_id}-${item.item_id}`}
                    className={cn(
                      'border-b border-border/30 last:border-0 transition-colors',
                      isOutOfStock ? 'bg-destructive/10' : isCritical && 'bg-destructive/5'
                    )}
                  >
                    <td className="py-2.5 pr-2">
                      <div className="flex flex-col">
                        <span
                          className={cn(
                            'text-sm font-medium leading-tight truncate',
                            isCritical ? 'text-destructive font-semibold' : 'text-foreground'
                          )}
                          title={item.item_name}
                        >
                          {item.item_name}
                        </span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {isAllStores && storeName && (
                            <span className="text-[10px] bg-muted px-1.5 py-0.2 rounded text-muted-foreground font-medium truncate max-w-[110px]">
                              {storeName}
                            </span>
                          )}
                          {item.sku && (
                            <span className="text-[10px] text-muted-foreground/70 font-mono">
                              {item.sku}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 text-right">
                      <span
                        className={cn(
                          'inline-flex items-center justify-center rounded-full px-2 py-0.5 text-xs font-bold min-w-8',
                          isOutOfStock
                            ? 'bg-destructive/25 text-destructive'
                            : isCritical
                            ? 'bg-destructive/20 text-destructive'
                            : 'bg-warning/15 text-warning'
                        )}
                      >
                        {formatNumber(item.current_stock)}
                      </span>
                    </td>
                    <td className="py-2.5 text-right text-xs text-muted-foreground">
                      {threshold}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

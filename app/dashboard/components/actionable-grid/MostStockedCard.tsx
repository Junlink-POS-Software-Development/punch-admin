'use client'

import { useMemo, useState } from 'react'
import { useDashboardMostStocked } from '../../hooks/useDashboardInventory'
import { useStores } from '@/app/stores/hooks/useStores'
import { useDashboardStore } from '@/app/stores/dashboardStore'
import { formatCurrency, formatNumber } from '@/lib/utils/formatters'
import { cn } from '@/lib/utils/cn'
import { Package, RefreshCw, Layers, DollarSign } from 'lucide-react'

function SkeletonRow() {
  return (
    <div className="flex items-center justify-between py-3 border-b border-border/30 animate-pulse">
      <div className="space-y-1.5 flex-1">
        <div className="h-3.5 w-3/5 rounded bg-muted" />
        <div className="h-2.5 w-1/4 rounded bg-muted/60" />
      </div>
      <div className="h-4 w-16 rounded bg-muted shrink-0" />
    </div>
  )
}

type SortMode = 'qty' | 'value'

export function MostStockedCard() {
  const { data: items, isLoading, isError, error, refetch, isFetching } = useDashboardMostStocked()
  const { data: stores } = useStores()
  const { selectedBranch } = useDashboardStore()
  const isAllStores = selectedBranch === 'all'
  const [sortMode, setSortMode] = useState<SortMode>('value')

  const storeMap = useMemo(() => {
    const map = new Map<string, string>()
    if (stores) {
      stores.forEach((s: any) => map.set(s.store_id, s.store_name))
    }
    return map
  }, [stores])

  const sortedItems = useMemo(() => {
    if (!items) return []
    const mapped = items.map((item) => {
      const unitCost = Number(item.unit_cost ?? item.cost_price ?? item.sales_price ?? 0)
      const stockValue = Number(item.current_stock || 0) * unitCost
      return {
        ...item,
        unitCost,
        stockValue,
      }
    })

    if (sortMode === 'value') {
      return mapped.sort((a, b) => b.stockValue - a.stockValue)
    }
    return mapped.sort((a, b) => b.current_stock - a.current_stock)
  }, [items, sortMode])

  return (
    <div className="rounded-xl border border-border bg-card p-6 flex flex-col h-[500px] overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5 shrink-0">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
          <Package className="h-4.5 w-4.5 text-primary" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            Most Stocked Items
          </h3>
          <p className="text-[11px] text-muted-foreground">
            {isAllStores ? 'Across all stores' : 'Selected store'}
          </p>
        </div>

        <div className="ml-auto flex items-center gap-1.5">
          {/* Sort Mode Toggle */}
          <div className="flex bg-muted rounded-lg p-0.5 border border-border/50">
            <button
              type="button"
              onClick={() => setSortMode('value')}
              className={cn(
                'flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold transition-all',
                sortMode === 'value'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
              title="Sort by capital value"
            >
              <DollarSign className="h-3 w-3" />
              <span>Value</span>
            </button>
            <button
              type="button"
              onClick={() => setSortMode('qty')}
              className={cn(
                'flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold transition-all',
                sortMode === 'qty'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
              title="Sort by unit quantity"
            >
              <Layers className="h-3 w-3" />
              <span>Qty</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="p-1 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40"
            title="Refresh inventory"
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
            <Package className="h-8 w-8 text-destructive/60 mb-2" />
            <p className="text-xs text-destructive font-medium">
              {error instanceof Error ? error.message : 'Failed to load stocked items'}
            </p>
            <button
              onClick={() => refetch()}
              className="mt-3 text-xs text-primary font-semibold hover:underline"
            >
              Try again
            </button>
          </div>
        ) : sortedItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-10 text-center px-4">
            <Package className="h-8 w-8 text-muted-foreground/50 mb-2" />
            <p className="text-sm text-muted-foreground">
              No inventory records found
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {sortedItems.map((item, index) => {
              const storeName = storeMap.get(item.store_id)

              return (
                <div
                  key={`${item.store_id}-${item.item_id}`}
                  className="flex items-center justify-between py-2 border-b border-border/30 last:border-0 hover:bg-muted/20 px-1 rounded transition-colors"
                >
                  <div className="min-w-0 flex-1 pr-2">
                    <p className="text-sm font-medium text-foreground truncate leading-tight">
                      {item.item_name}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-xs text-muted-foreground font-medium">
                        {formatNumber(item.current_stock)} units
                      </span>
                      {item.unitCost > 0 && (
                        <span className="text-[10px] text-muted-foreground/60">
                          (@ {formatCurrency(item.unitCost)})
                        </span>
                      )}
                      {isAllStores && storeName && (
                        <span className="text-[10px] bg-muted px-1.5 py-0.2 rounded text-muted-foreground font-medium truncate max-w-[100px]">
                          {storeName}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-foreground shrink-0">
                    {formatCurrency(item.stockValue)}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

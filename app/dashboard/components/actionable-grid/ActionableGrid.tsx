'use client'

import { LowStockCard } from './LowStockCard'
import { BestSellersCard } from './BestSellersCard'
import { MostStockedCard } from './MostStockedCard'

export function ActionableGrid() {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {/* Low Stock Alerts (Live from inventory_monitor_view) */}
      <LowStockCard />

      {/* Top Best Sellers / Least Sold / Dead Stocks */}
      <BestSellersCard />

      {/* Most Stocked Items (Live from inventory_monitor_view) */}
      <MostStockedCard />
    </div>
  )
}

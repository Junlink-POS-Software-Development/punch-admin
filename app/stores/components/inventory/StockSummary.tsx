"use client";

import { InventoryItem } from "../../services/storeService";
import { AlertTriangle, TrendingUp, Package } from "lucide-react";


interface StockSummaryProps {
  items: InventoryItem[];
}

export default function StockSummary({ items }: StockSummaryProps) {
  const lowStockItems = items
    .filter((item) => item.stock_status === "low_stock" || item.stock_status === "out_of_stock")
    .sort((a, b) => a.current_stock - b.current_stock)
    .slice(0, 5);

  const mostStockedItems = items
    .sort((a, b) => b.current_stock - a.current_stock)
    .slice(0, 5);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Low Stock Section */}
      <div className="bg-card border border-amber-500/20 rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-amber-500/10 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
          </div>
          <h3 className="font-bold text-lg text-amber-900 dark:text-amber-100">Low Stock Alert</h3>
        </div>
        <div className="space-y-4">
          {lowStockItems.length > 0 ? (
            lowStockItems.map((item) => (
              <div key={item.item_id} className="flex justify-between items-center p-3 bg-amber-50/50 dark:bg-amber-950/20 rounded-lg border border-amber-200/50 dark:border-amber-800/30">
                <div>
                  <p className="font-semibold text-sm">{item.item_name}</p>
                  <p className="text-[10px] text-amber-600/80 dark:text-amber-400/60 font-medium uppercase tracking-wider">Limit: {item.low_stock_threshold}</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-black text-amber-600 dark:text-amber-400 leading-none">{item.current_stock}</p>
                  <p className="text-[9px] text-amber-600/60 dark:text-amber-400/40 uppercase font-bold tracking-widest">Stock</p>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <Package className="w-8 h-8 mb-2 opacity-20" />
              <p className="text-sm">All items are well-stocked!</p>
            </div>
          )}
        </div>
      </div>

      {/* Most Stocked Section */}
      <div className="bg-card border border-emerald-500/20 rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-emerald-500/10 rounded-lg">
            <TrendingUp className="w-5 h-5 text-emerald-500" />
          </div>
          <h3 className="font-bold text-lg text-emerald-900 dark:text-emerald-100">Most Stocked Items</h3>
        </div>
        <div className="space-y-4">
          {mostStockedItems.length > 0 ? (
            mostStockedItems.map((item) => (
              <div key={item.item_id} className="flex justify-between items-center p-3 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-lg border border-emerald-200/50 dark:border-emerald-800/30">
                <div>
                  <p className="font-semibold text-sm">{item.item_name}</p>
                  <p className="text-[10px] text-emerald-600/80 dark:text-emerald-400/60 font-medium uppercase tracking-wider">{item.category || "General"}</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 leading-none">{item.current_stock}</p>
                  <p className="text-[9px] text-emerald-600/60 dark:text-emerald-400/40 uppercase font-bold tracking-widest">In Stock</p>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <Package className="w-8 h-8 mb-2 opacity-20" />
              <p className="text-sm">No inventory data available.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

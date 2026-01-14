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
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-red-500/10 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-red-500" />
          </div>
          <h3 className="font-bold text-lg">Low Stock Alert</h3>
        </div>
        <div className="space-y-4">
          {lowStockItems.length > 0 ? (
            lowStockItems.map((item) => (
              <div key={item.item_id} className="flex justify-between items-center p-3 bg-muted/30 rounded-lg border border-border/50">
                <div>
                  <p className="font-medium text-sm">{item.item_name}</p>
                  <p className="text-xs text-muted-foreground">Threshold: {item.low_stock_threshold}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-red-500">{item.current_stock}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Remaining</p>
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
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <TrendingUp className="w-5 h-5 text-blue-500" />
          </div>
          <h3 className="font-bold text-lg">Most Stocked Items</h3>
        </div>
        <div className="space-y-4">
          {mostStockedItems.length > 0 ? (
            mostStockedItems.map((item) => (
              <div key={item.item_id} className="flex justify-between items-center p-3 bg-muted/30 rounded-lg border border-border/50">
                <div>
                  <p className="font-medium text-sm">{item.item_name}</p>
                  <p className="text-xs text-muted-foreground">{item.category || "General"}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-foreground">{item.current_stock}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">In Stock</p>
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

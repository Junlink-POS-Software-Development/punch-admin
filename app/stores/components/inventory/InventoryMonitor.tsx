"use client";

import { Package, RefreshCw } from "lucide-react";
import InventoryTable from "./InventoryTable";
import StockSummary from "./StockSummary";

interface InventoryMonitorProps {
  storeId: string;
}

import { useStoreInventory } from "../../hooks/useStoreInventory";

export default function InventoryMonitor({ storeId }: InventoryMonitorProps) {
  const { data: items = [], isLoading: loading, isFetching: refreshing, refetch } = useStoreInventory(storeId);

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-xl p-12 flex flex-col items-center justify-center space-y-4">
        <RefreshCw className="w-8 h-8 text-primary animate-spin" />
        <p className="text-muted-foreground animate-pulse">Loading inventory data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in duration-700 slide-in-from-bottom-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Package className="w-6 h-6 text-primary" />
          <h2 className="font-bold text-xl">Inventory Monitoring</h2>
        </div>
        <button
          onClick={() => refetch()}
          disabled={refreshing}
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-secondary hover:bg-secondary/80 rounded-lg transition-colors disabled:opacity-50"
        >
          <RefreshCw className={refreshing ? "w-4 h-4 animate-spin" : "w-4 h-4"} />
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* Summary Section */}
      <StockSummary items={items} />

      {/* Detailed Table Section */}
      <InventoryTable items={items} />
    </div>
  );
}

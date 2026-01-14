"use client";

import { useState } from "react";
import { InventoryItem } from "../../services/storeService";
import { Search, ArrowUpDown, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface InventoryTableProps {
  items: InventoryItem[];
}

export default function InventoryTable({ items }: InventoryTableProps) {
  const [search, setSearch] = useState("");
  const [sortConfig, setSortConfig] = useState<{
    key: keyof InventoryItem;
    direction: "asc" | "desc";
  } | null>(null);

  const filteredItems = items
    .filter((item) =>
      item.item_name.toLowerCase().includes(search.toLowerCase()) ||
      item.sku.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (!sortConfig) return 0;
      const { key, direction } = sortConfig;
      if (a[key]! < b[key]!) return direction === "asc" ? -1 : 1;
      if (a[key]! > b[key]!) return direction === "asc" ? 1 : -1;
      return 0;
    });

  const handleSort = (key: keyof InventoryItem) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig?.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="p-4 border-b border-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h3 className="font-semibold text-lg">Full Inventory</h3>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search items or SKU..."
            className="w-full pl-9 pr-4 py-2 bg-muted border-none rounded-lg text-sm focus:ring-1 focus:ring-primary outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted/50 text-muted-foreground font-medium border-b border-border">
            <tr>
              <th className="px-6 py-3 cursor-pointer hover:text-foreground transition-colors" onClick={() => handleSort("item_name")}>
                <div className="flex items-center gap-2">
                  Item Name <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="px-6 py-3">SKU</th>
              <th className="px-6 py-3">Category</th>
              <th className="px-6 py-3 cursor-pointer hover:text-foreground transition-colors text-right" onClick={() => handleSort("current_stock")}>
                <div className="flex items-center justify-end gap-2">
                  Stock <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="px-6 py-3 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => {
                const isLowStock = item.stock_status === "low_stock";
                const isOutOfStock = item.stock_status === "out_of_stock";
                return (
                  <tr key={item.item_id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-foreground">{item.item_name}</td>
                    <td className="px-6 py-4 text-muted-foreground">{item.sku}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-xs">
                        {item.category || "Uncategorized"}
                      </span>
                    </td>
                    <td className={cn(
                      "px-6 py-4 text-right font-semibold",
                      isOutOfStock ? "text-red-600" : isLowStock ? "text-orange-500" : "text-foreground"
                    )}>
                      {item.current_stock}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {isOutOfStock ? (
                        <div className="flex items-center justify-end gap-1 text-red-600 text-xs font-medium">
                          <AlertTriangle className="w-3 h-3" />
                          Out of Stock
                        </div>
                      ) : isLowStock ? (
                        <div className="flex items-center justify-end gap-1 text-orange-500 text-xs font-medium">
                          <AlertTriangle className="w-3 h-3" />
                          Low Stock
                        </div>
                      ) : (
                        <span className="text-green-500 text-xs font-medium">Healthy</span>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                  No items found matching your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

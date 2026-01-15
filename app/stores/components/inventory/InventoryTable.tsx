"use client";

import { useState, useMemo } from "react";
import { InventoryItem } from "../../services/storeService";
import { Search, ArrowUpDown, AlertTriangle, Package, ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  createColumnHelper,
  SortingState,
} from "@tanstack/react-table";

interface InventoryTableProps {
  items: InventoryItem[];
}

const columnHelper = createColumnHelper<InventoryItem>();

export default function InventoryTable({ items }: InventoryTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const columns = useMemo(
    () => [
      columnHelper.accessor("item_name", {
        header: ({ column }) => (
          <div
            className="flex items-center gap-2 cursor-pointer hover:text-foreground transition-colors"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Item Name <ArrowUpDown className="w-3 h-3" />
          </div>
        ),
        cell: (info) => <span className="font-medium text-foreground">{info.getValue()}</span>,
      }),
      columnHelper.accessor("sku", {
        header: "SKU",
        cell: (info) => <span className="text-muted-foreground">{info.getValue()}</span>,
      }),
      columnHelper.accessor("category", {
        header: "Category",
        cell: (info) => (
          <span className="px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-xs">
            {info.getValue() || "Uncategorized"}
          </span>
        ),
      }),
      columnHelper.accessor("current_stock", {
        header: ({ column }) => (
          <div
            className="flex items-center justify-end gap-2 cursor-pointer hover:text-foreground transition-colors"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Stock <ArrowUpDown className="w-3 h-3" />
          </div>
        ),
        cell: (info) => {
          const item = info.row.original;
          const isLowStock = item.stock_status === "low_stock";
          const isOutOfStock = item.stock_status === "out_of_stock";
          return (
            <div className={cn(
              "text-right font-bold tabular-nums",
              isOutOfStock ? "text-red-600" : isLowStock ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"
            )}>
              {info.getValue()}
            </div>
          );
        },
      }),
      columnHelper.accessor("stock_status", {
        header: () => <div className="text-right">Status</div>,
        cell: (info) => {
          const status = info.getValue();
          const isOutOfStock = status === "out_of_stock";
          const isLowStock = status === "low_stock";

          return (
            <div className="flex justify-end">
              {isOutOfStock ? (
                <div className="flex items-center gap-1 text-red-600 text-xs font-bold uppercase tracking-tight">
                  <AlertTriangle className="w-3 h-3" />
                  Out of Stock
                </div>
              ) : isLowStock ? (
                <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-tight">
                  <AlertTriangle className="w-3 h-3" />
                  Low Stock
                </div>
              ) : (
                <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-tight">
                  <Package className="w-3 h-3" />
                  Healthy
                </div>
              )}
            </div>
          );
        },
      }),
    ],
    []
  );

  const table = useReactTable({
    data: items,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: (row, columnId, filterValue) => {
      const value = row.getValue(columnId) as string;
      return value?.toLowerCase().includes(filterValue.toLowerCase());
    },
  });

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
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted/50 text-muted-foreground font-medium border-b border-border">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="px-6 py-3">
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-border">
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="hover:bg-muted/30 transition-colors">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-6 py-4">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-6 py-8 text-center text-muted-foreground">
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

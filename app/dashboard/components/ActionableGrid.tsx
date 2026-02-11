'use client'

import React from 'react'
import { useStockAlerts } from '../hooks/useStockAlerts'
import { useDashboardData } from '../hooks/useDashboardData'
import { AlertTriangle, TrendingUp, Package } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0
    }).format(val)
  }

export const ActionableGrid = () => {
  const { data: stockAlerts } = useStockAlerts()
  const { data: dashboardData } = useDashboardData()

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      
      {/* 1. Low Stock Alerts */}
      <div className="bg-card border border-border rounded-xl flex flex-col overflow-hidden h-full shadow-sm">
        <div className="p-4 border-b bg-rose-50/50 dark:bg-rose-950/20 flex items-center justify-between">
            <h3 className="font-semibold flex items-center gap-2 text-rose-700 dark:text-rose-400">
                <AlertTriangle className="w-4 h-4" />
                Low Stock Alerts
            </h3>
            <span className="text-xs font-medium bg-rose-200 dark:bg-rose-900 text-rose-800 dark:text-rose-200 px-2 py-0.5 rounded-full">
                {stockAlerts?.length || 0} Critical
            </span>
        </div>
        <div className="flex-1 overflow-auto">
            <table className="w-full text-sm">
                <thead className="text-xs text-muted-foreground bg-muted/50 text-left">
                    <tr>
                        <th className="p-3 font-medium">Item Name</th>
                        <th className="p-3 font-medium text-right">Stock</th>
                        <th className="p-3 font-medium text-right">Reorder</th>
                    </tr>
                </thead>
                <tbody className="divide-y">
                    {stockAlerts?.map((item) => (
                        <tr key={item.id} className="group hover:bg-muted/50 transition-colors">
                            <td className="p-3 font-medium text-foreground">{item.name}</td>
                            <td className="p-3 text-right">
                                <span className="text-rose-600 font-bold">{item.currentStock}</span> 
                                <span className="text-xs text-muted-foreground ml-1">{item.unit}</span>
                            </td>
                            <td className="p-3 text-right text-muted-foreground">{item.reorderPoint}</td>
                        </tr>
                    ))}
                    {(!stockAlerts || stockAlerts.length === 0) && (
                        <tr>
                            <td colSpan={3} className="p-8 text-center text-muted-foreground text-sm">
                                No stock alerts at the moment.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>

      {/* 2. Top 5 Best Sellers */}
      <div className="bg-card border border-border rounded-xl flex flex-col overflow-hidden h-full shadow-sm">
        <div className="p-4 border-b flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            <h3 className="font-semibold">Top Best Sellers</h3>
        </div>
        <div className="flex-1 overflow-auto">
            <div className="divide-y">
                {dashboardData?.topSellers.map((item, i) => (
                    <div key={item.name} className="p-3 flex items-center justify-between hover:bg-muted/50">
                        <div className="flex items-center gap-3">
                            <span className={cn(
                                "flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold",
                                i === 0 ? "bg-yellow-100 text-yellow-700" :
                                i === 1 ? "bg-slate-200 text-slate-700" :
                                i === 2 ? "bg-orange-100 text-orange-800" : "bg-muted text-muted-foreground"
                            )}>
                                {i + 1}
                            </span>
                            <div className="flex flex-col">
                                <span className="font-medium text-sm">{item.name}</span>
                                <span className="text-xs text-muted-foreground">{item.volume} sold</span>
                            </div>
                        </div>
                        <div className="text-right">
                           <span className="text-sm font-semibold text-emerald-600">
                                +{formatCurrency(item.profitContribution)}
                           </span>
                           <p className="text-[10px] text-muted-foreground">Ctrb.</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </div>

      {/* 3. Most Stocked (Value) */}
      <div className="bg-card border border-border rounded-xl flex flex-col overflow-hidden h-full shadow-sm">
        <div className="p-4 border-b flex items-center gap-2">
            <Package className="w-4 h-4 text-primary" />
            <h3 className="font-semibold">High Value Inventory</h3>
        </div>
        <div className="flex-1 overflow-auto">
             <div className="divide-y">
                {dashboardData?.mostStocked.map((item) => (
                    <div key={item.name} className="p-3 flex items-center justify-between hover:bg-muted/50">
                        <div className="flex flex-col">
                            <span className="font-medium text-sm">{item.name}</span>
                            <span className="text-xs text-muted-foreground">Qty: {item.count}</span>
                        </div>
                        <span className="text-sm font-medium">
                            {formatCurrency(item.value)}
                        </span>
                    </div>
                ))}
             </div>
        </div>
      </div>

    </div>
  )
}

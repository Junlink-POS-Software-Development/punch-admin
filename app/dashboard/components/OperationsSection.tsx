'use client'

import React from 'react'
import { useRecentActivity } from '../hooks/useStockAlerts'
import { PlusCircle, FileText, PackagePlus, Wallet, ShoppingCart } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

export const OperationsSection = () => {
  const { data: activities } = useRecentActivity()

  const actions = [
    { label: 'New Sale', icon: ShoppingCart, variant: 'primary' },
    { label: 'Log Expense', icon: FileText, variant: 'default' },
    { label: 'Add Inventory', icon: PackagePlus, variant: 'default' },
    { label: 'Record Payout', icon: Wallet, variant: 'default' },
  ]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Quick Actions (1 col) */}
      <div className="bg-card border border-border rounded-xl p-6 flex flex-col shadow-sm">
         <h3 className="font-semibold mb-4 text-lg">Quick Actions</h3>
         <div className="grid grid-cols-2 gap-3">
            {actions.map((action) => (
                <button
                    key={action.label}
                    className={cn(
                        "flex flex-col items-center justify-center p-4 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]",
                        action.variant === 'primary' 
                            ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                            : "bg-muted/50 hover:bg-muted text-foreground border border-border"
                    )}
                >
                    <action.icon className={cn("w-6 h-6 mb-2", action.variant !== 'primary' && "text-muted-foreground")} />
                    <span className="text-sm font-medium">{action.label}</span>
                </button>
            ))}
         </div>
      </div>

      {/* Recent Activity (2 cols) */}
      <div className="lg:col-span-2 bg-card border border-border rounded-xl p-6 flex flex-col shadow-sm">
        <h3 className="font-semibold mb-4 text-lg">Recent Activity</h3>
        <div className="relative border-l border-border/50 ml-3 space-y-6">
            {activities?.map((activity) => (
                <div key={activity.id} className="relative pl-6">
                    {/* Timeline Dot */}
                    <div className={cn(
                        "absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full border-2 border-background",
                        activity.type === 'sale' ? "bg-emerald-500" :
                        activity.type === 'expense' ? "bg-rose-500" :
                        activity.type === 'inventory' ? "bg-blue-500" : "bg-amber-500"
                    )} />
                    
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-foreground">{activity.description}</p>
                            <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
                        </div>
                        {activity.amount && (
                            <span className={cn(
                                "text-sm font-medium",
                                activity.amount > 0 ? "text-emerald-600" : "text-rose-600"
                            )}>
                                {activity.amount > 0 ? '+' : ''}{activity.amount.toLocaleString('en-PH', { style: 'currency', currency: 'PHP' })}
                            </span>
                        )}
                    </div>
                </div>
            ))}
        </div>
      </div>

    </div>
  )
}

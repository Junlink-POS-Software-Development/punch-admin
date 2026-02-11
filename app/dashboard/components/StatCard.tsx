'use client'

import React from 'react'
import { LucideIcon, ArrowUpRight, ArrowDownRight, Info } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  trend?: number
  trendLabel?: string
  subtext?: string
  tooltip?: string
  variant?: 'default' | 'highlight'
}

export const StatCard = ({
  title,
  value,
  icon: Icon,
  trend,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  trendLabel,
  subtext,
  tooltip,
  variant = 'default'
}: StatCardProps) => {
  const isPositive = trend && trend > 0
  
  return (
    <div className={cn(
      "relative p-6 rounded-xl border transition-all duration-200 shadow-sm hover:shadow-md",
      variant === 'highlight' 
        ? "bg-gradient-to-br from-primary/10 via-primary/5 to-background border-primary/20" 
        : "bg-card border-border"
    )}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-2">
            <div className={cn(
                "p-2 rounded-lg",
                variant === 'highlight' ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
            )}>
                <Icon className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">{title}</span>
        </div>
        {tooltip && (
          <div className="group relative">
            <Info className="w-4 h-4 text-muted-foreground/50 hover:text-primary cursor-help" />
            <div className="absolute right-0 top-6 w-48 p-2 bg-popover text-popover-foreground text-xs rounded shadow-lg border opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
              {tooltip}
            </div>
          </div>
        )}
      </div>

      <div className="space-y-1">
        <h3 className="text-2xl font-bold tracking-tight">{value}</h3>
        
        <div className="flex items-center gap-2 text-xs">
          {trend !== undefined && (
            <span className={cn(
              "flex items-center gap-0.5 font-medium px-1.5 py-0.5 rounded",
              isPositive 
                ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 dark:text-emerald-400" 
                : "text-rose-600 bg-rose-50 dark:bg-rose-950/30 dark:text-rose-400"
            )}>
              {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {Math.abs(trend)}%
            </span>
          )}
          {subtext && (
            <span className="text-muted-foreground">{subtext}</span>
          )}
        </div>
      </div>
    </div>
  )
}

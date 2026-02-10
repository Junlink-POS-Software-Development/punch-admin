'use client'

import React from 'react'
import { useDashboardStore, DateRangePreset } from '../store'
import { Calendar, ChevronDown, Store } from 'lucide-react'
import { format } from 'date-fns'

export const FilterHeader = () => {
  const { 
    selectedBranch, 
    setSelectedBranch, 
    preset, 
    setDateRange, 
    dateRange 
  } = useDashboardStore()

  // Mock branches
  const branches = [
    { id: 'ALL', name: 'All Stores' },
    { id: '1', name: 'Ayala Malls Cloverleaf' },
    { id: '2', name: 'SM North Edsa' },
  ]

  const presets: { id: DateRangePreset; label: string }[] = [
    { id: 'today', label: 'Today' },
    { id: 'last7days', label: 'Last 7 Days' },
    { id: 'thisMonth', label: 'This Month' },
    // Custom range implementation would go here, simplified for now
  ]

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-background/50 backdrop-blur-sm p-4 border-b sticky top-0 z-10">
      <div />{/* Spacer or empty div if flex alignment needs it, or just remove content */}

      <div className="flex flex-wrap items-center gap-2">
        {/* Branch Selector */}
        <div className="relative">
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="appearance-none bg-card hover:bg-accent border border-border rounded-lg pl-10 pr-8 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary transition-all cursor-pointer"
          >
            {branches.map(branch => (
              <option key={branch.id} value={branch.id}>
                {branch.name}
              </option>
            ))}
          </select>
          <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        </div>

        <div className="h-6 w-px bg-border mx-2 hidden md:block" />

        {/* Date Presets */}
        <div className="bg-card border border-border rounded-lg p-1 flex items-center gap-1">
          {presets.map((p) => (
            <button
              key={p.id}
              onClick={() => setDateRange(p.id)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                preset === p.id
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              }`}
            >
              {p.label}
            </button>
          ))}
          
          <button
             onClick={() => alert("Custom range picker would open here")}
             className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors ${
                preset === 'custom' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
             }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Custom</span>
          </button>
        </div>
        
        {/* Active Range Display */}
        <div className="hidden lg:flex items-center gap-2 text-xs text-muted-foreground bg-muted/30 px-3 py-2 rounded-md border border-border/50">
            <span className="font-medium text-foreground">{dateRange.label}:</span>
            <span>
                {format(dateRange.from, 'MMM d')} - {format(dateRange.to, 'MMM d, yyyy')}
            </span>
        </div>
      </div>
    </div>
  )
}

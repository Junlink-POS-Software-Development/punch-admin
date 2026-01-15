'use client'

import { useDashboardStore } from '@/app/stores/dashboardStore'
import { format } from 'date-fns'
import { Calendar as CalendarIcon } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils/cn'

export function Calendar() {
  const { dateRange, setDateRange } = useDashboardStore()
  const [isOpen, setIsOpen] = useState(false)
  const popoverRef = useRef<HTMLDivElement>(null)

  const handleFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value ? new Date(e.target.value) : new Date()
    setDateRange({ ...dateRange, from: date })
  }

  const handleToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value ? new Date(e.target.value) : new Date()
    setDateRange({ ...dateRange, to: date })
  }

  // Close popover when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <div className="relative" ref={popoverRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg hover:bg-muted transition-colors"
        aria-label="Toggle date filter"
      >
        <CalendarIcon className="h-4 w-4 text-muted-foreground" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 z-50 bg-card border border-border rounded-lg shadow-lg p-4 w-auto min-w-[300px] animate-in fade-in zoom-in-95 duration-200">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Start Date</label>
              <div className="relative">
                <input
                  type="date"
                  value={format(dateRange.from, 'yyyy-MM-dd')}
                  onChange={handleFromChange}
                  className={cn(
                    "w-full bg-background border border-input rounded-md px-3 py-2 text-sm",
                    "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary",
                    "dark:[color-scheme:dark]"
                  )}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">End Date</label>
              <div className="relative">
                <input
                  type="date"
                  value={format(dateRange.to, 'yyyy-MM-dd')}
                  onChange={handleToChange}
                  className={cn(
                    "w-full bg-background border border-input rounded-md px-3 py-2 text-sm",
                    "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary",
                    "dark:[color-scheme:dark]"
                  )}
                />
              </div>
            </div>
            <div className="pt-2 border-t border-border">
              <p className="text-xs text-center text-muted-foreground">
                Filtering data from {format(dateRange.from, 'MMM d')} to {format(dateRange.to, 'MMM d')}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

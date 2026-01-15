import { create } from 'zustand'
import { startOfMonth, endOfMonth } from 'date-fns'

interface DateRange {
  from: Date
  to: Date
}

interface DashboardState {
  dateRange: DateRange
  setDateRange: (range: DateRange) => void
}

export const useDashboardStore = create<DashboardState>((set) => ({
  dateRange: {
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  },
  setDateRange: (range) => set({ dateRange: range }),
}))

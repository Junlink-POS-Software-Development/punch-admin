import { create } from 'zustand'
import { startOfDay, endOfDay, subDays, startOfMonth, endOfMonth } from 'date-fns'

export type DateRangePreset = 'today' | 'last7days' | 'thisMonth' | 'custom'

interface DateRange {
  from: Date
  to: Date
  label: string
}

interface DashboardState {
  selectedBranch: string // 'ALL' or specific branch ID
  dateRange: DateRange
  preset: DateRangePreset
  
  setSelectedBranch: (branchId: string) => void
  setDateRange: (preset: DateRangePreset, customRange?: { from: Date; to: Date }) => void
}

export const useDashboardStore = create<DashboardState>((set) => ({
  selectedBranch: 'ALL',
  preset: 'today',
  dateRange: {
    from: startOfDay(new Date()),
    to: endOfDay(new Date()),
    label: 'Today',
  },

  setSelectedBranch: (branchId) => set({ selectedBranch: branchId }),

  setDateRange: (preset, customRange) => {
    const today = new Date()
    let range: DateRange

    switch (preset) {
      case 'today':
        range = {
          from: startOfDay(today),
          to: endOfDay(today),
          label: 'Today',
        }
        break
      case 'last7days':
        range = {
          from: startOfDay(subDays(today, 6)),
          to: endOfDay(today),
          label: 'Last 7 Days',
        }
        break
      case 'thisMonth':
        range = {
          from: startOfMonth(today),
          to: endOfMonth(today),
          label: 'This Month',
        }
        break
      case 'custom':
        if (!customRange) throw new Error('Custom range requires from and to dates')
        range = {
          from: customRange.from,
          to: customRange.to,
          label: 'Custom Range',
        }
        break
      default:
        range = {
          from: startOfDay(today),
          to: endOfDay(today),
          label: 'Today',
        }
    }

    set({ preset, dateRange: range })
  },
}))

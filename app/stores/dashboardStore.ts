import { create } from 'zustand'
import { startOfDay, endOfDay, subDays, startOfMonth } from 'date-fns'

export type DatePreset = 'today' | '7d' | 'month' | 'custom'

interface DateRange {
  from: Date
  to: Date
}

interface DashboardState {
  selectedBranch: string
  datePreset: DatePreset
  dateRange: DateRange
  setBranch: (branch: string) => void
  setPreset: (preset: DatePreset) => void
  setCustomRange: (range: DateRange) => void
}

function getDateRangeForPreset(preset: DatePreset): DateRange {
  const now = new Date()
  switch (preset) {
    case 'today':
      return { from: startOfDay(now), to: endOfDay(now) }
    case '7d':
      return { from: startOfDay(subDays(now, 6)), to: endOfDay(now) }
    case 'month':
      return { from: startOfMonth(now), to: endOfDay(now) }
    default:
      return { from: startOfDay(now), to: endOfDay(now) }
  }
}

export const useDashboardStore = create<DashboardState>((set) => ({
  selectedBranch: 'all',
  datePreset: 'today',
  dateRange: getDateRangeForPreset('today'),

  setBranch: (branch) => set({ selectedBranch: branch }),

  setPreset: (preset) =>
    set({
      datePreset: preset,
      dateRange: getDateRangeForPreset(preset),
    }),

  setCustomRange: (range) =>
    set({
      datePreset: 'custom',
      dateRange: range,
    }),
}))

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { startOfDay, endOfDay, subDays, startOfMonth } from 'date-fns'

export type DatePreset = 'today' | '7d' | 'month' | 'custom' | 'single'

interface DateRange {
  from: string // ISO String for persistence
  to: string   // ISO String for persistence
}

interface DashboardState {
  selectedBranch: string
  datePreset: DatePreset
  dateRange: DateRange
  setBranch: (branch: string) => void
  setPreset: (preset: DatePreset) => void
  setCustomRange: (range: { from: Date; to: Date }, preset?: DatePreset) => void
}

function getDateRangeForPreset(preset: DatePreset): DateRange {
  const now = new Date()
  let range: { from: Date; to: Date }
  switch (preset) {
    case 'today':
      range = { from: startOfDay(now), to: endOfDay(now) }
      break
    case '7d':
      range = { from: startOfDay(subDays(now, 6)), to: endOfDay(now) }
      break
    case 'month':
      range = { from: startOfMonth(now), to: endOfDay(now) }
      break
    case 'single':
      range = { from: startOfDay(now), to: endOfDay(now) }
      break
    default:
      range = { from: startOfDay(now), to: endOfDay(now) }
  }
  return {
    from: range.from.toISOString(),
    to: range.to.toISOString(),
  }
}

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set) => ({
      selectedBranch: 'all',
      datePreset: 'today',
      dateRange: getDateRangeForPreset('today'),

      setBranch: (branch) => set({ selectedBranch: branch }),

      setPreset: (preset) =>
        set({
          datePreset: preset,
          dateRange: getDateRangeForPreset(preset),
        }),

      setCustomRange: (range, preset = 'custom') =>
        set({
          datePreset: preset,
          dateRange: {
            from: range.from.toISOString(),
            to: range.to.toISOString(),
          },
        }),
    }),
    {
      name: 'dashboard-storage',
    }
  )
)

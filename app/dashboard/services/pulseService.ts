import { SupabaseClient } from '@supabase/supabase-js'
import { parseISO, format, differenceInDays, subDays, subMonths } from 'date-fns'
import { getFinancialMetrics } from './dashboardService'

export interface PreviousPeriodRange {
  prevStart: string
  prevEnd: string
  label: string
}

export function getPreviousPeriodRange(
  startDateStr: string,
  endDateStr: string,
  preset?: string
): PreviousPeriodRange {
  const start = parseISO(startDateStr)
  const end = parseISO(endDateStr)

  if (preset === 'today' || startDateStr === endDateStr) {
    const prevDate = subDays(start, 1)
    const formatted = format(prevDate, 'yyyy-MM-dd')
    return { prevStart: formatted, prevEnd: formatted, label: 'vs yesterday' }
  }

  if (preset === '7d') {
    const prevEnd = subDays(start, 1)
    const prevStart = subDays(prevEnd, 6)
    return {
      prevStart: format(prevStart, 'yyyy-MM-dd'),
      prevEnd: format(prevEnd, 'yyyy-MM-dd'),
      label: 'vs prior 7 days',
    }
  }

  if (preset === 'month') {
    const prevStart = subMonths(start, 1)
    const prevEnd = subMonths(end, 1)
    return {
      prevStart: format(prevStart, 'yyyy-MM-dd'),
      prevEnd: format(prevEnd, 'yyyy-MM-dd'),
      label: 'vs prior month',
    }
  }

  // Arbitrary custom range
  const dayCount = Math.max(1, differenceInDays(end, start) + 1)
  const prevEnd = subDays(start, 1)
  const prevStart = subDays(prevEnd, dayCount - 1)
  return {
    prevStart: format(prevStart, 'yyyy-MM-dd'),
    prevEnd: format(prevEnd, 'yyyy-MM-dd'),
    label: `vs prior ${dayCount}d`,
  }
}

export function computePercentageDelta(current: number, previous: number): number | undefined {
  if (previous === 0) {
    if (current > 0) return 100
    if (current === 0) return 0
    return -100
  }
  const delta = ((current - previous) / Math.abs(previous)) * 100
  return Number(delta.toFixed(1))
}

export async function fetchPeakHour(
  supabase: SupabaseClient,
  storeId: string | null,
  startDate: string,
  endDate: string
): Promise<string> {
  try {
    let query = supabase
      .from('transactions')
      .select('transaction_time')
      .gte('transaction_time', `${startDate} 00:00:00`)
      .lte('transaction_time', `${endDate} 23:59:59`)
      .limit(3000)

    if (storeId) {
      query = query.eq('store_id', storeId)
    }

    const { data, error } = await query

    if (error || !data || data.length === 0) {
      return 'N/A'
    }

    const hourCountMap = new Map<number, number>()
    for (const row of data as any[]) {
      if (!row.transaction_time) continue
      const d = new Date(row.transaction_time)
      const hour = d.getHours()
      hourCountMap.set(hour, (hourCountMap.get(hour) || 0) + 1)
    }

    if (hourCountMap.size === 0) return 'N/A'

    let peakHour = 0
    let maxCount = -1

    for (const [hour, count] of hourCountMap.entries()) {
      if (count > maxCount) {
        maxCount = count
        peakHour = hour
      }
    }

    const period = peakHour >= 12 ? 'PM' : 'AM'
    const displayHour = peakHour % 12 === 0 ? 12 : peakHour % 12
    return `${displayHour} ${period}`
  } catch (err) {
    console.error('[fetchPeakHour] Error:', err)
    return 'N/A'
  }
}

export async function fetchPulseTrends(
  supabase: SupabaseClient,
  storeId: string | null,
  startDate: string,
  endDate: string,
  preset?: string
) {
  const previousRange = getPreviousPeriodRange(startDate, endDate, preset)

  const [prevMetrics, peakHour] = await Promise.all([
    getFinancialMetrics(supabase, storeId, previousRange.prevStart, previousRange.prevEnd),
    fetchPeakHour(supabase, storeId, startDate, endDate),
  ])

  return {
    previousMetrics: prevMetrics,
    comparisonLabel: previousRange.label,
    peakHour,
  }
}

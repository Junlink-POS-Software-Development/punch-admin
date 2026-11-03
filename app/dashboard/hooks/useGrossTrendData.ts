import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { useDashboardStore } from '../../stores/dashboardStore'

export interface RawDailyStat {
  date: string
  grossSales: number
}

export interface RawDailyStoreStat {
  date: string
  storeId: string
  grossSales: number
}

export interface RawHourlyStat {
  hour: number
  grossSales: number
}

export interface RawHourlyStoreStat {
  hour: number
  storeId: string
  grossSales: number
}

const PAGE_SIZE = 1000

// Helper to get Manila (UTC+8) hour (0-23) from an ISO timestamp string
function getManilaHour(isoStr: string): number {
  const d = new Date(isoStr)
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Manila',
    hour: 'numeric',
    hour12: false,
  }).formatToParts(d)
  const hrPart = parts.find((p) => p.type === 'hour')?.value
  const hr = Number(hrPart ?? d.getHours())
  return hr === 24 ? 0 : hr
}

// ── Daily stats (Single-store or aggregated "all") ───────────
// Reads from daily_store_stats (pre-computed, kept in sync by DB trigger)
async function fetchDailyStats(
  storeId: string | null,
  startDateStr: string,
  endDateStr: string,
  activeStoreIds?: string[]
): Promise<RawDailyStat[]> {
  const supabase = createClient()
  const allRows: { date: string; total_gross_sales: number }[] = []
  let from = 0

  while (true) {
    let query = supabase
      .from('daily_store_stats')
      .select('date, total_gross_sales')
      .gte('date', startDateStr)
      .lte('date', endDateStr)
      .order('date', { ascending: true })
      .order('id', { ascending: true })
      .range(from, from + PAGE_SIZE - 1)

    if (storeId) {
      query = query.eq('store_id', storeId)
    } else if (activeStoreIds && activeStoreIds.length > 0) {
      query = query.in('store_id', activeStoreIds)
    }

    const { data, error } = await query

    if (error) {
      console.error('[useGrossTrendData] Error:', error)
      break
    }

    const rows = (data || []) as { date: string; total_gross_sales: number }[]
    allRows.push(...rows)

    if (rows.length < PAGE_SIZE) break
    from += PAGE_SIZE
  }

  const dateMap = new Map<string, number>()

  for (const row of allRows) {
    const date = row.date as string
    const gs = Number(row.total_gross_sales || 0)
    const existing = dateMap.get(date) || 0
    dateMap.set(date, existing + gs)
  }

  return Array.from(dateMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, grossSales]) => ({ date, grossSales }))
}

// ── Daily stats (Per-store breakdown) ─────────────────────────
// Reads from daily_store_stats (pre-computed, kept in sync by DB trigger)
async function fetchPerStoreDailyStats(
  startDateStr: string,
  endDateStr: string,
  activeStoreIds?: string[]
): Promise<RawDailyStoreStat[]> {
  const supabase = createClient()
  const allRows: { date: string; store_id: string; total_gross_sales: number }[] = []
  let from = 0

  while (true) {
    let query = supabase
      .from('daily_store_stats')
      .select('date, store_id, total_gross_sales')
      .gte('date', startDateStr)
      .lte('date', endDateStr)
      .order('date', { ascending: true })
      .order('id', { ascending: true })
      .range(from, from + PAGE_SIZE - 1)

    if (activeStoreIds && activeStoreIds.length > 0) {
      query = query.in('store_id', activeStoreIds)
    }

    const { data, error } = await query

    if (error) {
      console.error('[useGrossTrendData] Per-store error:', error)
      break
    }

    const rows = (data || []) as { date: string; store_id: string; total_gross_sales: number }[]
    allRows.push(...rows)

    if (rows.length < PAGE_SIZE) break
    from += PAGE_SIZE
  }

  return allRows.map((row) => ({
    date: row.date as string,
    storeId: row.store_id as string,
    grossSales: Number(row.total_gross_sales || 0),
  }))
}

// ── Hourly stats (Single-store or aggregated "all") ──────────
async function fetchHourlyStats(
  storeId: string | null,
  targetDateStr: string,
  activeStoreIds?: string[]
): Promise<RawHourlyStat[]> {
  const supabase = createClient()

  const startIso = `${targetDateStr}T00:00:00+08:00`
  const endIso = `${targetDateStr}T23:59:59.999+08:00`

  let txQuery = supabase
    .from('transactions')
    .select('transaction_time, total_price')
    .gte('transaction_time', startIso)
    .lte('transaction_time', endIso)

  let payQuery = supabase
    .from('payments')
    .select('transaction_time, voucher')
    .gte('transaction_time', startIso)
    .lte('transaction_time', endIso)
    .gt('voucher', 0)

  if (storeId) {
    txQuery = txQuery.eq('store_id', storeId)
    payQuery = payQuery.eq('store_id', storeId)
  } else if (activeStoreIds && activeStoreIds.length > 0) {
    txQuery = txQuery.in('store_id', activeStoreIds)
    payQuery = payQuery.in('store_id', activeStoreIds)
  }

  const [{ data: txData, error: txError }, { data: payData, error: payError }] = await Promise.all([
    txQuery,
    payQuery,
  ])

  if (txError) {
    console.error('[useHourlyGrossTrendData] Error:', txError)
    return []
  }
  if (payError) {
    console.error('[useHourlyGrossTrendData] Voucher query error:', payError)
  }

  const hourMap = new Map<number, number>()

  for (const row of (txData || []) as any[]) {
    if (!row.transaction_time) continue
    const hour = getManilaHour(row.transaction_time)
    const val = Number(row.total_price || 0)
    const existing = hourMap.get(hour) || 0
    hourMap.set(hour, existing + val)
  }

  for (const row of (payData || []) as any[]) {
    if (!row.transaction_time) continue
    const hour = getManilaHour(row.transaction_time)
    const voucher = Number(row.voucher || 0)
    if (voucher > 0) {
      const existing = hourMap.get(hour) || 0
      hourMap.set(hour, Math.max(0, existing - voucher))
    }
  }

  return Array.from(hourMap.entries())
    .sort(([a], [b]) => a - b)
    .map(([hour, grossSales]) => ({ hour, grossSales }))
}

// ── Hourly stats (Per-store breakdown) ───────────────────────
async function fetchPerStoreHourlyStats(
  targetDateStr: string,
  activeStoreIds?: string[]
): Promise<RawHourlyStoreStat[]> {
  const supabase = createClient()

  const startIso = `${targetDateStr}T00:00:00+08:00`
  const endIso = `${targetDateStr}T23:59:59.999+08:00`

  let txQuery = supabase
    .from('transactions')
    .select('transaction_time, store_id, total_price')
    .gte('transaction_time', startIso)
    .lte('transaction_time', endIso)

  let payQuery = supabase
    .from('payments')
    .select('transaction_time, store_id, voucher')
    .gte('transaction_time', startIso)
    .lte('transaction_time', endIso)
    .gt('voucher', 0)

  if (activeStoreIds && activeStoreIds.length > 0) {
    txQuery = txQuery.in('store_id', activeStoreIds)
    payQuery = payQuery.in('store_id', activeStoreIds)
  }

  const [{ data: txData, error: txError }, { data: payData, error: payError }] = await Promise.all([
    txQuery,
    payQuery,
  ])

  if (txError) {
    console.error('[useMultiStoreHourlyGrossTrendData] Error:', txError)
    return []
  }
  if (payError) {
    console.error('[useMultiStoreHourlyGrossTrendData] Voucher query error:', payError)
  }

  const map = new Map<string, number>()

  for (const row of (txData || []) as any[]) {
    if (!row.transaction_time || !row.store_id) continue
    const hour = getManilaHour(row.transaction_time)
    const sid = row.store_id
    const val = Number(row.total_price || 0)
    const key = `${hour}|${sid}`
    const existing = map.get(key) || 0
    map.set(key, existing + val)
  }

  for (const row of (payData || []) as any[]) {
    if (!row.transaction_time || !row.store_id) continue
    const hour = getManilaHour(row.transaction_time)
    const sid = row.store_id
    const voucher = Number(row.voucher || 0)
    if (voucher > 0) {
      const key = `${hour}|${sid}`
      const existing = map.get(key) || 0
      map.set(key, Math.max(0, existing - voucher))
    }
  }

  return Array.from(map.entries())
    .map(([key, grossSales]) => {
      const [hrStr, storeId] = key.split('|')
      return { hour: Number(hrStr), storeId, grossSales }
    })
    .sort((a, b) => a.hour - b.hour)
}

// ── Hooks ───────────────────────────────────────────────────
export function useGrossTrendData(startDateStr: string, endDateStr: string, activeStoreIds?: string[]) {
  const { selectedBranch } = useDashboardStore()
  const storeId = selectedBranch === 'all' ? null : selectedBranch

  return useQuery({
    queryKey: ['gross-trend-daily', storeId, startDateStr, endDateStr, activeStoreIds],
    queryFn: () => fetchDailyStats(storeId, startDateStr, endDateStr, activeStoreIds),
    enabled: !!selectedBranch && !!startDateStr && !!endDateStr,
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  })
}

export function useMultiStoreGrossTrendData(startDateStr: string, endDateStr: string, activeStoreIds?: string[]) {
  return useQuery({
    queryKey: ['gross-trend-daily-per-store', startDateStr, endDateStr, activeStoreIds],
    queryFn: () => fetchPerStoreDailyStats(startDateStr, endDateStr, activeStoreIds),
    enabled: !!startDateStr && !!endDateStr,
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  })
}

export function useHourlyGrossTrendData(targetDateStr: string, activeStoreIds?: string[]) {
  const { selectedBranch } = useDashboardStore()
  const storeId = selectedBranch === 'all' ? null : selectedBranch

  return useQuery({
    queryKey: ['gross-trend-hourly', storeId, targetDateStr, activeStoreIds],
    queryFn: () => fetchHourlyStats(storeId, targetDateStr, activeStoreIds),
    enabled: !!selectedBranch && !!targetDateStr,
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  })
}

export function useMultiStoreHourlyGrossTrendData(targetDateStr: string, activeStoreIds?: string[]) {
  return useQuery({
    queryKey: ['gross-trend-hourly-per-store', targetDateStr, activeStoreIds],
    queryFn: () => fetchPerStoreHourlyStats(targetDateStr, activeStoreIds),
    enabled: !!targetDateStr,
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  })
}

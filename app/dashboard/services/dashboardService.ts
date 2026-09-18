import { SupabaseClient } from '@supabase/supabase-js'
import type { FinancialMetrics } from '../types'

interface DashboardMetricsRow {
  gross_sales: number;
  net_sales: number;
  net_profit: number;
  transaction_count: number;
  average_order_value: number;
  available_cash: number;
  total_expenses: number;
}

export async function getFinancialMetrics(
  supabase: SupabaseClient,
  storeId: string | null | undefined,
  startDate: string,
  endDate: string,
  datePreset?: string
): Promise<FinancialMetrics | null> {
  const normalizedStoreId = (!storeId || storeId === '' || storeId === 'null') ? null : storeId;

  const { data: metrics, error: metricsError } = await supabase
    .rpc('get_dashboard_metrics', { 
      p_store_id: normalizedStoreId, 
      p_start_date: startDate, 
      p_end_date: endDate 
    })
    .returns<DashboardMetricsRow[]>()
    .maybeSingle();

  if (metricsError) {
    console.error('[dashboardService] Error calling get_dashboard_metrics:', metricsError);
    return null;
  }

  if (!metrics) {
    return null;
  }

  return {
    gross_sales: Number(metrics.gross_sales || 0),
    net_sales: Number(metrics.net_sales || 0),
    net_profit: Number(metrics.net_profit || 0),
    transaction_count: Number(metrics.transaction_count || 0),
    average_order_value: Number(metrics.average_order_value || 0),
    available_cash: Number(metrics.available_cash || 0),
    total_expenses: Number(metrics.total_expenses || 0),
    total_remittance: 0, 
    period_cash_flow: 0, 
    debug_start: startDate,
    debug_end: endDate,
  };
}

export interface CashPositionData {
  availableCash: number
  openingBalance: number
  totalCashIn: number
  totalCashOut: number
  netCashFlow: number
  asOfDate: string
}

export async function getAvailableCashPosition(
  supabase: SupabaseClient,
  storeId: string | null | undefined,
  startDate: string,
  endDate: string
): Promise<CashPositionData> {
  const normalizedStoreId = (!storeId || storeId === '' || storeId === 'all') ? null : storeId;

  if (normalizedStoreId) {
    // 1. Single Store
    const [priorRes, rangeRes, latestRes] = await Promise.all([
      supabase
        .from('overall_cash_flow')
        .select('balance')
        .eq('store_id', normalizedStoreId)
        .lt('date', startDate)
        .order('date', { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from('overall_cash_flow')
        .select('cash_in, cash_out')
        .eq('store_id', normalizedStoreId)
        .gte('date', startDate)
        .lte('date', endDate),
      supabase
        .from('overall_cash_flow')
        .select('balance')
        .eq('store_id', normalizedStoreId)
        .lte('date', endDate)
        .order('date', { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

    const openingBalance = Number(priorRes.data?.balance || 0);
    const totalCashIn = (rangeRes.data || []).reduce((sum, r) => sum + Number(r.cash_in || 0), 0);
    const totalCashOut = (rangeRes.data || []).reduce((sum, r) => sum + Number(r.cash_out || 0), 0);
    const availableCash = Number(latestRes.data?.balance ?? (openingBalance + totalCashIn - totalCashOut));

    return {
      availableCash,
      openingBalance,
      totalCashIn,
      totalCashOut,
      netCashFlow: totalCashIn - totalCashOut,
      asOfDate: endDate,
    };
  }

  // 2. All Stores
  const { data: stores, error: storesError } = await supabase
    .from('stores')
    .select('store_id')
    .is('deleted_at', null);

  if (storesError || !stores || stores.length === 0) {
    return {
      availableCash: 0,
      openingBalance: 0,
      totalCashIn: 0,
      totalCashOut: 0,
      netCashFlow: 0,
      asOfDate: endDate,
    };
  }

  const storeCalculations = await Promise.all(
    stores.map(async (s) => {
      const [priorRes, rangeRes, latestRes] = await Promise.all([
        supabase
          .from('overall_cash_flow')
          .select('balance')
          .eq('store_id', s.store_id)
          .lt('date', startDate)
          .order('date', { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase
          .from('overall_cash_flow')
          .select('cash_in, cash_out')
          .eq('store_id', s.store_id)
          .gte('date', startDate)
          .lte('date', endDate),
        supabase
          .from('overall_cash_flow')
          .select('balance')
          .eq('store_id', s.store_id)
          .lte('date', endDate)
          .order('date', { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);

      const opening = Number(priorRes.data?.balance || 0);
      const cin = (rangeRes.data || []).reduce((sum, r) => sum + Number(r.cash_in || 0), 0);
      const cout = (rangeRes.data || []).reduce((sum, r) => sum + Number(r.cash_out || 0), 0);
      const ending = Number(latestRes.data?.balance ?? (opening + cin - cout));

      return { opening, cin, cout, ending };
    })
  );

  let totalOpening = 0;
  let totalIn = 0;
  let totalOut = 0;
  let totalEnding = 0;

  for (const sc of storeCalculations) {
    totalOpening += sc.opening;
    totalIn += sc.cin;
    totalOut += sc.cout;
    totalEnding += sc.ending;
  }

  return {
    availableCash: totalEnding,
    openingBalance: totalOpening,
    totalCashIn: totalIn,
    totalCashOut: totalOut,
    netCashFlow: totalIn - totalOut,
    asOfDate: endDate,
  };
}

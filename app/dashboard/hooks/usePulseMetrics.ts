'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { useDashboardStore } from '@/app/stores/dashboardStore'
import { useFinancialMetrics } from './useFinancialMetrics'
import { fetchPulseTrends, computePercentageDelta } from '../services/pulseService'

export function usePulseMetrics() {
  const { selectedBranch, dateRange, datePreset } = useDashboardStore()
  const { data: currentMetrics, isLoading: isCurrentLoading, refetch: refetchCurrent, isFetching: isCurrentFetching } = useFinancialMetrics()
  const supabase = createClient()

  const startDate = dateRange.from
  const endDate = dateRange.to
  const storeId = (!selectedBranch || selectedBranch === 'all') ? null : selectedBranch

  const { data: trendData, isLoading: isTrendLoading, refetch: refetchTrends, isFetching: isTrendFetching } = useQuery({
    queryKey: ['pulse-trends', storeId, startDate, endDate, datePreset],
    queryFn: () => fetchPulseTrends(supabase, storeId, startDate, endDate, datePreset),
    enabled: !!selectedBranch && !!startDate && !!endDate,
    staleTime: 30_000,
    refetchInterval: 30_000,
  })

  const prev = trendData?.previousMetrics

  const grossSales = currentMetrics?.gross_sales ?? 0
  const netSales = currentMetrics?.net_sales ?? 0
  const netProfit = currentMetrics?.net_profit ?? 0
  const transactionCount = currentMetrics?.transaction_count ?? 0
  const aov = currentMetrics?.average_order_value ?? 0
  const discounts = grossSales - netSales

  const grossSalesTrend = prev ? computePercentageDelta(grossSales, prev.gross_sales) : undefined
  const netSalesTrend = prev ? computePercentageDelta(netSales, prev.net_sales) : undefined
  const netProfitTrend = prev ? computePercentageDelta(netProfit, prev.net_profit) : undefined
  const transactionTrend = prev ? computePercentageDelta(transactionCount, prev.transaction_count) : undefined
  const aovTrend = prev ? computePercentageDelta(aov, prev.average_order_value) : undefined

  return {
    isLoading: isCurrentLoading || isTrendLoading,
    isFetching: isCurrentFetching || isTrendFetching,
    refetch: () => {
      refetchCurrent()
      refetchTrends()
    },
    grossSales,
    netSales,
    discounts,
    netProfit,
    transactionCount,
    aov,
    grossSalesTrend,
    netSalesTrend,
    netProfitTrend,
    transactionTrend,
    aovTrend,
    peakHour: trendData?.peakHour || 'N/A',
    comparisonLabel: trendData?.comparisonLabel || 'vs prev. period',
    hasRealData: !!currentMetrics,
  }
}

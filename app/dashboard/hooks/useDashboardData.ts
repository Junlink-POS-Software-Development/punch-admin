import { useQuery } from '@tanstack/react-query'
import { useDashboardStore } from '../store'

// Mock Data Types
export interface DashboardStats {
  grossSales: number
  netProfit: number
  transactionCount: number
  averageOrderValue: number
  trends: {
    grossSales: number
    netProfit: number
    transactionCount: number
    averageOrderValue: number
  }
  busiestHour: string
  liquidity: {
    availableCash: number
    breakdown: {
      netProfit: number
      cogs: number
      operatingExpenses: number
      ownerDrawings: number
    }
  }
  paymentMethods: { name: string; value: number; color: string }[]
  topSellers: { name: string; profitContribution: number; volume: number }[]
  mostStocked: { name: string; count: number; value: number }[]
}

// Mock Data Generator
const generateMockData = (branch: string, dateLabel: string): DashboardStats => {
  // Simulate different data based on filters to show interactivity
  const multiplier = branch === 'ALL' ? 1.0 : 0.4
  const dateMultiplier = dateLabel === 'Today' ? 1 : dateLabel === 'Last 7 Days' ? 7 : 30
  
  const grossSales = 15450 * multiplier * dateMultiplier
  const discounts = 450 * multiplier * dateMultiplier
  // Net Profit Calculation: (Sales - Discounts) - (COGS + OpEx)
  // Let's assume some margins
  const cogs = grossSales * 0.4 // 40% COGS
  const operatingExpenses = 2500 * multiplier * dateMultiplier
  
  const netProfit = (grossSales - discounts) - (cogs + operatingExpenses)
  
  // Liquidity: (Business Balance + Net Profit) - Owner Withdrawals
  // Business Balance is accumulated, but for this view let's mock "Available Cash"
  // Actually, standard liquidity is a snapshot, but based on the formula:
  // "Available Cash = (Business Balance + Net Profit) - Owner Withdrawals"
  // We'll mock a starting balance + the period's profit
  const startingBalance = 50000 
  const ownerDrawings = 5000 * multiplier // Withdrawals are not scaled by date strictly in this simple mock, but let's just make it proportional
  const availableCash = (startingBalance + netProfit) - ownerDrawings

  return {
    grossSales,
    netProfit,
    transactionCount: Math.floor(142 * multiplier * dateMultiplier),
    averageOrderValue: (grossSales / (142 * multiplier * dateMultiplier)) || 0,
    trends: {
      grossSales: 12.5,
      netProfit: 8.2,
      transactionCount: 5.4,
      averageOrderValue: -2.1,
    },
    busiestHour: '2:00 PM',
    liquidity: {
      availableCash,
      breakdown: {
        netProfit,
        cogs,
        operatingExpenses,
        ownerDrawings,
      },
    },
    paymentMethods: [
      { name: 'Cash', value: 45, color: '#10b981' }, // emerald-500
      { name: 'GCash', value: 30, color: '#3b82f6' }, // blue-500
      { name: 'Maya', value: 15, color: '#8b5cf6' }, // violet-500
      { name: 'Card', value: 10, color: '#f59e0b' }, // amber-500
    ],
    topSellers: [
      { name: 'Signature Brewed Coffee', profitContribution: 12500, volume: 150 },
      { name: 'Hazelnut Latte', profitContribution: 8400, volume: 98 },
      { name: 'Ham & Cheese Croissant', profitContribution: 6200, volume: 45 },
      { name: 'Iced Americano', profitContribution: 5100, volume: 110 },
      { name: 'Blueberry Muffin', profitContribution: 3200, volume: 30 },
    ],
    mostStocked: [
      { name: 'Arabica Coffee Beans', count: 50, value: 25000 },
      { name: 'Milk Cartons (1L)', count: 120, value: 10800 },
      { name: 'Paper Cups (12oz)', count: 500, value: 2500 },
      { name: 'Sugar Packets', count: 1000, value: 500 },
      { name: 'Vanilla Syrup', count: 20, value: 8000 },
    ],
  }
}

export const useDashboardData = () => {
  const { selectedBranch, dateRange, preset } = useDashboardStore()

  return useQuery({
    queryKey: ['dashboard-stats', selectedBranch, preset, dateRange.label],
    queryFn: async () => {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 800))
      return generateMockData(selectedBranch, dateRange.label)
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

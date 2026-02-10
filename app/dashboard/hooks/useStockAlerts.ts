import { useQuery } from '@tanstack/react-query'
import { useDashboardStore } from '../store'

export interface StockAlert {
  id: string
  name: string
  currentStock: number
  reorderPoint: number
  unit: string
}

const mockAlerts: StockAlert[] = [
  { id: '1', name: 'Almond Milk', currentStock: 2, reorderPoint: 5, unit: 'cartons' },
  { id: '2', name: 'Caramel Synergy', currentStock: 1, reorderPoint: 3, unit: 'bottles' },
  { id: '3', name: 'Straws (Regular)', currentStock: 45, reorderPoint: 100, unit: 'pcs' },
  { id: '4', name: 'Napkins', currentStock: 80, reorderPoint: 150, unit: 'packs' },
]

export const useStockAlerts = () => {
  const { selectedBranch } = useDashboardStore()

  return useQuery({
    queryKey: ['stock-alerts', selectedBranch],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 500))
      // Randomly shuffle or filter for demo effect
      return selectedBranch === 'ALL' 
        ? mockAlerts 
        : mockAlerts.slice(0, 2)
    },
    refetchInterval: 30000, // Live update every 30s
  })
}

export interface ActivityLog {
  id: string
  type: 'sale' | 'inventory' | 'expense' | 'payout'
  description: string
  amount?: number
  timestamp: string
}

const mockActivity: ActivityLog[] = [
  { id: '1', type: 'sale', description: 'Sale #1042', amount: 450.00, timestamp: '10:42 AM' },
  { id: '2', type: 'inventory', description: 'Restocked: Brewed Coffee +50 units', timestamp: '10:15 AM' },
  { id: '3', type: 'expense', description: 'Paid: Electricity Bill', amount: -2400.00, timestamp: '09:30 AM' },
  { id: '4', type: 'sale', description: 'Sale #1041', amount: 1250.00, timestamp: '09:12 AM' },
  { id: '5', type: 'payout', description: 'Owner Withdrawal', amount: -5000.00, timestamp: 'Yesterday' },
]

export const useRecentActivity = () => {
    const { selectedBranch } = useDashboardStore()
  
    return useQuery({
      queryKey: ['recent-activity', selectedBranch],
      queryFn: async () => {
        await new Promise((resolve) => setTimeout(resolve, 500))
        return mockActivity
      },
      refetchInterval: 15000, // Live update every 15s
    })
  }

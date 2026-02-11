'use client'

import { FilterHeader } from './components/FilterHeader'
import { StatsGrid } from './components/StatsGrid'
import { LiquiditySection } from './components/LiquiditySection'
import { ActionableGrid } from './components/ActionableGrid'
import { OperationsSection } from './components/OperationsSection'

export default function DashboardPage() {
  return (
    <div className="animate-fade-in">
      {/* Section 0: Filter Header */}
      <FilterHeader />

      <div className="space-y-6 mt-6">
        {/* Section 1: Top Pulse Row — 4 Stats */}
        <StatsGrid />

        {/* Section 2: Liquidity & Reconciliation */}
        <LiquiditySection />

        {/* Section 3: Actionable Data Grid */}
        <ActionableGrid />

        {/* Section 4: Operations & Feed */}
        <OperationsSection />
      </div>
    </div>
  )
}

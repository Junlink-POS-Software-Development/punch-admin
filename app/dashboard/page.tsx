'use client'

import React from 'react'
import { FilterHeader } from './components/FilterHeader'
import { StatsGrid } from './components/StatsGrid'
import { LiquiditySection } from './components/LiquiditySection'
import { ActionableGrid } from './components/ActionableGrid'
import { OperationsSection } from './components/OperationsSection'

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background pb-20 space-y-8 animate-in fade-in duration-500">
      
      {/* Section 0: Filter Header */}
      <FilterHeader />

      <main className="container mx-auto px-4 space-y-8">
        
        {/* Section 1: Pulse Stats */}
        <section>
          <StatsGrid />
        </section>

        {/* Section 2: Liquidity */}
        <section>
          <LiquiditySection />
        </section>

        {/* Section 3: Actionable Data */}
        <section>
          <ActionableGrid />
        </section>

        {/* Section 4: Operations */}
        <section>
          <OperationsSection />
        </section>

      </main>
    </div>
  )
}

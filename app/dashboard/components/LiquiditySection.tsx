'use client'

import React from 'react'
import { useDashboardData } from '../hooks/useDashboardData'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { Wallet, Info, TrendingDown, TrendingUp } from 'lucide-react'

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2
  }).format(val)
}

export const LiquiditySection = () => {
    const { data } = useDashboardData()

    if (!data) return null

    const remainingCash = data.liquidity.availableCash
    const breakdown = data.liquidity.breakdown

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cash Position Card (2/3 width) */}
            <div className="lg:col-span-2 bg-card border border-border rounded-xl p-6 flex flex-col">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <Wallet className="w-5 h-5 text-primary" />
                            Cash Position
                        </h3>
                        <p className="text-muted-foreground text-sm">
                            Real-time liquidity based on selected period
                        </p>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8 h-full">
                    {/* Big Value Display */}
                    <div className="flex flex-col justify-center space-y-2 p-6 bg-primary/5 rounded-xl border border-primary/10">
                        <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Available Cash</span>
                        <div className="text-4xl font-bold tracking-tight text-foreground">
                            {formatCurrency(remainingCash)}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Info className="w-4 h-4" />
                            <span>(Balance + Net Profit) - Owner Drawings</span>
                        </div>
                    </div>

                    {/* Breakdown List */}
                    <div className="space-y-3 justify-center flex flex-col">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">Net Profit</span>
                            <span className="font-medium text-emerald-600 flex items-center gap-1">
                                <TrendingUp className="w-3 h-3" /> 
                                {formatCurrency(breakdown.netProfit)}
                            </span>
                        </div>
                        <div className="h-px bg-border/50" />
                        
                        {/* 
                          Visualizing the expenses that reduce Gross to Net is confusing here 
                          if we want to show how we got to "Cash".
                          The formula was: Available Cash = (Balance + Net Profit) - Withdrawals.
                          So displaying COGS/OpEx here might be misleading if they are ALREADY deduced from Net Profit.
                          Let's stick to showing the components of the "Available Cash" change.
                          Actually, let's just show the Owner Drawings subtraction prominently as requested.
                        */}
                        <div className="flex justify-between items-center text-sm">
                           <span className="text-muted-foreground">Owner Drawings</span>
                           <span className="font-medium text-rose-600 flex items-center gap-1">
                                <TrendingDown className="w-3 h-3" />
                                -{formatCurrency(breakdown.ownerDrawings)}
                           </span>
                        </div>

                         <div className="p-3 bg-muted/30 rounded-lg mt-2 text-xs text-muted-foreground">
                            <strong className="text-foreground">Note:</strong> COGS ({formatCurrency(breakdown.cogs)}) and OpEx ({formatCurrency(breakdown.operatingExpenses)}) have already been deducted from Net Profit.
                        </div>
                    </div>
                </div>
            </div>

            {/* Payment Method Mix (1/3 width) */}
            <div className="bg-card border border-border rounded-xl p-6 flex flex-col">
                <h3 className="text-lg font-semibold mb-6">Payment Methods</h3>
                <div className="flex-1 min-h-[200px] relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data.paymentMethods}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {data.paymentMethods.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                                ))}
                            </Pie>
                            <Tooltip 
                                formatter={(value: number | string | Array<number | string> | undefined) => [`${value}%`, 'Share']}
                                contentStyle={{ backgroundColor: 'var(--card)', borderRadius: '8px', border: '1px solid var(--border)' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                    {/* Centered value or label if desired, skipping for cleanliness */}
                </div>
                
                {/* Legend */}
                <div className="grid grid-cols-2 gap-2 mt-4">
                    {data.paymentMethods.map((method) => (
                        <div key={method.name} className="flex items-center gap-2 text-sm">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: method.color }} />
                            <span className="text-muted-foreground">{method.name}</span>
                            <span className="ml-auto font-medium">{method.value}%</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

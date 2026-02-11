'use client'

import { useDashboardData } from '../hooks/useDashboardData'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { Wallet, Info, TrendingDown, TrendingUp, ChevronDown, ChevronRight } from 'lucide-react'
import { useState } from 'react'

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2
  }).format(val)
}

export const LiquiditySection = () => {
    const { data } = useDashboardData()
    const [isNetProfitExpanded, setIsNetProfitExpanded] = useState(false)

    if (!data) return null

    const remainingCash = data.liquidity.availableCash
    const breakdown = data.liquidity.breakdown

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cash Position Card (2/3 width) */}
            <div className="lg:col-span-2 bg-card border border-border rounded-xl p-6 flex flex-col shadow-sm">
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
                    <div className="space-y-2 justify-center flex flex-col">
                        <div className="flex flex-col">
                            <button 
                                onClick={() => setIsNetProfitExpanded(!isNetProfitExpanded)}
                                className="flex justify-between items-center text-sm w-full p-2 -mx-2 rounded-lg transition-colors hover:bg-accent group active:scale-[0.98]"
                            >
                                <span className="text-muted-foreground flex items-center gap-1.5 font-medium group-hover:text-foreground">
                                    {isNetProfitExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                    Net Profit
                                </span>
                                <span className="font-bold text-emerald-600 flex items-center gap-1">
                                    <TrendingUp className="w-3.5 h-3.5" /> 
                                    {formatCurrency(breakdown.netProfit)}
                                </span>
                            </button>
                            
                            {isNetProfitExpanded && (
                                <div className="ml-6 mt-1 space-y-2 py-1 border-l-2 border-border/50 pl-4 animate-in slide-in-from-top-2 duration-200">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-muted-foreground">COGS</span>
                                        <span className="font-medium text-rose-500/80">
                                            -{formatCurrency(breakdown.cogs)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-muted-foreground">Operating Expenses</span>
                                        <span className="font-medium text-rose-500/80">
                                            -{formatCurrency(breakdown.operatingExpenses)}
                                        </span>
                                    </div>
                                    <div className="pt-2 border-t border-border/30 text-[10px] text-muted-foreground italic">
                                        Net Profit is calculated after deducting these from Gross Profit.
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="h-px bg-border/50" />
                        
                        <div className="flex justify-between items-center text-sm p-2 -mx-2">
                           <span className="text-muted-foreground font-medium">Owner Drawings</span>
                           <span className="font-bold text-rose-600 flex items-center gap-1">
                                <TrendingDown className="w-3.5 h-3.5" />
                                -{formatCurrency(breakdown.ownerDrawings)}
                           </span>
                        </div>

                         <div className="p-3 bg-muted/30 rounded-lg mt-1 text-[10px] text-muted-foreground leading-relaxed">
                            <span className="font-semibold text-foreground uppercase tracking-wider block mb-1">Calculation Logic</span>
                            Available Cash considers your store's total balance plus the net operations inflow for the period, minus any owner withdrawals.
                        </div>
                    </div>
                </div>
            </div>

            {/* Payment Method Mix (1/3 width) */}
            <div className="bg-card border border-border rounded-xl p-6 flex flex-col shadow-sm">
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
                                {data.paymentMethods.map((entry: any, index: number) => (
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
                    {data.paymentMethods.map((method: any) => (
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

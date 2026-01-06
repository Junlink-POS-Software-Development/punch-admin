'use client'

import { useState } from 'react'
import { CreditCard, Calculator, Save, ToggleLeft, ToggleRight } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

export default function SystemConfigPage() {
  const [settings, setSettings] = useState({
    autoBackup: true,
    emailNotifications: true,
    smsNotifications: false,
    lowStockAlerts: true,
    dailyReports: true,
  })

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">System Configuration</h1>
        <p className="text-muted-foreground">
          Configure payment gateways and accounting rules
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Payment Gateways */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <CreditCard className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Payment Gateways</h2>
              <p className="text-sm text-muted-foreground">Configure payment providers</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg border border-border">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-[#635BFF] flex items-center justify-center text-white font-bold text-sm">
                  X
                </div>
                <div>
                  <p className="font-medium text-foreground">Xendit</p>
                  <p className="text-sm text-success">Connected</p>
                </div>
              </div>
              <button className="text-sm text-primary hover:underline">Configure</button>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg border border-border">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground font-bold text-sm">
                  G
                </div>
                <div>
                  <p className="font-medium text-foreground">GCash</p>
                  <p className="text-sm text-muted-foreground">Not connected</p>
                </div>
              </div>
              <button className="text-sm text-primary hover:underline">Connect</button>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg border border-border">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground font-bold text-sm">
                  P
                </div>
                <div>
                  <p className="font-medium text-foreground">PayMaya</p>
                  <p className="text-sm text-muted-foreground">Not connected</p>
                </div>
              </div>
              <button className="text-sm text-primary hover:underline">Connect</button>
            </div>
          </div>
        </div>

        {/* Accounting Rules */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
              <Calculator className="h-5 w-5 text-warning" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Accounting Rules</h2>
              <p className="text-sm text-muted-foreground">Configure financial settings</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Tax Rate (%)
              </label>
              <input
                type="number"
                defaultValue="12"
                className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Fiscal Year Start
              </label>
              <select className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
                <option>January</option>
                <option>April</option>
                <option>July</option>
                <option>October</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Invoice Prefix
              </label>
              <input
                type="text"
                defaultValue="INV-"
                className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold text-foreground mb-6">System Preferences</h2>
        
        <div className="space-y-4">
          {Object.entries(settings).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between p-4 rounded-lg border border-border">
              <div>
                <p className="font-medium text-foreground capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </p>
                <p className="text-sm text-muted-foreground">
                  {key === 'autoBackup' && 'Automatically backup data daily'}
                  {key === 'emailNotifications' && 'Receive email alerts for important events'}
                  {key === 'smsNotifications' && 'Receive SMS alerts for critical issues'}
                  {key === 'lowStockAlerts' && 'Get notified when inventory is low'}
                  {key === 'dailyReports' && 'Receive daily sales summary reports'}
                </p>
              </div>
              <button
                onClick={() => toggleSetting(key as keyof typeof settings)}
                className={cn(
                  'transition-colors',
                  value ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                {value ? (
                  <ToggleRight className="h-8 w-8" />
                ) : (
                  <ToggleLeft className="h-8 w-8" />
                )}
              </button>
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-6 border-t border-border mt-6">
          <button className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
            <Save className="h-4 w-4" />
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  )
}

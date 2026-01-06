'use client'

import { Sidebar } from '@/components/layout/Sidebar'
import { TopBar } from '@/components/layout/TopBar'
import { useUIStore } from '@/lib/stores/uiStore'
import { cn } from '@/lib/utils/cn'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { sidebarCollapsed } = useUIStore()

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className={cn(
        'transition-all duration-300 ease-in-out',
        sidebarCollapsed ? 'ml-20' : 'ml-64'
      )}>
        <TopBar />
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

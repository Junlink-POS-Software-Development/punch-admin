'use client'

import { Sidebar } from '@/components/layout/Sidebar'
import { TopBar } from '@/components/layout/TopBar'
import { useUIStore } from '@/app/dashboard/stores/uiStore'
import { cn } from '@/lib/utils/cn'
import { usePathname } from 'next/navigation'

export function AppShell({
  children,
}: {
  children: React.ReactNode
}) {
  const { sidebarCollapsed } = useUIStore()
  const pathname = usePathname()

  // List of routes that should NOT have the dashboard layout
  const authRoutes = ['/login', '/signup', '/reset-password']
  const isAuthRoute = authRoutes.includes(pathname)

  if (isAuthRoute) {
    return <>{children}</>
  }

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

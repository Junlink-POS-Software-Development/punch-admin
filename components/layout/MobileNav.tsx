'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Store,
  Receipt,
  Users,
  Menu,
  X,
  Sparkles,
  Settings,
  LogOut,
  ChevronRight,
  User,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { createClient } from '@/lib/supabase/client'

export function MobileNav() {
  const pathname = usePathname()
  const router = useRouter()
  const [isMoreOpen, setIsMoreOpen] = useState(false)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const supabase = createClient()

  // Close the sheet on route change
  useEffect(() => {
    setIsMoreOpen(false)
  }, [pathname])

  // Get current user email for the profile section
  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.email) {
        setUserEmail(user.email)
      }
    }
    loadUser()
  }, [supabase])

  const handleLogout = async () => {
    setIsMoreOpen(false)
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Stores', href: '/stores', icon: Store },
    { name: 'Transactions', href: '/transaction', icon: Receipt },
    { name: 'Staff', href: '/staff', icon: Users },
  ]

  const isMoreActive = pathname.startsWith('/junfue-ai') || pathname.startsWith('/settings')

  return (
    <>
      {/* Slide-up "More" Sheet Backdrop */}
      {isMoreOpen && (
        <div
          className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm transition-opacity duration-200 lg:hidden"
          onClick={() => setIsMoreOpen(false)}
        />
      )}

      {/* Slide-up "More" Sheet */}
      <div
        className={cn(
          'fixed inset-x-0 bottom-0 z-50 rounded-t-2xl border-t border-border bg-card p-5 shadow-2xl transition-transform duration-300 ease-out lg:hidden',
          isMoreOpen ? 'translate-y-0' : 'translate-y-full pointer-events-none'
        )}
      >
        {/* Handle indicator */}
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-muted-foreground/30" />

        {/* Sheet Header */}
        <div className="mb-4 flex items-center justify-between border-b border-border pb-3">
          <div>
            <h3 className="text-base font-semibold text-foreground">Menu & Quick Links</h3>
            <p className="text-xs text-muted-foreground">More actions and system settings</p>
          </div>
          <button
            onClick={() => setIsMoreOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* More Menu Items */}
        <div className="space-y-2">
          <Link
            href="/junfue-ai"
            onClick={() => setIsMoreOpen(false)}
            className={cn(
              'flex items-center justify-between rounded-xl p-3 text-sm font-medium transition-colors',
              pathname.startsWith('/junfue-ai')
                ? 'bg-primary/10 text-primary border border-primary/20'
                : 'hover:bg-accent text-foreground'
            )}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-tr from-amber-500/20 to-primary/20 text-primary">
                <Sparkles className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <div className="font-semibold flex items-center gap-2">
                  Jun Fue AI
                  <span className="rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-bold text-primary uppercase">AI</span>
                </div>
                <div className="text-xs text-muted-foreground">AI Intelligence & Assistant</div>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </Link>

          <Link
            href="/settings"
            onClick={() => setIsMoreOpen(false)}
            className={cn(
              'flex items-center justify-between rounded-xl p-3 text-sm font-medium transition-colors',
              pathname.startsWith('/settings')
                ? 'bg-primary/10 text-primary border border-primary/20'
                : 'hover:bg-accent text-foreground'
            )}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-foreground">
                <Settings className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <div className="font-semibold">Settings</div>
                <div className="text-xs text-muted-foreground">System preferences and users</div>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </Link>
        </div>

        {/* User profile & Logout */}
        <div className="mt-5 border-t border-border pt-4">
          <div className="mb-3 flex items-center gap-3 px-1">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
              <User className="h-4 w-4" />
            </div>
            <div className="flex-1 truncate">
              <div className="text-xs font-semibold text-foreground truncate">{userEmail || 'Admin User'}</div>
              <div className="text-[10px] text-muted-foreground">Logged in</div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-destructive/10 py-2.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/20 active:scale-[0.99]"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 flex h-16 items-center justify-around border-t border-border bg-card/95 px-2 backdrop-blur-md shadow-lg lg:hidden"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex flex-1 flex-col items-center justify-center py-1 text-[11px] font-medium transition-all duration-200 active:scale-95',
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <div className={cn(
                'flex h-7 w-7 items-center justify-center rounded-full transition-all',
                isActive ? 'bg-primary/15' : ''
              )}>
                <item.icon className={cn('h-5 w-5 transition-transform', isActive && 'scale-110')} />
              </div>
              <span className="mt-0.5 font-medium tracking-tight truncate max-w-[60px]">{item.name}</span>
            </Link>
          )
        })}

        {/* More Tab */}
        <button
          type="button"
          onClick={() => setIsMoreOpen(!isMoreOpen)}
          className={cn(
            'flex flex-1 flex-col items-center justify-center py-1 text-[11px] font-medium transition-all duration-200 active:scale-95',
            isMoreActive || isMoreOpen ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <div className={cn(
            'flex h-7 w-7 items-center justify-center rounded-full transition-all',
            isMoreActive || isMoreOpen ? 'bg-primary/15' : ''
          )}>
            <Menu className="h-5 w-5" />
          </div>
          <span className="mt-0.5 font-medium tracking-tight">More</span>
        </button>
      </nav>
    </>
  )
}

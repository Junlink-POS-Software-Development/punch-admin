'use client'

import { useState, useEffect } from 'react'
import { Search, Bell, User, LogOut, ChevronDown } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils/cn'

interface UserInfo {
  email: string | null
  role: string
  name: string
}

export function TopBar() {
  const [searchQuery, setSearchQuery] = useState('')
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [user, setUser] = useState<UserInfo | null>(null)
  const [notificationCount] = useState(3) // Mock notification count
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function getUser() {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (authUser) {
        // Try to get user info from users table
        const { data: userData } = await supabase
          .from('users')
          .select('first_name, last_name, role')
          .eq('user_id', authUser.id)
          .single()

        setUser({
          email: authUser.email ?? null,
          role: userData?.role ?? 'user',
          name: userData 
            ? `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || authUser.email?.split('@')[0] || 'User'
            : authUser.email?.split('@')[0] || 'User'
        })
      }
    }
    getUser()
  }, [supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-card/80 backdrop-blur-sm px-6">
      {/* Search */}
      <div className="relative w-full max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search members, stores, transactions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-lg border border-input bg-background py-2 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
        />
        <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:inline-block">
          ⌘K
        </kbd>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button className="relative rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
          <Bell className="h-5 w-5" />
          {notificationCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground">
              {notificationCount > 9 ? '9+' : notificationCount}
            </span>
          )}
        </button>

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-accent"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="hidden flex-col text-left sm:flex">
              <span className="text-sm font-medium text-foreground">
                {user?.name || 'Loading...'}
              </span>
              <span className="text-xs capitalize text-muted-foreground">
                {user?.role || 'user'}
              </span>
            </div>
            <ChevronDown className={cn(
              'h-4 w-4 text-muted-foreground transition-transform duration-200',
              showProfileMenu && 'rotate-180'
            )} />
          </button>

          {/* Dropdown Menu */}
          {showProfileMenu && (
            <div className="absolute right-0 top-full mt-2 w-56 animate-slide-in-up rounded-lg border border-border bg-card p-1 shadow-lg">
              <div className="border-b border-border px-3 py-2 mb-1">
                <p className="text-sm font-medium text-foreground">{user?.name}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
              <button
                onClick={() => router.push('/dashboard/settings')}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-foreground transition-colors hover:bg-accent"
              >
                <User className="h-4 w-4" />
                Profile Settings
              </button>
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-destructive transition-colors hover:bg-destructive/10"
              >
                <LogOut className="h-4 w-4" />
                Log out
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Click outside to close */}
      {showProfileMenu && (
        <div
          className="fixed inset-0 z-[-1]"
          onClick={() => setShowProfileMenu(false)}
        />
      )}
    </header>
  )
}

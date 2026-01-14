import Link from 'next/link'
import { UserPlus, Store, FileDown } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

const actions = [
  {
    name: 'Add Staff',
    description: 'Register a new staff',
    href: '/dashboard/staffs/new',
    icon: UserPlus,
    color: 'bg-primary/10 text-primary hover:bg-primary/20',
  },
  {
    name: 'Register Store',
    description: 'Add a new store',
    href: '/dashboard/stores/new',
    icon: Store,
    color: 'bg-success/10 text-success hover:bg-success/20',
  },
  {
    name: 'Export Report',
    description: 'Download analytics',
    href: '/dashboard/analytics?export=true',
    icon: FileDown,
    color: 'bg-warning/10 text-warning hover:bg-warning/20',
  },
]

export function QuickActions() {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
      <div className="grid gap-3">
        {actions.map((action) => (
          <Link
            key={action.name}
            href={action.href}
            className="flex items-center gap-4 rounded-lg p-3 transition-colors hover:bg-accent group"
          >
            <div className={cn(
              'flex h-10 w-10 items-center justify-center rounded-lg transition-colors',
              action.color
            )}>
              <action.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="font-medium text-foreground group-hover:text-primary transition-colors">
                {action.name}
              </p>
              <p className="text-sm text-muted-foreground">{action.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

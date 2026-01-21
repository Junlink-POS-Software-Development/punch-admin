import { Clock } from 'lucide-react'

export function ActivityEmpty() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
      <Clock className="h-12 w-12 mb-4 opacity-20" />
      <p>No recent activity to show</p>
    </div>
  )
}

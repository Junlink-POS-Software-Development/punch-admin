import { format, formatDistanceToNow, parseISO } from 'date-fns'
import { StoreAddress } from '@/lib/types/database'

// Date formatters
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'MMM d, yyyy')
}

export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'MMM d, yyyy h:mm a')
}

export function formatRelativeTime(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return formatDistanceToNow(d, { addSuffix: true })
}

// Currency formatters
export function formatCurrency(amount: number, currency: string = 'PHP'): string {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-PH').format(num)
}

export function formatCompactNumber(num: number): string {
  return new Intl.NumberFormat('en-PH', {
    notation: 'compact',
    compactDisplay: 'short',
  }).format(num)
}

// String formatters
export function formatFullName(firstName: string | null, lastName: string | null): string {
  const parts = [firstName, lastName].filter(Boolean)
  return parts.length > 0 ? parts.join(' ') : 'Unknown'
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str
  return str.slice(0, length) + '...'
}

// Address formatter
export function formatAddress(address: StoreAddress | null): string {
  if (!address) return 'No address'
  const parts = [
    address.street,
    address.city,
    address.state,
    address.postal_code,
    address.country,
  ].filter(Boolean)
  return parts.length > 0 ? parts.join(', ') : 'No address'
}



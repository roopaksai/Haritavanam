import type { CareType, PlantStatus, Priority, TicketStatus } from './types'

export function formatDate(input?: string | null, options?: Intl.DateTimeFormatOptions) {
  if (!input) return '—'
  const date = new Date(input)
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat('en-IN', options ?? { day: 'numeric', month: 'short', year: 'numeric' }).format(date)
}

export function formatDateTime(input?: string | null) {
  return formatDate(input, { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })
}

export function relativeTime(input?: string | null) {
  if (!input) return '—'
  const then = new Date(input).getTime()
  if (Number.isNaN(then)) return '—'
  const diff = then - Date.now()
  const minutes = Math.round(diff / 60000)
  const abs = Math.abs(minutes)

  if (abs < 1) return 'just now'
  if (abs < 60) return minutes > 0 ? `in ${abs} min` : `${abs} min ago`
  const hours = Math.round(minutes / 60)
  if (Math.abs(hours) < 24) return hours > 0 ? `in ${hours} hr` : `${Math.abs(hours)} hr ago`
  const days = Math.round(hours / 24)
  if (Math.abs(days) < 30) return days > 0 ? `in ${days} day${days === 1 ? '' : 's'}` : `${Math.abs(days)} day${Math.abs(days) === 1 ? '' : 's'} ago`
  return formatDate(input)
}

export function dueLabel(input?: string | null) {
  if (!input) return { text: 'Not scheduled', tone: 'muted' as const }
  const due = new Date(input)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const dueDay = new Date(due)
  dueDay.setHours(0, 0, 0, 0)
  const days = Math.round((dueDay.getTime() - today.getTime()) / 86400000)

  if (days < 0) return { text: `${Math.abs(days)} day${Math.abs(days) === 1 ? '' : 's'} overdue`, tone: 'late' as const }
  if (days === 0) return { text: 'Due today', tone: 'today' as const }
  if (days === 1) return { text: 'Due tomorrow', tone: 'soon' as const }
  return { text: `In ${days} days`, tone: 'muted' as const }
}

export function plantAge(plantedOn?: string) {
  if (!plantedOn) return '—'
  const planted = new Date(plantedOn)
  const months = Math.max(0, Math.round((Date.now() - planted.getTime()) / (86400000 * 30.44)))
  if (months < 1) return 'Newly planted'
  if (months < 24) return `${months} mo old`
  const years = Math.floor(months / 12)
  return `${years} yr${years === 1 ? '' : 's'} old`
}

export function formatArea(sqm?: number | null) {
  if (!sqm) return '—'
  if (sqm >= 10000) return `${(sqm / 10000).toFixed(1)} ha`
  return `${Math.round(sqm).toLocaleString('en-IN')} m²`
}

export const statusTheme: Record<
  PlantStatus,
  { label: string; chip: string; dot: string; ring: string }
> = {
  healthy: {
    label: 'Healthy',
    chip: 'bg-forest-700/10 text-forest-800 border-forest-700/15',
    dot: 'bg-forest-600',
    ring: '#3A5A40',
  },
  needs_attention: {
    label: 'Needs attention',
    chip: 'bg-amber-100 text-amber-600 border-amber-600/20',
    dot: 'bg-amber-600',
    ring: '#B07C25',
  },
  critical: {
    label: 'Critical',
    chip: 'bg-clay-100 text-clay-700 border-clay-600/20',
    dot: 'bg-clay-500',
    ring: '#CD4B3F',
  },
  new: {
    label: 'Newly planted',
    chip: 'bg-sage-100 text-forest-800 border-forest-700/10',
    dot: 'bg-sage-300',
    ring: '#7B9A80',
  },
}

export const careLabel: Record<CareType, string> = {
  water: 'Watered',
  fertilise: 'Fed',
  prune: 'Pruned',
  inspect: 'Inspected',
  photo: 'Photo added',
  pest: 'Pest treatment',
}

export const carePast: Record<CareType, string> = {
  water: 'Water',
  fertilise: 'Fertilise',
  prune: 'Prune',
  inspect: 'Inspect',
  photo: 'Photo',
  pest: 'Pest care',
}

export const ticketTheme: Record<TicketStatus, { label: string; chip: string }> = {
  open: { label: 'Open', chip: 'bg-clay-100 text-clay-700 border-clay-600/20' },
  in_progress: { label: 'In progress', chip: 'bg-amber-100 text-amber-600 border-amber-600/20' },
  resolved: { label: 'Resolved', chip: 'bg-sage-100 text-forest-800 border-forest-700/15' },
}

export const priorityTheme: Record<Priority, { label: string; chip: string }> = {
  low: { label: 'Low', chip: 'bg-cream-300 text-ink-700 border-ink-900/10' },
  medium: { label: 'Medium', chip: 'bg-amber-100 text-amber-600 border-amber-600/20' },
  high: { label: 'High', chip: 'bg-clay-100 text-clay-700 border-clay-600/20' },
}

export function greeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

export function initials(name?: string | null) {
  if (!name) return '—'
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

export function todayLong() {
  return new Intl.DateTimeFormat('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date())
}

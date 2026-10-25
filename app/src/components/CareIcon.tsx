import { Bug, Camera, Droplets, Eye, Scissors, Sprout } from 'lucide-react'
import type { CareType } from '../lib/types'

const map = {
  water: { icon: Droplets, className: 'bg-sage-100 text-forest-700' },
  fertilise: { icon: Sprout, className: 'bg-sage-100 text-forest-700' },
  prune: { icon: Scissors, className: 'bg-cream-300 text-forest-800' },
  inspect: { icon: Eye, className: 'bg-cream-300 text-forest-800' },
  photo: { icon: Camera, className: 'bg-cream-300 text-forest-800' },
  pest: { icon: Bug, className: 'bg-clay-100 text-clay-600' },
} as const

export function CareIcon({
  type,
  size = 16,
  withBackground = true,
}: {
  type: CareType
  size?: number
  withBackground?: boolean
}) {
  const entry = map[type] ?? map.inspect
  const Icon = entry.icon
  if (!withBackground) return <Icon size={size} aria-hidden />
  return (
    <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${entry.className}`}>
      <Icon size={size} aria-hidden />
    </span>
  )
}

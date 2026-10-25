import { ArrowUpRight, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'
import { dueLabel, plantAge, statusTheme } from '../lib/format'
import type { Plant } from '../lib/types'
import { HealthRing } from './HealthRing'
import { PlantImage } from './PlantImage'
import { Badge } from './ui'

export function PlantCard({ plant }: { plant: Plant }) {
  const status = statusTheme[plant.status]
  const due = dueLabel(plant.nextWateringDue)

  return (
    <Link
      to={`/plants/${plant.id}`}
      className="group relative flex w-[232px] shrink-0 flex-col overflow-hidden rounded-3xl border border-forest-700/10 bg-cream-50 shadow-soft transition duration-200 hover:-translate-y-0.5 hover:shadow-lift focus-visible:-translate-y-0.5"
    >
      <div className="relative h-[124px] overflow-hidden">
        <PlantImage
          src={plant.photoUrl}
          alt={plant.name}
          className="h-full w-full transition duration-500 group-hover:scale-[1.03]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-forest-950/35 via-transparent to-transparent" />
        <div className="absolute left-3 top-3">
          <Badge className={`${status.chip} bg-cream-50/90 backdrop-blur`} dot>
            {status.label}
          </Badge>
        </div>
        <div className="absolute bottom-2.5 right-2.5">
          <div className="rounded-full bg-cream-50/92 p-0.5 backdrop-blur">
            <HealthRing value={plant.health} status={plant.status} size={42} stroke={9} />
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col px-3.5 pb-3.5 pt-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="truncate text-[15px] font-semibold leading-tight text-ink-900">
              {plant.name}
            </h3>
            <p className="mt-0.5 truncate text-[11.5px] italic text-ink-400">{plant.species}</p>
          </div>
          <ArrowUpRight
            size={15}
            className="mt-1 shrink-0 text-ink-400 transition group-hover:text-forest-700"
            aria-hidden
          />
        </div>

        <div className="mt-auto flex items-center justify-between gap-2 pt-3">
          <span className="flex min-w-0 items-center gap-1 text-[10.5px] text-ink-500">
            <MapPin size={11} className="shrink-0" aria-hidden />
            <span className="truncate">{plantAge(plant.plantedOn)}</span>
          </span>
          <span
            className={`shrink-0 text-[10.5px] font-semibold ${
              due.tone === 'late'
                ? 'text-clay-600'
                : due.tone === 'today' || due.tone === 'soon'
                  ? 'text-forest-700'
                  : 'text-ink-400'
            }`}
          >
            {due.text}
          </span>
        </div>
      </div>
    </Link>
  )
}

export function PlantRow({ plant }: { plant: Plant }) {
  const status = statusTheme[plant.status]
  const due = dueLabel(plant.nextWateringDue)

  return (
    <Link
      to={`/plants/${plant.id}`}
      className="flex items-center gap-3 rounded-2xl px-1.5 py-2 transition hover:bg-forest-700/5"
    >
      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-cream-300">
        <PlantImage src={plant.photoUrl} alt={plant.name} className="h-full w-full" iconSize={18} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13.5px] font-semibold leading-tight text-ink-900">
          {plant.name}
        </p>
        <p className="mt-0.5 truncate text-[11px] text-ink-400">
          {plant.localName ? `${plant.localName} · ` : ''}
          {due.text}
        </p>
      </div>
      <span className={`h-2 w-2 shrink-0 rounded-full ${status.dot}`} aria-label={status.label} />
      <span className="w-9 shrink-0 text-right font-display text-[15px] font-semibold tabular-nums text-ink-700">
        {plant.health}
      </span>
    </Link>
  )
}

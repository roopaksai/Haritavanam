import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { MapPin, Plus, Search, Trees } from 'lucide-react'
import { api } from '../lib/api'
import { usePlantScope } from '../lib/auth'
import { dueLabel, plantAge, statusTheme } from '../lib/format'
import { useAsync } from '../lib/useAsync'
import type { Plant, PlantStatus } from '../lib/types'
import { HealthRing } from '../components/HealthRing'
import { PlantImage } from '../components/PlantImage'
import {
  Avatar,
  Badge,
  Button,
  Card,
  EmptyState,
  ErrorState,
  Input,
  Segmented,
  Skeleton,
} from '../components/ui'

type Filter = 'all' | PlantStatus

const filters: Array<{ value: Filter; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'healthy', label: 'Healthy' },
  { value: 'needs_attention', label: 'Needs care' },
  { value: 'critical', label: 'Critical' },
  { value: 'new', label: 'New' },
]

export default function PlantsPage() {
  const scope = usePlantScope()
  const [query, setQuery] = useState('')
  const [debounced, setDebounced] = useState('')
  const [filter, setFilter] = useState<Filter>('all')

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(query.trim()), 250)
    return () => window.clearTimeout(timer)
  }, [query])

  const result = useAsync(
    () =>
      api.plants({
        scope,
        q: debounced || undefined,
        status: filter === 'all' ? undefined : filter,
      }),
    [debounced, filter, scope],
  )

  const plants: Plant[] = result.data?.plants ?? []
  const counts = useMemo(() => {
    const base: Record<Filter, number> = {
      all: plants.length,
      healthy: 0,
      needs_attention: 0,
      critical: 0,
      new: 0,
    }
    for (const plant of plants) base[plant.status] += 1
    return base
  }, [plants])

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[26px] font-semibold leading-tight text-ink-900 sm:text-[30px]">
            Plant records
          </h1>
          <p className="mt-1 text-[12.5px] text-ink-500">
            Every tree and sapling you are responsible for.
          </p>
        </div>
        <Link to="/add">
          <Button size="sm" icon={<Plus size={15} />}>
            Register
          </Button>
        </Link>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            size={15}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400"
            aria-hidden
          />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name, species or local name"
            className="h-11 py-0 pl-10"
            aria-label="Search plants"
          />
        </div>
        <Segmented
          ariaLabel="Filter by plant health"
          options={filters.map((item) => ({ ...item, count: item.value === 'all' ? counts.all : undefined }))}
          value={filter}
          onChange={setFilter}
          className="overflow-x-auto"
        />
      </div>

      {result.error ? <ErrorState message={result.error} onRetry={result.reload} /> : null}

      {result.loading && !result.data ? (
        <div className="grid gap-3.5 sm:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((key) => (
            <Skeleton key={key} className="h-[248px] rounded-3xl" />
          ))}
        </div>
      ) : plants.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Trees size={22} />}
            title={debounced || filter !== 'all' ? 'No plants match that' : 'No plants yet'}
            description={
              debounced || filter !== 'all'
                ? 'Try a different search term or clear the filter.'
                : 'Register your first plant with a photo and a location.'
            }
            action={
              debounced || filter !== 'all' ? (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    setQuery('')
                    setFilter('all')
                  }}
                >
                  Clear filters
                </Button>
              ) : (
                <Link to="/add">
                  <Button size="sm" icon={<Plus size={15} />}>
                    Register a plant
                  </Button>
                </Link>
              )
            }
          />
        </Card>
      ) : (
        <div className="grid gap-3.5 sm:grid-cols-2 xl:grid-cols-3">
          {plants.map((plant) => (
            <PlantTile key={plant.id} plant={plant} />
          ))}
        </div>
      )}
    </div>
  )
}

function PlantTile({ plant }: { plant: Plant }) {
  const status = statusTheme[plant.status]
  const due = dueLabel(plant.nextWateringDue)

  return (
    <Link
      to={`/plants/${plant.id}`}
      className="group overflow-hidden rounded-3xl border border-forest-700/10 bg-cream-50 shadow-soft transition duration-200 hover:-translate-y-0.5 hover:shadow-lift"
    >
      <div className="relative h-[150px] overflow-hidden">
        <PlantImage
          src={plant.photoUrl}
          alt={plant.name}
          className="h-full w-full transition duration-500 group-hover:scale-[1.03]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-forest-950/30 via-transparent to-transparent" />
        <div className="absolute left-3 top-3">
          <Badge className={`${status.chip} bg-cream-50/92 backdrop-blur`} dot>
            {status.label}
          </Badge>
        </div>
        <div className="absolute bottom-2.5 right-2.5 rounded-full bg-cream-50/92 p-0.5 backdrop-blur">
          <HealthRing value={plant.health} status={plant.status} size={44} stroke={9} />
        </div>
      </div>

      <div className="p-3.5">
        <h2 className="truncate text-[15px] font-semibold leading-tight text-ink-900">
          {plant.name}
        </h2>
        <p className="mt-0.5 truncate text-[11.5px] italic text-ink-400">{plant.species}</p>

        <div className="mt-3 flex items-center justify-between gap-2 border-t border-cream-300 pt-2.5">
          <span className="flex min-w-0 items-center gap-1.5">
            <Avatar name={plant.ownerName} size={18} color="#5D8264" />
            <span className="truncate text-[10.5px] text-ink-500">{plant.ownerName}</span>
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

        <p className="mt-2 flex items-center gap-1 text-[10px] text-ink-400">
          <MapPin size={10} aria-hidden /> {plantAge(plant.plantedOn)} · {plant.careCount ?? 0} care
          logs
        </p>
      </div>
    </Link>
  )
}

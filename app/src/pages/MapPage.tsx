import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Layers, Leaf, MapPin, Search, Trees, X } from 'lucide-react'
import { api } from '../lib/api'
import { usePlantScope } from '../lib/auth'
import { statusTheme } from '../lib/format'
import { useAsync } from '../lib/useAsync'
import type { Field as FieldType, Plant, PlantStatus } from '../lib/types'
import { CAMPUS_CENTER, MapView } from '../components/MapView'
import { HealthRing } from '../components/HealthRing'
import { PlantImage } from '../components/PlantImage'
import {
  Badge,
  Button,
  Card,
  EmptyState,
  ErrorState,
  Field,
  Input,
  Skeleton,
} from '../components/ui'

type Filter = 'all' | PlantStatus

export default function MapPage() {
  const scope = usePlantScope()
  const [filter, setFilter] = useState<Filter>('all')
  const [selected, setSelected] = useState<string | null>(null)
  const [showFields, setShowFields] = useState(true)
  const [showPlants, setShowPlants] = useState(true)
  const [showList, setShowList] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const result = useAsync(async () => {
    const [plants, fields] = await Promise.all([api.plants({ scope }), api.fields()])
    return { plants: plants.plants, fields: fields.fields }
  }, [scope])

  const plants: Plant[] = result.data?.plants ?? []
  const fields: FieldType[] = result.data?.fields ?? []

  const filtered = useMemo(
    () => (filter === 'all' ? plants : plants.filter((plant) => plant.status === filter)),
    [plants, filter],
  )

  const searchedPlants = useMemo(
    () =>
      filtered.filter(
        (plant) =>
          searchQuery === '' ||
          [plant.name, plant.species, plant.localName]
            .join(' ')
            .toLowerCase()
            .includes(searchQuery.toLowerCase()),
      ),
    [filtered, searchQuery],
  )

  const selectedPlant = plants.find((plant) => plant.id === selected) ?? null
  const selectedField = fields.find((field) => field.id === selected) ?? null

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[26px] font-semibold leading-tight text-ink-900 sm:text-[30px]">
            Field map
          </h1>
          <p className="mt-1 flex items-center gap-1.5 text-[12px] text-ink-500">
            <MapPin size={12} aria-hidden /> GITAM University · 13.2886° N, 77.5974° E
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={showFields ? 'sage' : 'secondary'}
            size="sm"
            icon={<Leaf size={14} />}
            onClick={() => setShowFields((value) => !value)}
            aria-pressed={showFields}
          >
            Fields
          </Button>
          <Button
            variant={showPlants ? 'sage' : 'secondary'}
            size="sm"
            icon={<Trees size={14} />}
            onClick={() => setShowPlants((value) => !value)}
            aria-pressed={showPlants}
          >
            Plants
          </Button>
          <Button
            variant={showList ? 'sage' : 'secondary'}
            size="sm"
            icon={<ListIcon size={14} />}
            onClick={() => setShowList((value) => !value)}
            aria-pressed={showList}
          >
            List
          </Button>
        </div>
      </div>

      {/* plant search */}
      <Field label="Search plants">
        <div className="relative">
          <Search size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" aria-hidden />
          <Input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search by name, species or local name"
            className="h-10 pl-10 text-[12.5px]"
            aria-label="Search plants"
          />
        </div>
      </Field>

      {/* filters */}
      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
        {(
          [
            { value: 'all', label: 'All plants' },
            { value: 'healthy', label: 'Healthy' },
            { value: 'needs_attention', label: 'Needs care' },
            { value: 'critical', label: 'Critical' },
            { value: 'new', label: 'New' },
          ] as Array<{ value: Filter; label: string }>
        ).map((option) => {
          const active = filter === option.value
          const count = searchedPlants.filter((plant) => plant.status === option.value).length
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => setFilter(option.value)}
              className={`shrink-0 rounded-full border px-3 py-1.5 text-[11.5px] font-semibold transition ${
                active
                  ? 'border-forest-700 bg-forest-700 text-cream-50 shadow-soft'
                  : 'border-forest-700/12 bg-cream-50 text-ink-600 hover:border-forest-700/30'
              }`}
            >
              {option.label}
              <span className={`ml-1.5 ${active ? 'text-cream-100/70' : 'text-ink-400'}`}>{count}</span>
            </button>
          )
        })}
      </div>

      {result.error ? <ErrorState message={result.error} onRetry={result.reload} /> : null}

      {showList ? (
        /* ------------------------------------------------- plant list view */
        <div className="space-y-3">
          {searchedPlants.length === 0 ? (
            <Card>
              <EmptyState
                icon={<Trees size={22} />}
                title={searchQuery ? 'No plants match that' : 'No plants yet'}
                description={
                  searchQuery
                    ? 'Try a different search term.'
                    : 'Register your first plant to see it on the map.'
                }
                action={
                  searchQuery ? (
                    <Button size="sm" variant="secondary" onClick={() => setSearchQuery('')}>
                      Clear search
                    </Button>
                  ) : (
                    <Link to="/add">
                      <Button size="sm" icon={<PlusIcon size={15} />}>
                        Register a plant
                      </Button>
                    </Link>
                  )
                }
              />
            </Card>
          ) : (
            <div className="space-y-2.5">
              {searchedPlants.map((plant) => (
                <PlantListRow
                  key={plant.id}
                  plant={plant}
                  onSelect={() => {
                    setSelected(plant.id)
                    setShowList(false)
                  }}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        /* ------------------------------------------------- map view */
        <div className="relative overflow-hidden rounded-3xl border border-forest-700/12 shadow-soft pb-[10px]">
          {result.loading && !result.data ? (
            <Skeleton className="min-h-[420px] w-full rounded-3xl" />
          ) : (
            <MapView
              plants={showPlants ? searchedPlants : []}
              fields={showFields ? fields : []}
              selectedId={selected}
              onSelect={setSelected}
              center={CAMPUS_CENTER}
              zoom={16}
              className="min-h-[420px] w-full"
            />
          )}

          {/* legend */}
          <div className="pointer-events-none absolute left-3 top-3 rounded-2xl border border-forest-700/10 bg-cream-50/92 px-3 py-2 text-[10px] shadow-soft backdrop-blur">
            <p className="flex items-center gap-1.5 font-semibold text-ink-700">
              <Layers size={11} aria-hidden /> {searchedPlants.length} plants ·{' '}
              {showFields ? fields.length : 0} fields
            </p>
            <p className="mt-1 flex items-center gap-1.5 text-ink-400">
              <span className="h-2 w-2 rounded-full bg-forest-600" /> Healthy
              <span className="ml-1 h-2 w-2 rounded-full bg-amber-600" /> Needs care
              <span className="ml-1 h-2 w-2 rounded-full bg-clay-500" /> Critical
            </p>
          </div>

          {/* selected card */}
          {selectedPlant ? (
            <div className="animate-fade-up absolute inset-x-3 bottom-4 rounded-2xl border border-forest-700/12 bg-cream-50/96 p-2.5 shadow-lift backdrop-blur pb-safe">
              <div className="flex items-center gap-3">
                <PlantImage
                  src={selectedPlant.photoUrl}
                  alt={selectedPlant.name}
                  className="h-14 w-14 shrink-0 rounded-xl"
                  iconSize={18}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13.5px] font-semibold text-ink-900">
                    {selectedPlant.name}
                  </p>
                  <p className="truncate text-[11px] italic text-ink-400">
                    {selectedPlant.species}
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <Badge className={statusTheme[selectedPlant.status].chip} dot>
                      {statusTheme[selectedPlant.status].label}
                    </Badge>
                    <span className="text-[10.5px] text-ink-400">
                      {selectedPlant.careCount ?? 0} logs
                    </span>
                  </div>
                </div>
                <HealthRing
                  value={selectedPlant.health}
                  status={selectedPlant.status}
                  size={40}
                  stroke={9}
                />
                <Link to={`/plants/${selectedPlant.id}`}>
                  <Button size="sm" icon={<ArrowRight size={14} />}>
                    Open
                  </Button>
                </Link>
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="grid h-6 w-6 place-items-center rounded-full text-ink-400 hover:bg-forest-700/8"
                  aria-label="Close selection"
                >
                  <X size={13} />
                </button>
              </div>
            </div>
          ) : selectedField ? (
            <div className="animate-fade-up absolute inset-x-3 bottom-4 rounded-2xl border border-forest-700/12 bg-cream-50/96 p-3 shadow-lift backdrop-blur pb-safe">
              <div className="flex items-center gap-2">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-sage-100 text-forest-700">
                  <Leaf size={16} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13.5px] font-semibold">{selectedField.name}</p>
                  <p className="text-[11px] text-ink-400">
                    {selectedField.crop ?? 'Field'} ·{' '}
                    {selectedField.areaSqm
                      ? `${Math.round(selectedField.areaSqm).toLocaleString('en-IN')} m²`
                      : 'Area not set'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="grid h-6 w-6 place-items-center rounded-full text-ink-400 hover:bg-forest-700/8"
                  aria-label="Close selection"
                >
                  <X size={13} />
                </button>
              </div>
            </div>
          ) : null}
        </div>
      )}

      <p className="text-center text-[10px] text-ink-400">
        Map data © OpenStreetMap contributors · tiles load from the OpenStreetMap network
      </p>
    </div>
  )
}

function ListIcon({ size = 14 }: { size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" />
      <line x1="3" y1="12" x2="3.01" y2="12" />
      <line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  )
}

function PlusIcon({ size = 15 }: { size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}

function PlantListRow({
  plant,
  onSelect,
}: {
  plant: Plant
  onSelect: () => void
}) {
  const status = statusTheme[plant.status]
  return (
    <Link
      to={`/plants/${plant.id}`}
      onClick={onSelect}
      className="flex items-center gap-3 rounded-2xl border border-forest-700/10 bg-cream-50 p-3 shadow-soft transition hover:border-forest-700/25 hover:bg-cream-100"
    >
      <PlantImage
        src={plant.photoUrl}
        alt={plant.name}
        className="h-12 w-12 shrink-0 rounded-xl"
        iconSize={16}
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-semibold text-ink-900 leading-tight">
          {plant.name}
        </p>
        <p className="truncate text-[11px] italic text-ink-400">
          {plant.species}
        </p>
        <div className="mt-1 flex items-center gap-2 text-[10px]">
          <Badge className={status.chip} dot>
            {status.label}
          </Badge>
          <span className="text-ink-400">{plant.careCount ?? 0} logs</span>
        </div>
      </div>
      <ArrowRight size={14} className="text-ink-400 shrink-0" aria-hidden />
    </Link>
  )
}

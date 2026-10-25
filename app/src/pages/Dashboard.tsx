import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  CalendarClock,
  ChevronRight,
  CloudSun,
  Droplets,
  HeartPulse,
  Leaf,
  MapPin,
  Plus,
  ShieldCheck,
  Sprout,
  Trees,
} from 'lucide-react'
import { api, ApiError } from '../lib/api'
import { useAuth, usePlantScope } from '../lib/auth'
import { careLabel, dueLabel, greeting, relativeTime, statusTheme } from '../lib/format'
import type { Field, Plant, Stats } from '../lib/types'
import { useAsync } from '../lib/useAsync'
import { useToast } from '../lib/toast'
import { MapView, CAMPUS_CENTER } from '../components/MapView'
import { PlantCard } from '../components/PlantCard'
import { PlantImage } from '../components/PlantImage'
import { CareIcon } from '../components/CareIcon'
import {
  Badge,
  Button,
  Card,
  EmptyState,
  ErrorState,
  SectionTitle,
  Skeleton,
  StatTile,
} from '../components/ui'

export default function Dashboard() {
  const { user } = useAuth()
  const scope = usePlantScope()
  const toast = useToast()
  const [busyId, setBusyId] = useState<string | null>(null)

  const overview = useAsync(async () => {
    const [stats, plants, fields] = await Promise.all([
      api.stats(),
      api.plants({ scope }),
      api.fields(),
    ])
    return { stats: stats.stats, plants: plants.plants, fields: fields.fields }
  }, [scope])

  const stats: Stats | null = overview.data?.stats ?? null
  const plants: Plant[] = overview.data?.plants ?? []
  const fields: Field[] = overview.data?.fields ?? []

  const dueToday = useMemo(
    () =>
      plants
        .filter(
          (plant) =>
            plant.nextWateringDue &&
            new Date(plant.nextWateringDue).getTime() <= Date.now() + 86400000,
        )
        .sort((a, b) => String(a.nextWateringDue).localeCompare(String(b.nextWateringDue)))
        .slice(0, 4),
    [plants],
  )

  const activity = useMemo(
    () =>
      plants
        .filter((plant) => plant.lastCare)
        .sort((a, b) => String(b.lastCare?.createdAt).localeCompare(String(a.lastCare?.createdAt)))
        .slice(0, 5),
    [plants],
  )

  async function water(plant: Plant) {
    setBusyId(plant.id)
    try {
      await api.logCare(plant.id, { type: 'water', note: 'Logged from the overview' })
      toast.success(`${plant.name} watered`)
      overview.reload()
    } catch (cause) {
      toast.error(cause instanceof ApiError ? cause.message : 'Could not log that watering')
    } finally {
      setBusyId(null)
    }
  }

  if (overview.loading && !overview.data) return <DashboardSkeleton />
  if (overview.error) return <ErrorState message={overview.error} onRetry={overview.reload} />

  const firstName = user?.name?.split(' ')[0] ?? 'there'

  return (
    <div className="space-y-6">
      {/* greeting */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-forest-700/60">
            {greeting()}
          </p>
          <h1 className="mt-1 text-[28px] font-semibold leading-tight text-ink-900 sm:text-[32px]">
            {firstName}
          </h1>
          <p className="mt-1 flex items-center gap-1.5 text-[12px] text-ink-500">
            <MapPin size={12} aria-hidden /> GITAM University, Bengaluru
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-2xl border border-forest-700/10 bg-cream-50 px-3 py-2 shadow-soft">
          <CloudSun size={18} className="text-forest-600" aria-hidden />
          <div className="leading-tight">
            <p className="text-[11.5px] font-semibold text-ink-900">Monsoon watch</p>
            <p className="text-[10px] text-ink-400">Skip watering if soil is damp</p>
          </div>
        </div>
      </div>

      {/* hero */}
      <Card className="relative overflow-hidden border-0">
        <img src="/brand/hero.jpg" alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-forest-950/85 via-forest-950/55 to-forest-950/10" />
        <div className="relative flex min-h-[196px] flex-col justify-end p-5 sm:min-h-[224px] sm:p-7">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-sage-200">
            {stats?.plants ?? 0} plants · {stats?.fields ?? 0} fields under care
          </p>
          <h2 className="display-tight mt-2 max-w-sm text-[32px] text-cream-50 sm:text-[38px]">
            A Greener Tomorrow
          </h2>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link to="/add">
              <Button size="sm" variant="secondary" icon={<Plus size={15} />} className="border-0">
                Register a plant
              </Button>
            </Link>
            <Link to="/map">
              <Button
                size="sm"
                variant="ghost"
                icon={<MapPin size={15} />}
                className="text-cream-50 hover:bg-cream-50/15"
              >
                Open map
              </Button>
            </Link>
          </div>
        </div>
      </Card>

      {/* stats */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-4">
        <StatTile
          label="Plants"
          value={stats?.plants ?? 0}
          hint={`${stats?.healthy ?? 0} healthy`}
          icon={<Trees size={15} />}
        />
        <StatTile
          label="Fields"
          value={stats?.fields ?? 0}
          hint={stats?.pendingRequests ? `${stats.pendingRequests} request pending` : 'All mapped'}
          icon={<Leaf size={15} />}
        />
        <StatTile
          label="Avg health"
          value={`${stats?.avgHealth ?? 0}%`}
          hint={`${stats?.needsAttention ?? 0} need attention`}
          icon={<HeartPulse size={15} />}
          tone={stats && stats.avgHealth < 70 ? 'amber' : 'default'}
        />
        <StatTile
          label="Care this week"
          value={stats?.careThisWeek ?? 0}
          hint={`${stats?.dueSoon ?? 0} due soon`}
          icon={<CalendarClock size={15} />}
          tone={stats && stats.critical > 0 ? 'clay' : 'default'}
        />
      </div>

      {user?.role === 'admin' && (stats?.pendingMonitoringRequests ?? 0) > 0 ? (
        <Link
          to="/admin"
          className="flex items-center gap-3 rounded-2xl border border-amber-600/20 bg-amber-100 px-4 py-3 transition hover:bg-amber-100/70"
        >
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-cream-50 text-amber-600">
            <ShieldCheck size={17} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-semibold text-amber-600">
              {stats?.pendingMonitoringRequests} monitoring request
              {(stats?.pendingMonitoringRequests ?? 0) === 1 ? '' : 's'} waiting
            </p>
            <p className="text-[11px] text-amber-600/75">Only an administrator can approve these.</p>
          </div>
          <ChevronRight size={16} className="text-amber-600" aria-hidden />
        </Link>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1.55fr_1fr]">
        <div className="space-y-6">
          {/* today's care */}
          <Card className="p-4 sm:p-5">
            <SectionTitle
              title="Today’s care"
              hint="Watering due in the next 24 hours"
              action={
                dueToday.length > 0 ? (
                  <Badge className="border-forest-700/15 bg-sage-100 text-forest-800">
                    {dueToday.length} to do
                  </Badge>
                ) : null
              }
            />

            {dueToday.length === 0 ? (
              <EmptyState
                icon={<Droplets size={22} />}
                title="Nothing due today"
                description="No watering falls due in the next 24 hours — the next round is already scheduled."
                className="py-6"
              />
            ) : (
              <ul className="divide-y divide-cream-300">
                {dueToday.map((plant) => {
                  const due = dueLabel(plant.nextWateringDue)
                  const status = statusTheme[plant.status]
                  return (
                    <li key={plant.id} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                      <Link
                        to={`/plants/${plant.id}`}
                        className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-cream-300"
                      >
                        <PlantImage
                          src={plant.photoUrl}
                          alt={plant.name}
                          className="h-full w-full"
                          iconSize={16}
                        />
                      </Link>
                      <div className="min-w-0 flex-1">
                        <Link
                          to={`/plants/${plant.id}`}
                          className="block truncate text-[13.5px] font-semibold text-ink-900"
                        >
                          {plant.name}
                        </Link>
                        <p className="mt-0.5 flex items-center gap-1.5 text-[11px] text-ink-400">
                          <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                          {due.text} · {plant.health}% health
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant={due.tone === 'late' ? 'primary' : 'secondary'}
                        loading={busyId === plant.id}
                        onClick={() => void water(plant)}
                        icon={<Droplets size={14} />}
                      >
                        Water
                      </Button>
                    </li>
                  )
                })}
              </ul>
            )}
          </Card>

          {/* your plants */}
          <div>
            <SectionTitle
              title="Your plants"
              hint={`${plants.length} record${plants.length === 1 ? '' : 's'}`}
              action={
                <Link
                  to="/plants"
                  className="inline-flex items-center gap-1 text-[12px] font-semibold text-forest-700"
                >
                  View all <ArrowRight size={13} aria-hidden />
                </Link>
              }
            />
            {plants.length === 0 ? (
              <Card>
                <EmptyState
                  icon={<Sprout size={22} />}
                  title="Plant your first record"
                  description="A photo, a location and a name is all it takes."
                  action={
                    <Link to="/add">
                      <Button size="sm" icon={<Plus size={15} />}>
                        Register a plant
                      </Button>
                    </Link>
                  }
                />
              </Card>
            ) : (
              <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
                {plants.slice(0, 8).map((plant) => (
                  <PlantCard key={plant.id} plant={plant} />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {/* map preview */}
          <Card className="overflow-hidden">
            <div className="flex items-center justify-between px-4 pt-4">
              <h2 className="text-[16px] font-semibold text-ink-900">On the ground</h2>
              <Link to="/map" className="text-[11.5px] font-semibold text-forest-700">
                Full map
              </Link>
            </div>
            <div className="mt-3 h-[186px] w-full overflow-hidden">
              <MapView
                plants={plants}
                fields={fields}
                center={CAMPUS_CENTER}
                zoom={16}
                interactive={false}
                className="h-full w-full"
              />
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <p className="text-[11px] text-ink-400">
                {fields.length} field{fields.length === 1 ? '' : 's'} mapped
              </p>
              <Link
                to="/map"
                className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-forest-700"
              >
                Explore <ArrowRight size={12} aria-hidden />
              </Link>
            </div>
          </Card>

          {/* activity */}
          <Card className="p-4">
            <SectionTitle title="Recent care" hint="Latest activity in your grove" />
            {activity.length === 0 ? (
              <p className="py-4 text-center text-[12px] text-ink-400">No care logged yet.</p>
            ) : (
              <ul className="space-y-3">
                {activity.map((plant) => (
                  <li key={plant.id} className="flex items-start gap-2.5">
                    <CareIcon type={plant.lastCare!.type} size={14} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[12.5px] leading-tight text-ink-800">
                        <span className="font-semibold">{careLabel[plant.lastCare!.type]}</span>{' '}
                        {plant.name}
                      </p>
                      <p className="mt-0.5 text-[10.5px] text-ink-400">
                        {relativeTime(plant.lastCare!.createdAt)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-8 w-40" />
      </div>
      <Skeleton className="h-[210px] w-full rounded-3xl" />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[0, 1, 2, 3].map((key) => (
          <Skeleton key={key} className="h-[92px] rounded-2xl" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-[1.55fr_1fr]">
        <Skeleton className="h-[280px] rounded-3xl" />
        <Skeleton className="h-[280px] rounded-3xl" />
      </div>
    </div>
  )
}

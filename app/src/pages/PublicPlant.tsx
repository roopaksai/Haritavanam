import { Link, useParams } from 'react-router-dom'
import { ArrowRight, CalendarDays, HeartPulse, Leaf, MapPin, ScanLine, ShieldCheck, Sprout } from 'lucide-react'
import { api } from '../lib/api'
import { formatDate, plantAge, relativeTime, statusTheme } from '../lib/format'
import { useAsync } from '../lib/useAsync'
import { PlantImage } from '../components/PlantImage'
import { HealthRing } from '../components/HealthRing'
import { LogoMark } from '../components/brand'
import { Badge, Card, EmptyState, Skeleton } from '../components/ui'

export default function PublicPlant() {
  const { token } = useParams<{ token: string }>()
  const result = useAsync(() => api.publicPlant(token!), [token])

  const plant = result.data?.plant

  return (
    <div className="min-h-[100svh] bg-cream-200">
      <div className="mx-auto max-w-md px-4 pb-10 pt-5">
        <header className="flex items-center justify-between">
          <Link to="/welcome" className="flex items-center gap-2">
            <LogoMark size={30} />
            <span className="font-display text-[15px] font-semibold text-ink-900">Haritavanam</span>
          </Link>
          <span className="text-[9.5px] font-semibold uppercase tracking-[0.16em] text-forest-700/60">
            Public label
          </span>
        </header>

        {result.loading && !plant ? (
          <div className="mt-5 space-y-3 pb-safe pb-[70px]">
            <Skeleton className="h-[280px] rounded-3xl" />
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-[140px] rounded-3xl" />
          </div>
        ) : result.error || !plant ? (
          <Card className="mt-6">
            <EmptyState
              icon={<ScanLine size={22} />}
              title="This label is not linked"
              description="The code may be mistyped, or the plant record was removed. Try scanning the label again."
              action={
                <Link
                  to="/welcome"
                  className="inline-flex h-10 items-center gap-2 rounded-xl bg-forest-700 px-4 text-[13px] font-semibold text-cream-50"
                >
                  About Haritavanam <ArrowRight size={14} />
                </Link>
              }
            />
          </Card>
        ) : (
          <>
            <div className="mt-4 overflow-hidden rounded-3xl border border-forest-700/10 shadow-lift">
              <div className="relative h-[300px]">
                <PlantImage
                  src={plant.photoUrl}
                  alt={plant.name}
                  className="h-full w-full"
                  iconSize={40}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-forest-950/70 via-transparent to-forest-950/15" />
                <div className="absolute left-3 top-3">
                  <Badge className="border-cream-50/25 bg-cream-50/15 text-cream-50 backdrop-blur" dot>
                    {statusTheme[plant.status].label}
                  </Badge>
                </div>
                <div className="absolute bottom-3 right-3 rounded-full bg-cream-50/92 p-1 backdrop-blur">
                  <HealthRing value={plant.health} status={plant.status} size={52} stroke={9} />
                </div>
              </div>
            </div>

            <div className="mt-4">
              <h1 className="text-[28px] font-semibold leading-tight text-ink-900">{plant.name}</h1>
              <p className="mt-1 text-[13px] italic text-ink-400">
                {plant.species}
                {plant.localName ? ` · ${plant.localName}` : ''}
              </p>
              <p className="mt-2 flex items-center gap-1.5 text-[11.5px] text-ink-500">
                <MapPin size={12} aria-hidden />
                {plant.city}, {plant.region}
              </p>
            </div>

            <Card className="mt-4 p-4">
              <dl className="grid grid-cols-2 gap-x-4 gap-y-4">
                <div>
                  <dt className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-ink-400">
                    <CalendarDays size={11} /> Planted
                  </dt>
                  <dd className="mt-1 text-[13px] font-semibold text-ink-900">
                    {formatDate(plant.plantedOn)}
                  </dd>
                  <dd className="text-[10.5px] text-ink-400">{plantAge(plant.plantedOn)}</dd>
                </div>
                <div>
                  <dt className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-ink-400">
                    <HeartPulse size={11} /> Health
                  </dt>
                  <dd className="mt-1 text-[13px] font-semibold text-ink-900">{plant.health} / 100</dd>
                  <dd className="text-[10.5px] text-ink-400">{statusTheme[plant.status].label}</dd>
                </div>
                <div>
                  <dt className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-ink-400">
                    <Sprout size={11} /> Care logged
                  </dt>
                  <dd className="mt-1 text-[13px] font-semibold text-ink-900">
                    {plant.careCount} event{plant.careCount === 1 ? '' : 's'}
                  </dd>
                  <dd className="text-[10.5px] text-ink-400">
                    Last {relativeTime(plant.lastCaredAt)}
                  </dd>
                </div>
                <div>
                  <dt className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-ink-400">
                    <Leaf size={11} /> Cared for by
                  </dt>
                  <dd className="mt-1 text-[13px] font-semibold text-ink-900">{plant.ownerFirstName}</dd>
                  <dd className="text-[10.5px] text-ink-400">with an approved monitor</dd>
                </div>
              </dl>
            </Card>

            <div className="mt-3 flex items-start gap-2.5 rounded-2xl border border-forest-700/10 bg-sage-50 px-3.5 py-3">
              <ShieldCheck size={14} className="mt-0.5 shrink-0 text-forest-700" aria-hidden />
              <p className="text-[10.5px] leading-relaxed text-forest-800/80">
                This page shows only public details. Precise coordinates, contact information and field
                boundaries are never shared through a QR scan.
              </p>
            </div>

            <div className="mt-6 rounded-3xl border border-forest-700/10 bg-cream-50 p-4 text-center shadow-soft">
              <p className="text-[12px] leading-relaxed text-ink-500">
                Every tree in Haritavanam carries a record like this one.
              </p>
              <Link
                to="/welcome"
                className="mt-3 inline-flex h-10 items-center gap-2 rounded-xl bg-forest-700 px-4 text-[12.5px] font-semibold text-cream-50"
              >
                Learn about Haritavanam <ArrowRight size={14} />
              </Link>
            </div>

            <p className="mt-4 text-center text-[9.5px] text-ink-400">
              Label {plant.qrToken} · GITAM University, Bengaluru
            </p>
          </>
        )}
      </div>
    </div>
  )
}

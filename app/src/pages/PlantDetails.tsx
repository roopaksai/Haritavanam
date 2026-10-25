import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import QRCode from 'qrcode'
import {
  ArrowLeft,
  CalendarDays,
  Camera,
  Download,
  Droplets,
  HeartPulse,
  Leaf,
  MapPin,
  Pencil,
  QrCode as QrIcon,
  Ruler,
  ScanLine,
  Share2,
  ShieldCheck,
  Sparkles,
  Sprout,
  UserRound,
} from 'lucide-react'
import { api, ApiError, statusLabel } from '../lib/api'
import { useAuth } from '../lib/auth'
import {
  careLabel,
  carePast,
  dueLabel,
  formatArea,
  formatDate,
  plantAge,
  relativeTime,
  statusTheme,
} from '../lib/format'
import type { CareType, PlantStatus } from '../lib/types'
import { useAsync } from '../lib/useAsync'
import { useToast } from '../lib/toast'
import { MapView } from '../components/MapView'
import { PlantImage } from '../components/PlantImage'
import { HealthRing } from '../components/HealthRing'
import { CareIcon } from '../components/CareIcon'
import {
  Avatar,
  Badge,
  Button,
  Card,
  ErrorState,
  Field,
  Input,
  Segmented,
  Select,
  Sheet,
  Skeleton,
  Textarea,
} from '../components/ui'

type Tab = 'overview' | 'care' | 'scans'

export default function PlantDetails() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()

  const result = useAsync(() => api.plant(id!), [id])
  const [tab, setTab] = useState<Tab>('overview')
  const [careOpen, setCareOpen] = useState(false)
  const [scanOpen, setScanOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [qr, setQr] = useState<string | null>(null)

  const data = result.data
  const plant = data?.plant
  const careLogs = data?.careLogs ?? []
  const scans = data?.scans ?? []

  const publicUrl = useMemo(() => {
    if (!plant) return ''
    return `${window.location.origin}/p/${plant.qrToken}`
  }, [plant?.qrToken])

  useEffect(() => {
    if (!publicUrl) return
    QRCode.toDataURL(publicUrl, {
      margin: 1,
      width: 360,
      errorCorrectionLevel: 'M',
      color: { dark: '#1B2F23', light: '#FDFCF7' },
    })
      .then(setQr)
      .catch(() => setQr(null))
  }, [publicUrl])

  async function share() {
    if (!plant) return
    try {
      if (navigator.share) {
        await navigator.share({ title: plant.name, text: `Plant record for ${plant.name}`, url: publicUrl })
        return
      }
      await navigator.clipboard.writeText(publicUrl)
      toast.success('Public label link copied')
    } catch {
      toast.info(publicUrl)
    }
  }

  async function waterNow() {
    if (!plant) return
    try {
      await api.logCare(plant.id, { type: 'water', note: 'Quick log from plant page' })
      toast.success(`${plant.name} watered`)
      result.reload()
    } catch (cause) {
      toast.error(cause instanceof ApiError ? cause.message : 'Could not log that watering')
    }
  }

  if (result.loading && !data) return <DetailsSkeleton />
  if (result.error) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" icon={<ArrowLeft size={15} />} onClick={() => navigate(-1)}>
          Back
        </Button>
        <ErrorState message={result.error} onRetry={result.reload} />
      </div>
    )
  }
  if (!plant) return null

  const status = statusTheme[plant.status]
  const due = dueLabel(plant.nextWateringDue)

  return (
    <div className="pb-4 pb-safe pb-[70px]">
      {/* hero */}
      <div className="relative -mx-4 -mt-4 overflow-hidden sm:rounded-3xl lg:-mx-8 lg:-mt-6">
        <div className="relative h-[268px] sm:h-[330px]">
          <PlantImage src={plant.photoUrl} alt={plant.name} className="h-full w-full" iconSize={44} />
          <div className="absolute inset-0 bg-gradient-to-t from-forest-950/85 via-forest-950/20 to-forest-950/35" />

          <div className="absolute inset-x-0 top-0 flex items-center justify-between p-3.5">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="grid h-9 w-9 place-items-center rounded-full bg-cream-50/90 text-forest-900 shadow-soft backdrop-blur transition hover:bg-cream-50"
              aria-label="Back"
            >
              <ArrowLeft size={17} />
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => void share()}
                className="grid h-9 w-9 place-items-center rounded-full bg-cream-50/90 text-forest-900 shadow-soft backdrop-blur transition hover:bg-cream-50"
                aria-label="Share public label"
              >
                <Share2 size={16} />
              </button>
              {data.permissions.canEdit ? (
                <button
                  type="button"
                  onClick={() => setEditOpen(true)}
                  className="grid h-9 w-9 place-items-center rounded-full bg-cream-50/90 text-forest-900 shadow-soft backdrop-blur transition hover:bg-cream-50"
                  aria-label="Edit plant"
                >
                  <Pencil size={15} />
                </button>
              ) : null}
            </div>
          </div>

          <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6">
            <Badge className="border-cream-50/25 bg-cream-50/15 text-cream-50 backdrop-blur" dot>
              {status.label}
            </Badge>
            <h1 className="mt-2.5 text-[30px] font-semibold leading-none text-cream-50 sm:text-[38px]">
              {plant.name}
            </h1>
            <p className="mt-1.5 text-[12.5px] italic text-cream-100/75">
              {plant.species}
              {plant.localName ? ` · ${plant.localName}` : ''}
            </p>
          </div>
        </div>
      </div>

      <div className="-mt-5 rounded-t-[26px] bg-cream-200 px-1 pt-4 lg:-mt-6">
        {/* health strip */}
        <Card className="flex items-center gap-4 p-4">
          <HealthRing value={plant.health} status={plant.status} size={74} label="health" />
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-400">
              Care status
            </p>
            <p className="mt-1 text-[15px] font-semibold leading-tight text-ink-900">{status.label}</p>
            <p
              className={`mt-1 text-[11.5px] ${
                due.tone === 'late' ? 'font-semibold text-clay-600' : 'text-ink-500'
              }`}
            >
              {due.text}
              {plant.lastWateredAt ? ` · last watered ${relativeTime(plant.lastWateredAt)}` : ''}
            </p>
          </div>
          <div className="hidden shrink-0 border-l border-cream-300 pl-4 text-right sm:block">
            <p className="text-[10px] uppercase tracking-wider text-ink-400">Care logs</p>
            <p className="mt-1 font-display text-xl font-semibold tabular-nums text-ink-900">
              {plant.careCount ?? careLogs.length}
            </p>
          </div>
        </Card>

        {/* actions */}
        <div className="mt-3 grid grid-cols-4 gap-2">
          <ActionTile icon={<Droplets size={17} />} label="Water" onClick={() => void waterNow()} />
          <ActionTile icon={<Sprout size={17} />} label="Log care" onClick={() => setCareOpen(true)} />
          <ActionTile icon={<ScanLine size={17} />} label="Health check" onClick={() => setScanOpen(true)} />
          <ActionTile
            icon={<QrIcon size={17} />}
            label="Label"
            onClick={() => {
              document.getElementById('plant-label')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
            }}
          />
        </div>

        <div className="mt-5">
          <Segmented
            ariaLabel="Plant sections"
            options={[
              { value: 'overview', label: 'Overview' },
              { value: 'care', label: 'Care log', count: careLogs.length },
              { value: 'scans', label: 'Checks', count: scans.length },
            ]}
            value={tab}
            onChange={setTab}
          />
        </div>

        <div className="mt-4 grid gap-5 lg:grid-cols-[1.55fr_1fr]">
          <div className="space-y-5">
            {tab === 'overview' ? (
              <>
                <Card className="p-4">
                  <h2 className="text-[16px] font-semibold text-ink-900">About this plant</h2>
                  <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3">
                    <InfoCell icon={<Leaf size={13} />} label="Species" value={plant.species} />
                    <InfoCell
                      icon={<CalendarDays size={13} />}
                      label="Planted"
                      value={`${formatDate(plant.plantedOn)} · ${plantAge(plant.plantedOn)}`}
                    />
                    <InfoCell
                      icon={<Ruler size={13} />}
                      label="Canopy area"
                      value={formatArea(plant.areaSqm)}
                    />
                    <InfoCell
                      icon={<MapPin size={13} />}
                      label="Coordinates"
                      value={`${plant.lat.toFixed(5)}, ${plant.lng.toFixed(5)}`}
                    />
                  </dl>

                  {plant.notes ? (
                    <div className="mt-4 rounded-2xl border border-amber-600/15 bg-amber-100/60 p-3">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-600">
                        Field note
                      </p>
                      <p className="mt-1 text-[12.5px] leading-relaxed text-ink-700">{plant.notes}</p>
                    </div>
                  ) : null}
                </Card>

                <Card className="overflow-hidden" id="plant-label">
                  <div className="flex items-center justify-between px-4 pt-4">
                    <h2 className="text-[16px] font-semibold text-ink-900">Public label</h2>
                    <Badge className="border-forest-700/15 bg-sage-100 text-forest-800">QR</Badge>
                  </div>
                  <div className="flex flex-col items-center gap-4 px-4 pb-4 pt-3 sm:flex-row">
                    <div className="rounded-2xl border border-forest-700/10 bg-cream-50 p-2">
                      {qr ? (
                        <img src={qr} alt={`QR label for ${plant.name}`} className="h-32 w-32" />
                      ) : (
                        <Skeleton className="h-32 w-32" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1 text-center sm:text-left">
                      <p className="text-[12.5px] leading-relaxed text-ink-500">
                        Scanning this label opens a public page with the plant&apos;s name, age and care
                        count — never personal data or field boundaries.
                      </p>
                      <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
                        <Link to={`/p/${plant.qrToken}`} target="_blank">
                          <Button size="sm" variant="secondary" icon={<QrIcon size={14} />}>
                            Preview
                          </Button>
                        </Link>
                        {qr ? (
                          <a href={qr} download={`haritavanam-${plant.qrToken}.png`}>
                            <Button size="sm" variant="ghost" icon={<Download size={14} />}>
                              Download
                            </Button>
                          </a>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <h2 className="text-[16px] font-semibold text-ink-900">Where it stands</h2>
                  <p className="mt-1 text-[11.5px] text-ink-500">
                    {plant.address ?? 'GITAM University campus'}
                  </p>
                  <div className="mt-3 h-[180px] overflow-hidden rounded-2xl sm:pb-0">
                    <MapView
                      plants={[plant]}
                      fields={[]}
                      selectedId={plant.id}
                      center={[plant.lat, plant.lng]}
                      zoom={18}
                      className="h-full w-full"
                    />
                  </div>
                </Card>
              </>
            ) : null}

            {tab === 'care' ? (
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-[16px] font-semibold text-ink-900">Care history</h2>
                  {data.permissions.canLogCare ? (
                    <Button size="sm" icon={<Sprout size={14} />} onClick={() => setCareOpen(true)}>
                      Log care
                    </Button>
                  ) : null}
                </div>

                {careLogs.length === 0 ? (
                  <p className="py-8 text-center text-[12.5px] text-ink-400">
                    No care logged yet. Start with a watering.
                  </p>
                ) : (
                  <ol className="mt-4 space-y-0">
                    {careLogs.map((log, index) => (
                      <li key={log.id} className="relative flex gap-3 pb-5 last:pb-0">
                        {index < careLogs.length - 1 ? (
                          <span className="absolute left-4 top-9 h-[calc(100%-1.5rem)] w-px bg-cream-400" />
                        ) : null}
                        <CareIcon type={log.type} />
                        <div className="min-w-0 flex-1 pt-0.5">
                          <p className="text-[13px] font-semibold leading-tight text-ink-900">
                            {careLabel[log.type]}
                          </p>
                          {log.note ? (
                            <p className="mt-1 text-[12px] leading-relaxed text-ink-500">{log.note}</p>
                          ) : null}
                          <p className="mt-1 text-[10.5px] text-ink-400">
                            {log.actorName} · {relativeTime(log.createdAt)}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ol>
                )}
              </Card>
            ) : null}

            {tab === 'scans' ? (
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-[16px] font-semibold text-ink-900">Health checks</h2>
                    <p className="mt-0.5 text-[11px] text-ink-400">
                      Simulated analysis — confirm findings with an arborist.
                    </p>
                  </div>
                  <Button size="sm" icon={<Sparkles size={14} />} onClick={() => setScanOpen(true)}>
                    Run check
                  </Button>
                </div>

                {scans.length === 0 ? (
                  <div className="mt-4 rounded-2xl border border-dashed border-forest-700/20 px-4 py-7 text-center">
                    <ScanLine size={22} className="mx-auto text-forest-600/50" aria-hidden />
                    <p className="mt-2 text-[12.5px] text-ink-500">
                      No checks yet. Photograph a leaf or describe what changed.
                    </p>
                  </div>
                ) : (
                  <ul className="mt-4 space-y-3">
                    {scans.map((scan) => (
                      <li key={scan.id} className="rounded-2xl border border-forest-700/10 bg-cream-100/60 p-3">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-400">
                            {relativeTime(scan.createdAt)}
                          </p>
                          <Badge className="border-forest-700/15 bg-cream-50 text-forest-700">
                            {scan.provider === 'mock' ? 'Simulated' : scan.provider}
                          </Badge>
                        </div>
                        <div className="mt-2 space-y-2">
                          {scan.results.map((item) => (
                            <div key={item.name}>
                              <div className="flex items-baseline justify-between gap-2">
                                <p className="text-[12.5px] font-semibold text-ink-900">{item.name}</p>
                                <span className="shrink-0 text-[11px] font-semibold tabular-nums text-forest-700">
                                  {Math.round(item.confidence * 100)}%
                                </span>
                              </div>
                              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-cream-300">
                                <div
                                  className="h-full rounded-full bg-forest-600"
                                  style={{ width: `${Math.round(item.confidence * 100)}%` }}
                                />
                              </div>
                              <p className="mt-1 text-[11px] leading-snug text-ink-500">{item.advice}</p>
                            </div>
                          ))}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            ) : null}
          </div>

          {/* sidebar */}
          <div className="space-y-5">
            <Card className="p-4">
              <div className="flex items-center gap-2">
                <ShieldCheck size={15} className="text-forest-700" aria-hidden />
                <h2 className="text-[15px] font-semibold text-ink-900">Two-person care</h2>
              </div>
              <p className="mt-1 text-[11px] leading-relaxed text-ink-400">
                Each record has one owner and at most one monitor. An administrator approves every
                change.
              </p>

              <div className="mt-3 space-y-2">
                <PersonRow name={plant.ownerName} role="Owner" />
                {plant.monitorName ? (
                  <PersonRow name={plant.monitorName} role="Monitor" />
                ) : (
                  <div className="flex items-center gap-2.5 rounded-xl border border-dashed border-forest-700/20 px-2.5 py-2">
                    <span className="grid h-8 w-8 place-items-center rounded-full bg-cream-200 text-ink-400">
                      <UserRound size={15} />
                    </span>
                    <div>
                      <p className="text-[12px] font-semibold text-ink-500">No monitor yet</p>
                      <p className="text-[10px] text-ink-400">Nominate someone for admin approval</p>
                    </div>
                  </div>
                )}
              </div>

              {user?.role === 'owner' && plant.ownerId === user.id && !plant.monitorName ? (
                <Link to="/settings">
                  <Button variant="secondary" size="sm" full className="mt-3">
                    Nominate a monitor
                  </Button>
                </Link>
              ) : null}
            </Card>

            <Card className="p-4">
              <h2 className="text-[15px] font-semibold text-ink-900">Care rhythm</h2>
              <ul className="mt-3 space-y-3">
                <RhythmRow label="Watering" value={due.text} highlight={due.tone === 'late'} />
                <RhythmRow label="Last watered" value={relativeTime(plant.lastWateredAt)} />
                <RhythmRow label="Planted" value={formatDate(plant.plantedOn)} />
                <RhythmRow label="Scans" value={`${plant.scanCount ?? 0} label scans`} />
              </ul>
            </Card>

            <Card className="p-4">
              <h2 className="text-[15px] font-semibold text-ink-900">Care types</h2>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {(Object.keys(carePast) as CareType[]).map((type) => (
                  <span
                    key={type}
                    className="inline-flex items-center gap-1.5 rounded-full border border-forest-700/10 bg-cream-100 px-2.5 py-1 text-[10.5px] font-medium text-ink-600"
                  >
                    <CareIcon type={type} size={11} withBackground={false} />
                    {carePast[type]}
                  </span>
                ))}
              </div>
              <div className="mt-3 flex items-center gap-2 rounded-xl bg-sage-50 px-2.5 py-2">
                <HeartPulse size={13} className="text-forest-600" aria-hidden />
                <p className="text-[10.5px] leading-snug text-forest-800/75">
                  Health drops below 65 when two scheduled waterings are missed.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <CareSheet
        open={careOpen}
        onClose={() => setCareOpen(false)}
        plantId={plant.id}
        plantName={plant.name}
        onSaved={() => {
          setCareOpen(false)
          result.reload()
        }}
      />

      <ScanSheet
        open={scanOpen}
        plantId={plant.id}
        plantName={plant.name}
        onClose={() => setScanOpen(false)}
        onSaved={() => {
          setScanOpen(false)
          setTab('scans')
          result.reload()
        }}
      />

      {plant ? (
        <EditSheet
          open={editOpen}
          plant={plant}
          onClose={() => setEditOpen(false)}
          onSaved={() => {
            setEditOpen(false)
            result.reload()
          }}
        />
      ) : null}
    </div>
  )
}

/* ------------------------------------------------------------------ parts */

function ActionTile({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center gap-1.5 rounded-2xl border border-forest-700/10 bg-cream-50 py-2.5 shadow-soft transition hover:border-forest-700/25 hover:bg-cream-100 active:scale-[0.98]"
    >
      <span className="text-forest-700">{icon}</span>
      <span className="text-[10.5px] font-semibold text-ink-700">{label}</span>
    </button>
  )
}

function InfoCell({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div>
      <dt className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-ink-400">
        {icon}
        {label}
      </dt>
      <dd className="mt-1 text-[12.5px] font-medium leading-snug text-ink-800">{value}</dd>
    </div>
  )
}

function PersonRow({ name, role }: { name?: string | null; role: string }) {
  return (
    <div className="flex items-center gap-2.5 rounded-xl bg-cream-100 px-2.5 py-2">
      <Avatar name={name} size={30} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[12px] font-semibold text-ink-900">{name ?? 'Unassigned'}</p>
        <p className="text-[10px] uppercase tracking-wider text-ink-400">{role}</p>
      </div>
    </div>
  )
}

function RhythmRow({
  label,
  value,
  highlight = false,
}: {
  label: string
  value: string
  highlight?: boolean
}) {
  return (
    <li className="flex items-center justify-between gap-3 border-b border-cream-300 pb-2 last:border-0 last:pb-0">
      <span className="text-[11.5px] text-ink-400">{label}</span>
      <span
        className={`text-right text-[11.5px] font-semibold ${
          highlight ? 'text-clay-600' : 'text-ink-800'
        }`}
      >
        {value}
      </span>
    </li>
  )
}

function DetailsSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="-mx-4 h-[268px] rounded-none sm:rounded-3xl lg:-mx-8" />
      <Skeleton className="h-[96px] rounded-3xl" />
      <div className="grid grid-cols-4 gap-2">
        {[0, 1, 2, 3].map((key) => (
          <Skeleton key={key} className="h-[70px] rounded-2xl" />
        ))}
      </div>
      <Skeleton className="h-[220px] rounded-3xl" />
    </div>
  )
}

/* ------------------------------------------------------------------ sheets */

function CareSheet({
  open,
  onClose,
  plantId,
  plantName,
  onSaved,
}: {
  open: boolean
  onClose: () => void
  plantId: string
  plantName: string
  onSaved: () => void
}) {
  const toast = useToast()
  const [type, setType] = useState<CareType>('water')
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      setType('water')
      setNote('')
    }
  }, [open])

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Log care"
      description={`Record what you did for ${plantName}.`}
      footer={
        <Button full loading={saving} onClick={() => void submit()}>
          Save care log
        </Button>
      }
    >
      <div className="space-y-4">
        <Field label="Care type">
          <div className="grid grid-cols-3 gap-2">
            {(Object.keys(carePast) as CareType[]).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setType(option)}
                className={`flex flex-col items-center gap-1.5 rounded-2xl border px-2 py-2.5 text-[11px] font-semibold transition ${
                  type === option
                    ? 'border-forest-700 bg-sage-100 text-forest-900'
                    : 'border-forest-700/12 bg-cream-50 text-ink-500 hover:border-forest-700/25'
                }`}
              >
                <CareIcon type={option} size={15} withBackground={false} />
                {carePast[option]}
              </button>
            ))}
          </div>
        </Field>

        <Field label="Note" hint="Optional — what changed, how much water, anything unusual.">
          <Textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Deep watering, 12 litres at the root zone…"
            maxLength={280}
          />
        </Field>
      </div>
    </Sheet>
  )

  async function submit() {
    setSaving(true)
    try {
      await api.logCare(plantId, { type, note })
      toast.success(`${carePast[type]} logged`)
      onSaved()
    } catch (cause) {
      toast.error(cause instanceof ApiError ? cause.message : 'Could not save that log')
    } finally {
      setSaving(false)
    }
  }
}

function ScanSheet({
  open,
  onClose,
  plantId,
  plantName,
  onSaved,
}: {
  open: boolean
  onClose: () => void
  plantId: string
  plantName: string
  onSaved: () => void
}) {
  const toast = useToast()
  const [symptom, setSymptom] = useState('')
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [running, setRunning] = useState(false)
  const [outcome, setOutcome] = useState<{
    results: Array<{ name: string; confidence: number; severity: string; advice: string }>
    note: string
    disclaimer: string
  } | null>(null)

  useEffect(() => {
    if (open) {
      setSymptom('')
      setImageUrl(null)
      setOutcome(null)
    }
  }, [open])

  async function pickFile(file: File | null) {
    if (!file) return
    setUploading(true)
    try {
      const data = await api.upload(file)
      setImageUrl(data.url)
      toast.success('Photo attached')
    } catch {
      const reader = new FileReader()
      reader.onload = () => setImageUrl(String(reader.result))
      reader.readAsDataURL(file)
    } finally {
      setUploading(false)
    }
  }

  async function run() {
    if (!symptom.trim() && !imageUrl) {
      toast.info('Add a photo or describe the symptom first')
      return
    }
    setRunning(true)
    try {
      const data = await api.analyze({
        plantId,
        symptomText: symptom.trim() || undefined,
        imageUrl: imageUrl ?? undefined,
      })
      setOutcome({
        results: data.scan.results,
        note: data.providerNote,
        disclaimer: data.disclaimer,
      })
    } catch (cause) {
      toast.error(cause instanceof ApiError ? cause.message : 'Analysis failed')
    } finally {
      setRunning(false)
    }
  }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Health check"
      description={`A photo or a description of ${plantName}.`}
      footer={
        outcome ? (
          <Button full onClick={onSaved}>
            Done
          </Button>
        ) : (
          <Button full loading={running} onClick={() => void run()} icon={<Sparkles size={15} />}>
            Analyze
          </Button>
        )
      }
    >
      <div className="space-y-4">
        <div className="flex items-center gap-2 rounded-2xl border border-amber-600/20 bg-amber-100/70 px-3 py-2.5">
          <ShieldCheck size={15} className="shrink-0 text-amber-600" aria-hidden />
          <p className="text-[11px] leading-snug text-amber-600">
            This build simulates the result. A provider key can be added later without changing this
            screen.
          </p>
        </div>

        <Field label="Photo" hint="A clear, close photo of an affected leaf works best.">
          <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-dashed border-forest-700/25 bg-cream-100/60 px-3.5 py-3 transition hover:border-forest-700/45">
            {imageUrl ? (
              <img src={imageUrl} alt="Attached symptom" className="h-14 w-14 rounded-xl object-cover" />
            ) : (
              <span className="grid h-14 w-14 place-items-center rounded-xl bg-cream-50 text-forest-600">
                <Camera size={20} />
              </span>
            )}
            <span className="flex-1">
              <span className="block text-[12.5px] font-semibold text-ink-800">
                {uploading ? 'Uploading…' : imageUrl ? 'Photo attached' : 'Attach a photo'}
              </span>
              <span className="block text-[10.5px] text-ink-400">JPG or PNG, up to 6 MB</span>
            </span>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              className="sr-only"
              onChange={(event) => void pickFile(event.target.files?.[0] ?? null)}
            />
          </label>
        </Field>

        <Field label="What do you notice?" hint="Yellowing, spots, curling, pests, bark damage…">
          <Textarea
            value={symptom}
            onChange={(event) => setSymptom(event.target.value)}
            placeholder="Older leaves have yellow edges and small dark spots…"
            maxLength={400}
          />
        </Field>

        {outcome ? (
          <div className="space-y-3">
            {outcome.results.map((item) => (
              <div key={item.name} className="rounded-2xl border border-forest-700/12 bg-cream-100/60 p-3">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="text-[12.5px] font-semibold text-ink-900">{item.name}</p>
                  <span className="shrink-0 text-[11px] font-semibold tabular-nums text-forest-700">
                    {Math.round(item.confidence * 100)}%
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-cream-300">
                  <div
                    className="h-full rounded-full bg-forest-600"
                    style={{ width: `${Math.round(item.confidence * 100)}%` }}
                  />
                </div>
                <p className="mt-1.5 text-[11px] leading-snug text-ink-500">{item.advice}</p>
              </div>
            ))}
            <p className="text-[10.5px] leading-relaxed text-ink-400">{outcome.disclaimer}</p>
          </div>
        ) : null}
      </div>
    </Sheet>
  )
}

function EditSheet({
  open,
  plant,
  onClose,
  onSaved,
}: {
  open: boolean
  plant: { id: string; name: string; species: string; localName?: string | null; status: PlantStatus; health: number; notes?: string | null }
  onClose: () => void
  onSaved: () => void
}) {
  const toast = useToast()
  const [name, setName] = useState(plant.name)
  const [species, setSpecies] = useState(plant.species)
  const [localName, setLocalName] = useState(plant.localName ?? '')
  const [status, setStatus] = useState<PlantStatus>(plant.status)
  const [health, setHealth] = useState(String(plant.health))
  const [notes, setNotes] = useState(plant.notes ?? '')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      setName(plant.name)
      setSpecies(plant.species)
      setLocalName(plant.localName ?? '')
      setStatus(plant.status)
      setHealth(String(plant.health))
      setNotes(plant.notes ?? '')
    }
  }, [open, plant])

  async function save() {
    setSaving(true)
    try {
      await api.updatePlant(plant.id, {
        name,
        species,
        localName: localName || null,
        status,
        health: Number(health),
        notes: notes || null,
      })
      toast.success('Plant record updated')
      onSaved()
    } catch (cause) {
      toast.error(cause instanceof ApiError ? cause.message : 'Could not save')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Edit record"
      footer={
        <Button full loading={saving} onClick={() => void save()}>
          Save changes
        </Button>
      }
    >
      <div className="space-y-3.5">
        <Field label="Name">
          <Input value={name} onChange={(event) => setName(event.target.value)} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Species">
            <Input value={species} onChange={(event) => setSpecies(event.target.value)} />
          </Field>
          <Field label="Local name">
            <Input value={localName} onChange={(event) => setLocalName(event.target.value)} />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Status">
            <Select value={status} onChange={(event) => setStatus(event.target.value as PlantStatus)}>
              {(Object.keys(statusLabel) as PlantStatus[]).map((option) => (
                <option key={option} value={option}>
                  {statusLabel[option]}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Health (0–100)">
            <Input
              type="number"
              min={0}
              max={100}
              value={health}
              onChange={(event) => setHealth(event.target.value)}
            />
          </Field>
        </div>
        <Field label="Notes">
          <Textarea value={notes} onChange={(event) => setNotes(event.target.value)} />
        </Field>
      </div>
    </Sheet>
  )
}

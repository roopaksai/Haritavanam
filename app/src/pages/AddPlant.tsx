import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  Check,
  MapPin,
  Sprout,
  Trees,
} from 'lucide-react'
import { api, ApiError } from '../lib/api'
import { formatArea } from '../lib/format'
import { useToast } from '../lib/toast'
import { CAMPUS_CENTER, MapView } from '../components/MapView'
import { PlantImage } from '../components/PlantImage'
import { Button, Card, Field, Input, Select, Textarea } from '../components/ui'

const STEPS = ['Identity', 'Location', 'Photo & review'] as const

export default function AddPlant() {
  const navigate = useNavigate()
  const toast = useToast()

  const [step, setStep] = useState(0)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [name, setName] = useState('')
  const [species, setSpecies] = useState('')
  const [localName, setLocalName] = useState('')
  const [plantedOn, setPlantedOn] = useState(new Date().toISOString().slice(0, 10))
  const [notes, setNotes] = useState('')
  const [status, setStatus] = useState<'new' | 'healthy'>('new')

  const [point, setPoint] = useState<[number, number]>(CAMPUS_CENTER)
  const [picked, setPicked] = useState(false)
  const [address, setAddress] = useState('GITAM University, Nagadenahalli, Bengaluru North')
  const [areaSqm, setAreaSqm] = useState('')

  const [photoUrl, setPhotoUrl] = useState<string | null>(null)

  const identityValid = useMemo(() => name.trim().length >= 2 && species.trim().length >= 2, [name, species])

  function next() {
    setError(null)
    if (step === 0 && !identityValid) {
      setError('Add a name and a species before continuing.')
      return
    }
    setStep((value) => Math.min(STEPS.length - 1, value + 1))
  }

  async function upload(file: File | null) {
    if (!file) return
    setUploading(true)
    try {
      const data = await api.upload(file)
      setPhotoUrl(data.url)
      toast.success('Photo added')
    } catch (cause) {
      toast.error(cause instanceof ApiError ? cause.message : 'Could not upload that photo')
    } finally {
      setUploading(false)
    }
  }

  async function submit() {
    if (!identityValid) {
      setStep(0)
      setError('Add a name and a species before saving.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      const { plant } = await api.createPlant({
        name: name.trim(),
        species: species.trim(),
        localName: localName.trim() || null,
        plantedOn,
        notes: notes.trim() || null,
        status,
        health: status === 'healthy' ? 90 : 100,
        lat: point[0],
        lng: point[1],
        address: address.trim() || null,
        areaSqm: areaSqm ? Number(areaSqm) : null,
        photoUrl,
      })
      toast.success(`${plant.name} is now on the map`)
      navigate(`/plants/${plant.id}`, { replace: true })
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : 'Could not save this plant')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => (step === 0 ? navigate(-1) : setStep((value) => value - 1))}
          className="grid h-9 w-9 place-items-center rounded-full border border-forest-700/12 bg-cream-50 text-forest-800"
          aria-label={step === 0 ? 'Back' : 'Previous step'}
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 className="text-[24px] font-semibold leading-tight text-ink-900 sm:text-[27px]">
            Register a plant
          </h1>
          <p className="mt-0.5 text-[12px] text-ink-500">Three short steps. You can edit later.</p>
        </div>
      </div>

      {/* stepper */}
      <ol className="flex items-center gap-2">
        {STEPS.map((label, index) => {
          const state = index === step ? 'current' : index < step ? 'done' : 'todo'
          return (
            <li key={label} className="flex flex-1 items-center gap-2">
              <span
                className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-[11px] font-bold transition ${
                  state === 'done'
                    ? 'bg-forest-700 text-cream-50'
                    : state === 'current'
                      ? 'bg-forest-700/12 text-forest-800 ring-2 ring-forest-700'
                      : 'bg-cream-300 text-ink-400'
                }`}
              >
                {state === 'done' ? <Check size={13} /> : index + 1}
              </span>
              <span
                className={`hidden truncate text-[11.5px] font-semibold sm:block ${
                  state === 'todo' ? 'text-ink-400' : 'text-ink-800'
                }`}
              >
                {label}
              </span>
              {index < STEPS.length - 1 ? <span className="h-px flex-1 bg-cream-400" /> : null}
            </li>
          )
        })}
      </ol>

      <Card className="p-4 sm:p-5">
        {step === 0 ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Trees size={16} className="text-forest-700" aria-hidden />
              <h2 className="text-[16px] font-semibold text-ink-900">What did you plant?</h2>
            </div>

            <Field label="Name" hint="A name you will recognise on the map.">
              <Input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Neem Grove 13"
                autoFocus
              />
            </Field>

            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Species" hint="Scientific or common name.">
                <Input
                  value={species}
                  onChange={(event) => setSpecies(event.target.value)}
                  placeholder="Azadirachta indica"
                />
              </Field>
              <Field label="Local name">
                <Input
                  value={localName}
                  onChange={(event) => setLocalName(event.target.value)}
                  placeholder="Neem"
                />
              </Field>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Planted on">
                <Input
                  type="date"
                  value={plantedOn}
                  max={new Date().toISOString().slice(0, 10)}
                  onChange={(event) => setPlantedOn(event.target.value)}
                />
              </Field>
              <Field label="Status">
                <Select value={status} onChange={(event) => setStatus(event.target.value as 'new' | 'healthy')}>
                  <option value="new">Newly planted</option>
                  <option value="healthy">Established & healthy</option>
                </Select>
              </Field>
            </div>

            <Field label="Field note" hint="Optional — soil, pests, anything worth remembering.">
              <Textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Planted with compost; needs staking for the first monsoon."
                maxLength={300}
              />
            </Field>
          </div>
        ) : null}

        {step === 1 ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-forest-700" aria-hidden />
              <h2 className="text-[16px] font-semibold text-ink-900">Where does it stand?</h2>
            </div>
            <p className="text-[12px] leading-relaxed text-ink-500">
              Tap the map to drop the pin. Accuracy within a few metres is plenty.
            </p>

            <div className="overflow-hidden rounded-2xl border border-forest-700/12">
              <MapView
                plants={[]}
                fields={[]}
                center={point}
                zoom={picked ? 18 : 16}
                onPick={(lat, lng) => {
                  setPoint([lat, lng])
                  setPicked(true)
                }}
                pickedPoint={point}
                className="h-[300px] w-full"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-sage-100 px-3 py-1.5 text-[11px] font-semibold text-forest-800">
                <MapPin size={12} aria-hidden />
                {point[0].toFixed(5)}, {point[1].toFixed(5)}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setPoint(CAMPUS_CENTER)
                  setPicked(false)
                }}
              >
                Reset to campus centre
              </Button>
            </div>

            <Field label="Address or landmark">
              <Input value={address} onChange={(event) => setAddress(event.target.value)} />
            </Field>

            <Field label="Canopy area (m²)" hint="Optional — useful for fields and orchards.">
              <Input
                type="number"
                min={0}
                value={areaSqm}
                onChange={(event) => setAreaSqm(event.target.value)}
                placeholder="e.g. 240"
              />
            </Field>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Sprout size={16} className="text-forest-700" aria-hidden />
              <h2 className="text-[16px] font-semibold text-ink-900">A photo and a final look</h2>
            </div>

            <Field label="Photo" hint="Helps a monitor recognise the plant months later.">
              <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-dashed border-forest-700/25 bg-cream-100/60 px-3.5 py-3 transition hover:border-forest-700/45">
                {photoUrl ? (
                  <img src={photoUrl} alt="Plant" className="h-16 w-16 rounded-xl object-cover" />
                ) : (
                  <span className="grid h-16 w-16 place-items-center rounded-xl bg-cream-50 text-forest-600">
                    <Camera size={22} />
                  </span>
                )}
                <span className="flex-1">
                  <span className="block text-[12.5px] font-semibold text-ink-800">
                    {uploading ? 'Uploading…' : photoUrl ? 'Replace photo' : 'Add a photo'}
                  </span>
                  <span className="block text-[10.5px] text-ink-400">JPG or PNG, up to 6 MB</span>
                </span>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="sr-only"
                  onChange={(event) => void upload(event.target.files?.[0] ?? null)}
                />
              </label>
            </Field>

            <div className="rounded-2xl border border-forest-700/10 bg-cream-100/60 p-3.5">
              <div className="flex items-start gap-3">
                <PlantImage
                  src={photoUrl}
                  alt={name || 'New plant'}
                  className="h-14 w-14 shrink-0 rounded-xl"
                  iconSize={18}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-semibold text-ink-900">{name || 'Untitled plant'}</p>
                  <p className="truncate text-[11.5px] italic text-ink-400">{species || 'Species missing'}</p>
                  <p className="mt-1 text-[11px] text-ink-500">
                    {localName ? `${localName} · ` : ''}
                    {formatArea(areaSqm ? Number(areaSqm) : null)}
                  </p>
                </div>
              </div>
              <dl className="mt-3 grid grid-cols-2 gap-3 border-t border-cream-300 pt-3 text-[11px]">
                <div>
                  <dt className="text-ink-400">Planted</dt>
                  <dd className="mt-0.5 font-semibold text-ink-800">{plantedOn}</dd>
                </div>
                <div>
                  <dt className="text-ink-400">Pin</dt>
                  <dd className="mt-0.5 font-semibold text-ink-800">
                    {point[0].toFixed(5)}, {point[1].toFixed(5)}
                  </dd>
                </div>
                <div className="col-span-2">
                  <dt className="text-ink-400">Address</dt>
                  <dd className="mt-0.5 font-semibold text-ink-800">{address || 'Not set'}</dd>
                </div>
              </dl>
            </div>

            <p className="text-[11px] leading-relaxed text-ink-400">
              A QR label is generated automatically. You will be the owner; a monitor can be nominated
              later and must be approved by an administrator.
            </p>
          </div>
        ) : null}

        {error ? (
          <p className="mt-4 rounded-xl border border-clay-600/20 bg-clay-100 px-3 py-2 text-[12px] font-medium text-clay-700">
            {error}
          </p>
        ) : null}

        <div className="mt-5 flex items-center justify-between gap-3 border-t border-cream-300 pt-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => (step === 0 ? navigate(-1) : setStep((value) => value - 1))}
          >
            {step === 0 ? 'Cancel' : 'Back'}
          </Button>

          {step < STEPS.length - 1 ? (
            <Button size="sm" onClick={next} icon={<ArrowRight size={15} />}>
              Continue
            </Button>
          ) : (
            <Button size="sm" loading={saving} onClick={() => void submit()} icon={<Check size={15} />}>
              Save plant
            </Button>
          )}
        </div>
      </Card>
    </div>
  )
}

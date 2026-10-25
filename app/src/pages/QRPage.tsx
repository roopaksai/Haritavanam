import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import QRCode from 'qrcode'
import {
  Camera,
  CameraOff,
  Download,
  ExternalLink,
  KeyRound,
  QrCode,
  RefreshCw,
  ScanLine,
  ShieldCheck,
} from 'lucide-react'
import { api } from '../lib/api'
import { usePlantScope } from '../lib/auth'
import { useAsync } from '../lib/useAsync'
import { useToast } from '../lib/toast'
import type { Plant } from '../lib/types'
import {
  Button,
  Card,
  EmptyState,
  ErrorState,
  Field,
  Input,
  Segmented,
  Skeleton,
} from '../components/ui'

type Tab = 'labels' | 'scan'

interface BarcodeDetectorLike {
  detect: (source: HTMLVideoElement) => Promise<Array<{ rawValue: string }>>
}

const DetectorCtor = (
  window as unknown as {
    BarcodeDetector?: new (options?: { formats?: string[] }) => BarcodeDetectorLike
  }
).BarcodeDetector

export default function QRPage() {
  const [tab, setTab] = useState<Tab>('labels')

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-[26px] font-semibold leading-tight text-ink-900 sm:text-[30px]">
          Labels & scanning
        </h1>
        <p className="mt-1 text-[12.5px] text-ink-500">
          Every plant gets an opaque QR label. Scanning it opens a public page with no personal data.
        </p>
      </div>

      <Segmented
        ariaLabel="Label tools"
        options={[
          { value: 'labels', label: 'My labels' },
          { value: 'scan', label: 'Scan a label' },
        ]}
        value={tab}
        onChange={setTab}
      />

      {tab === 'labels' ? <MyLabels /> : <Scanner />}
    </div>
  )
}

/* ---------------------------------------------------------------- labels */

function MyLabels() {
  const scope = usePlantScope()
  const result = useAsync(() => api.plants({ scope }), [scope])
  const plants = result.data?.plants ?? []

  if (result.loading && !result.data) {
    return (
      <div className="space-y-3">
        {[0, 1, 2].map((key) => (
          <Skeleton key={key} className="h-[92px] rounded-3xl" />
        ))}
      </div>
    )
  }

  if (result.error) return <ErrorState message={result.error} onRetry={result.reload} />

  if (plants.length === 0) {
    return (
      <Card>
        <EmptyState
          icon={<QrCode size={22} />}
          title="No labels yet"
          description="Register a plant and its label is generated automatically."
          action={
            <Link to="/add">
              <Button size="sm" icon={<QrCode size={15} />}>
                Register a plant
              </Button>
            </Link>
          }
        />
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {plants.map((plant) => (
        <LabelRow key={plant.id} plant={plant} />
      ))}
      <p className="flex items-start gap-2 rounded-2xl border border-forest-700/10 bg-sage-50 px-3.5 py-3 text-[11px] leading-relaxed text-forest-800/80">
        <ShieldCheck size={14} className="mt-0.5 shrink-0" aria-hidden />
        Field boundaries never appear on a public QR page — only the plant, its age and its care count.
      </p>
    </div>
  )
}

function LabelRow({ plant }: { plant: Plant }) {
  const [qr, setQr] = useState<string | null>(null)
  const toast = useToast()
  const url = `${window.location.origin}/p/${plant.qrToken}`

  useEffect(() => {
    QRCode.toDataURL(url, {
      margin: 1,
      width: 220,
      errorCorrectionLevel: 'M',
      color: { dark: '#1B2F23', light: '#FDFCF7' },
    })
      .then(setQr)
      .catch(() => setQr(null))
  }, [url])

  return (
    <Card className="flex items-center gap-3.5 p-3.5">
      <div className="grid h-[74px] w-[74px] shrink-0 place-items-center rounded-xl border border-forest-700/10 bg-cream-50 p-1.5">
        {qr ? (
          <img src={qr} alt={`QR label for ${plant.name}`} className="h-full w-full" />
        ) : (
          <Skeleton className="h-full w-full" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-[14px] font-semibold text-ink-900">{plant.name}</p>
        <p className="truncate text-[11px] text-ink-400">
          {plant.localName ?? plant.species} · {plant.careCount ?? 0} care logs
        </p>
        <div className="mt-1.5 flex items-center gap-2">
          <code className="rounded-md bg-cream-200 px-1.5 py-0.5 font-mono text-[10px] text-ink-500">
            {plant.qrToken}
          </code>
          <button
            type="button"
            onClick={() => {
              void navigator.clipboard.writeText(url)
              toast.success('Label link copied')
            }}
            className="text-[10.5px] font-semibold text-forest-700"
          >
            Copy link
          </button>
        </div>
      </div>

      <div className="flex shrink-0 flex-col gap-1.5">
        <Link to={`/p/${plant.qrToken}`} target="_blank">
          <Button size="sm" variant="secondary" icon={<ExternalLink size={13} />}>
            Preview
          </Button>
        </Link>
        {qr ? (
          <a href={qr} download={`haritavanam-${plant.qrToken}.png`}>
            <Button size="sm" variant="ghost" icon={<Download size={13} />} full>
              Download
            </Button>
          </a>
        ) : null}
      </div>
    </Card>
  )
}

/* --------------------------------------------------------------- scanner */

function Scanner() {
  const navigate = useNavigate()
  const toast = useToast()

  const videoRef = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const timerRef = useRef<number | null>(null)

  const [active, setActive] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [manual, setManual] = useState('')

  const supported = Boolean(DetectorCtor)

  function stop() {
    if (timerRef.current) {
      window.clearInterval(timerRef.current)
      timerRef.current = null
    }
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    if (videoRef.current) videoRef.current.srcObject = null
    setActive(false)
  }

  useEffect(() => stop, [])

  async function start() {
    setCameraError(null)
    if (!DetectorCtor) {
      setCameraError(
        'This browser cannot decode QR codes natively. Enter the label code below instead.',
      )
      return
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false,
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      setActive(true)

      const detector = new DetectorCtor({ formats: ['qr_code'] })
      timerRef.current = window.setInterval(async () => {
        if (!videoRef.current || videoRef.current.readyState < 2) return
        try {
          const codes = await detector.detect(videoRef.current)
          if (codes.length > 0) {
            const raw = codes[0].rawValue
            const token = raw.includes('/p/') ? raw.split('/p/').pop()!.split(/[?#]/)[0] : raw
            stop()
            navigate(`/p/${token}`)
          }
        } catch {
          /* keep scanning */
        }
      }, 450)
    } catch {
      setCameraError('Camera permission was not granted. You can still enter the code manually.')
      stop()
    }
  }

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden">
        <div className="relative aspect-[4/3] w-full bg-forest-950">
          <video
            ref={videoRef}
            muted
            playsInline
            className={`h-full w-full object-cover ${active ? 'opacity-100' : 'opacity-0'}`}
          />

          {!active ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[radial-gradient(120%_100%_at_50%_0%,#27412F_0%,#122019_70%)] px-6 text-center">
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-cream-50/10 text-sage-200">
                {supported ? <Camera size={24} /> : <CameraOff size={24} />}
              </span>
              <p className="text-[13px] font-semibold text-cream-50">
                {supported ? 'Point at a Haritavanam label' : 'Camera scanning unavailable'}
              </p>
              <p className="max-w-[36ch] text-[11px] leading-relaxed text-cream-100/60">
                {supported
                  ? 'The camera stays on this device. Nothing is uploaded while scanning.'
                  : 'Use a Chromium browser, or type the short code printed under the QR.'}
              </p>
              {supported ? (
                <Button size="sm" variant="secondary" className="mt-1 border-0" onClick={() => void start()}>
                  Start camera
                </Button>
              ) : null}
            </div>
          ) : (
            <>
              <div className="pointer-events-none absolute inset-0 grid place-items-center">
                <div className="relative h-52 w-52 rounded-2xl border-2 border-cream-50/80">
                  <span className="absolute -left-1 -top-1 h-6 w-6 rounded-tl-2xl border-l-4 border-t-4 border-sage-200" />
                  <span className="absolute -right-1 -top-1 h-6 w-6 rounded-tr-2xl border-r-4 border-t-4 border-sage-200" />
                  <span className="absolute -bottom-1 -left-1 h-6 w-6 rounded-bl-2xl border-b-4 border-l-4 border-sage-200" />
                  <span className="absolute -bottom-1 -right-1 h-6 w-6 rounded-br-2xl border-b-4 border-r-4 border-sage-200" />
                  <span className="absolute inset-x-6 top-1/2 h-px animate-soft-pulse bg-sage-200" />
                </div>
              </div>
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-gradient-to-t from-forest-950/80 to-transparent px-3 pb-3 pt-8">
                <p className="flex items-center gap-1.5 text-[11px] text-cream-100/80">
                  <ScanLine size={13} /> Scanning…
                </p>
                <Button size="sm" variant="secondary" className="border-0" onClick={stop}>
                  Stop
                </Button>
              </div>
            </>
          )}
        </div>
      </Card>

      {cameraError ? (
        <p className="rounded-2xl border border-amber-600/20 bg-amber-100 px-3.5 py-2.5 text-[12px] text-amber-600">
          {cameraError}
        </p>
      ) : null}

      <Card className="p-4">
        <Field
          label="Label code"
          hint="The short code printed beneath the QR, or the last part of the label link."
        >
          <div className="flex gap-2">
            <div className="relative flex-1">
              <KeyRound
                size={15}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400"
                aria-hidden
              />
              <Input
                value={manual}
                onChange={(event) => setManual(event.target.value.trim())}
                placeholder="e.g. 7k3m9q2xzp"
                className="pl-10 font-mono text-[13px]"
              />
            </div>
            <Button
              onClick={() => {
                if (!manual) {
                  toast.info('Enter a label code first')
                  return
                }
                navigate(`/p/${manual}`)
              }}
            >
              Open
            </Button>
          </div>
        </Field>

        <div className="mt-3 flex items-center gap-2 text-[10.5px] text-ink-400">
          <RefreshCw size={11} aria-hidden />
          Tip: open a label from the “My labels” tab to see what a scan resolves to.
        </div>
      </Card>
    </div>
  )
}

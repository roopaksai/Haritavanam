import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

export function LogoMark({
  size = 40,
  className = '',
  flat = false,
}: {
  size?: number
  className?: string
  flat?: boolean
}) {
  return (
    <img
      src="/brand/icon-light.jpeg"
      alt=""
      width={size}
      height={size}
      draggable={false}
      className={`shrink-0 rounded-[26%] object-cover ${
        flat ? '' : 'shadow-soft ring-1 ring-forest-950/10'
      } ${className}`}
    />
  )
}

export function Wordmark({
  size = 'md',
  withTagline = false,
  to = '/dashboard',
  className = '',
}: {
  size?: 'sm' | 'md' | 'lg'
  withTagline?: boolean
  to?: string
  className?: string
}) {
  const dims = { sm: 26, md: 32, lg: 40 }[size]
  const text = { sm: 'text-[16px]', md: 'text-[18px]', lg: 'text-[22px]' }[size]

  return (
    <Link to={to} className={`inline-flex items-center gap-2.5 ${className}`} aria-label="Haritavanam home">
      <LogoMark size={dims} />
      <span className="leading-none">
        <span className={`font-display font-semibold tracking-tight text-ink-900 ${text}`}>
          Haritavanam
        </span>
        {withTagline ? (
          <span className="label-caps mt-1.5 block text-forest-700/70">Plant · Track · Preserve</span>
        ) : null}
      </span>
    </Link>
  )
}

const SPLASH_KEY = 'hv:splash-shown'

export function SplashScreen() {
  const [visible, setVisible] = useState(() => {
    try {
      return !sessionStorage.getItem(SPLASH_KEY)
    } catch {
      return true
    }
  })
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    if (!visible) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const hold = reduce ? 400 : 1500
    const fade = window.setTimeout(() => setLeaving(true), hold)
    const done = window.setTimeout(() => {
      setVisible(false)
      try {
        sessionStorage.setItem(SPLASH_KEY, '1')
      } catch {
        /* private mode */
      }
    }, hold + 480)
    return () => {
      window.clearTimeout(fade)
      window.clearTimeout(done)
    }
  }, [visible])

  if (!visible) return null

  return (
    <div
      className={`fixed inset-0 z-[200] flex justify-center overflow-hidden bg-cream-100 transition-opacity duration-500 ${
        leaving ? 'pointer-events-none opacity-0' : 'opacity-100'
      }`}
      aria-hidden={leaving}
    >
      <div className="relative h-full w-full max-w-[90%] sm:max-w-[470px] overflow-hidden">
        <img
          src="/brand/splash.jpg"
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-top"
        />
        <div className="absolute inset-x-0 top-0 h-[46%] bg-gradient-to-b from-cream-100 via-cream-100/85 to-transparent" />

        <div className="absolute inset-x-0 top-[15%] flex flex-col items-center px-8">
          <LogoMark size={90} flat className="ring-1 ring-forest-950/10" />
          <h1 className="display-tight mt-5 text-[38px] text-forest-900">Haritavanam</h1>
          <p className="mt-2.5 text-[10.5px] font-semibold uppercase tracking-[0.22em] text-forest-800/65">
            Plant · Track · Preserve
          </p>
        </div>

        <div className="absolute inset-x-0 bottom-12 px-12">
          <div className="h-[3px] w-full overflow-hidden rounded-full bg-forest-900/10">
            <div className="splash-bar h-full rounded-full bg-forest-700" />
          </div>
          <p className="mt-3.5 text-center text-[10px] uppercase tracking-[0.2em] text-forest-800/50">
            Preparing your grove
          </p>
        </div>
      </div>
    </div>
  )
}

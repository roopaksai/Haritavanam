import { Link } from 'react-router-dom'
import { ArrowRight, MapPin, QrCode, Sprout } from 'lucide-react'
import { LogoMark } from '../components/brand'
import { InstallPrompt } from '../components/InstallPrompt'

const features = [
  { icon: QrCode, label: 'QR labels' },
  { icon: Sprout, label: 'Care logs' },
  { icon: MapPin, label: 'Field maps' },
]

export default function Welcome() {
  return (
    <main className="relative min-h-[100svh] overflow-hidden bg-cream-200">
      <img
        src="/brand/splash.jpg"
        alt=""
        className="absolute inset-0 h-full w-full object-cover object-top lg:hidden"
      />
      <img
        src="/brand/hero.jpg"
        alt=""
        className="absolute inset-0 hidden h-full w-full object-cover lg:block"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-cream-100/60 via-cream-100/10 to-forest-950/95 lg:from-forest-950/20 lg:via-forest-950/10 lg:to-forest-950/80" />
      <div className="absolute inset-0 hidden bg-gradient-to-r from-forest-950/80 via-forest-950/35 to-transparent lg:block" />

      <div className="relative z-10 mx-auto flex h-full w-full flex-col px-4 pb-safe pt-5 sm:px-6 lg:px-8 lg:pt-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LogoMark size={28} />
            <span className="font-display text-[15px] font-semibold tracking-tight text-ink-900 lg:text-cream-50 lg:text-[17px]">
              Haritavanam
            </span>
          </div>
          <Link
            to="/about"
            className="rounded-full border border-forest-900/10 bg-cream-50/70 px-2.5 py-0.5 text-[10px] font-semibold text-forest-800 backdrop-blur transition hover:bg-cream-50 lg:border-cream-50/25 lg:bg-cream-50/10 lg:text-cream-50 lg:px-3 lg:py-1 lg:text-[11px]"
          >
            About
          </Link>
        </div>

        <div className="flex-1 flex flex-col justify-between max-w-xl">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-forest-800/80 lg:text-sage-200">
              Plant · Track · Preserve
            </p>
            <h1 className="mt-2.5 display-tight text-[36px] text-forest-950 sm:text-[44px] lg:text-cream-50 lg:text-[60px] leading-[1.15]">
              A Greener
              <br />
              Tomorrow
            </h1>
            <p className="mt-3.5 max-w-[40ch] text-[13px] leading-relaxed text-forest-950/80 sm:text-[14px] lg:text-cream-100/90">
              Give every tree a record it can keep for a hundred years — where it stands, who cares
              for it, and what it needs next.
            </p>

            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center">
              <Link
                to="/signin"
                className="inline-flex h-10 items-center justify-center gap-1.5 rounded-2xl bg-forest-700 px-4 text-[13px] font-semibold text-cream-50 shadow-lift transition hover:bg-forest-800 active:scale-[0.99] lg:bg-cream-50 lg:text-forest-900 lg:hover:bg-cream-100 lg:h-11 lg:px-5 lg:text-[14px]"
              >
                Sign in to your grove
                <ArrowRight size={15} aria-hidden />
              </Link>
              <Link
                to="/signin?demo=1"
                className="inline-flex h-10 items-center justify-center rounded-2xl border border-forest-900/15 bg-cream-50/60 px-3.5 text-[12.5px] font-semibold text-forest-900 backdrop-blur transition hover:bg-cream-50 lg:border-cream-50/30 lg:bg-cream-50/10 lg:text-cream-50 lg:hover:bg-cream-50/20 lg:h-11 lg:px-4.5 lg:text-[13px]"
              >
                Try a demo account
              </Link>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1.5">
              {features.map((feature) => (
                <span
                  key={feature.label}
                  className="flex items-center gap-0.75 text-[10px] font-medium text-forest-800/80 lg:text-cream-100/75 lg:text-[10.5px]"
                >
                  <feature.icon size={11} aria-hidden />
                  {feature.label}
                </span>
              ))}
            </div>
          </div>

          <p className="mt-auto text-[9px] leading-relaxed text-forest-900/45 lg:text-cream-100/50 lg:mt-6">
            Demonstration grove at GITAM University, Bengaluru · Data stays on your machine.
          </p>
        </div>

        <InstallPrompt autoShow />
      </div>
    </main>
  )
}

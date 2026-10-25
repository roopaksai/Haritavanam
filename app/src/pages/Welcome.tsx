import { Link } from 'react-router-dom'
import { ArrowRight, MapPin, QrCode, Sprout } from 'lucide-react'
import { LogoMark } from '../components/brand'

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
      <div className="absolute inset-0 bg-gradient-to-b from-cream-100/70 via-cream-100/5 to-forest-950/80 lg:from-forest-950/25 lg:via-forest-950/15 lg:to-forest-950/80" />
      <div className="absolute inset-0 hidden bg-gradient-to-r from-forest-950/75 via-forest-950/30 to-transparent lg:block" />

      <div className="relative z-10 mx-auto flex min-h-[100svh] w-full max-w-6xl flex-col px-5 pb-8 pt-12 sm:px-8 lg:pb-14">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <LogoMark size={34} />
            <span className="font-display text-[17px] font-semibold tracking-tight text-ink-900 lg:text-cream-50">
              Haritavanam
            </span>
          </div>
          <Link
            to="/about"
            className="rounded-full border border-forest-900/10 bg-cream-50/70 px-3.5 py-1.5 text-[11.5px] font-semibold text-forest-800 backdrop-blur transition hover:bg-cream-50 lg:border-cream-50/25 lg:bg-cream-50/10 lg:text-cream-50"
          >
            About
          </Link>
        </div>

        <div className="mt-auto max-w-xl pt-24">
          <p className="text-[10.5px] font-semibold uppercase tracking-[0.22em] text-forest-800/80 lg:text-sage-200">
            Plant · Track · Preserve
          </p>
          <h1 className="display-tight mt-3 text-[46px] text-forest-950 sm:text-[58px] lg:text-cream-50 lg:text-[68px]">
            A Greener
            <br />
            Tomorrow
          </h1>
          <p className="mt-4 max-w-[42ch] text-[14.5px] leading-relaxed text-forest-950/80 sm:text-[15.5px] lg:text-cream-100/90">
            Give every tree a record it can keep for a hundred years — where it stands, who cares for
            it, and what it needs next.
          </p>

          <div className="mt-7 flex flex-col gap-2.5 sm:flex-row">
            <Link
              to="/signin"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-forest-700 px-6 text-[15px] font-semibold text-cream-50 shadow-lift transition hover:bg-forest-800 active:scale-[0.99] lg:bg-cream-50 lg:text-forest-900 lg:hover:bg-cream-100"
            >
              Sign in to your grove
              <ArrowRight size={17} aria-hidden />
            </Link>
            <Link
              to="/signin?demo=1"
              className="inline-flex h-12 items-center justify-center rounded-2xl border border-forest-900/15 bg-cream-50/60 px-5 text-[14px] font-semibold text-forest-900 backdrop-blur transition hover:bg-cream-50 lg:border-cream-50/30 lg:bg-cream-50/10 lg:text-cream-50 lg:hover:bg-cream-50/20"
            >
              Try a demo account
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2.5">
            {features.map((feature) => (
              <span
                key={feature.label}
                className="flex items-center gap-1.5 text-[11.5px] font-medium text-forest-800/80 lg:text-cream-100/75"
              >
                <feature.icon size={13} aria-hidden />
                {feature.label}
              </span>
            ))}
          </div>

          <p className="mt-8 text-[10.5px] leading-relaxed text-forest-900/50 lg:text-cream-100/50">
            Demonstration grove at GITAM University, Bengaluru · Data stays on your machine.
          </p>
        </div>
      </div>
    </main>
  )
}

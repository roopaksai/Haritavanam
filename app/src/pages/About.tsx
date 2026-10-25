import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Droplets, MapPin, QrCode, ShieldCheck, Sprout, Users } from 'lucide-react'
import { LogoMark } from '../components/brand'

const pillars = [
  {
    icon: QrCode,
    title: 'A label that outlives a spreadsheet',
    body: 'Every tree carries an opaque QR label. Scanning opens a clean public page — name, age, care count — with no personal data and no field boundaries.',
  },
  {
    icon: Users,
    title: 'Two people, never a crowd',
    body: 'One owner, at most one monitor. Owners nominate, administrators approve, and the server refuses a second monitor even if the interface is bypassed.',
  },
  {
    icon: Droplets,
    title: 'Care you can actually audit',
    body: 'Watering, feeding, pruning and inspections are timestamped events with a named actor. Planned and completed work never blur together.',
  },
  {
    icon: MapPin,
    title: 'Placed, not guessed',
    body: 'Plants are points; fields are a single polygon on OpenStreetMap. The map is a record of reality, not a decoration.',
  },
]

export default function About() {
  return (
    <div className="min-h-[100svh] bg-cream-200">
      <div className="relative h-[300px] overflow-hidden sm:h-[360px]">
        <img src="/brand/hero.jpg" alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-forest-950/85 via-forest-950/30 to-forest-950/40" />
        <div className="absolute inset-x-0 top-0 mx-auto flex max-w-4xl items-center justify-between px-5 py-4">
          <Link
            to="/welcome"
            className="inline-flex items-center gap-1.5 rounded-full bg-cream-50/90 px-3 py-2 text-[11.5px] font-semibold text-forest-900 backdrop-blur"
          >
            <ArrowLeft size={13} /> Back
          </Link>
          <span className="flex items-center gap-2 text-cream-50">
            <LogoMark size={28} flat />
            <span className="font-display text-[15px] font-semibold">Haritavanam</span>
          </span>
        </div>
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-4xl px-5 pb-7">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-sage-200">
            Plant · Track · Preserve
          </p>
          <h1 className="display-tight mt-2 max-w-2xl text-[34px] text-cream-50 sm:text-[46px]">
            A record for every tree, kept by the people who tend it.
          </h1>
        </div>
      </div>

      <div className="mx-auto max-w-4xl space-y-10 px-5 py-10 pb-safe pb-[70px]">
        <section className="max-w-2xl">
          <p className="text-[15px] leading-relaxed text-ink-700">
            Most planting drives end with a photograph and a promise. Two monsoons later nobody
            remembers which sapling was which, who watered it, or whether it survived.
            <span className="font-semibold text-forest-800"> Haritavanam exists to close that gap.</span>
          </p>
          <p className="mt-3 text-[14px] leading-relaxed text-ink-500">
            It began as a campus greening project at GITAM University, Bengaluru — twelve trees, two
            plots, and a shared notebook that kept getting lost. This build turns that notebook into
            something durable: a record anyone can scan, a care history nobody can quietly edit, and a
            map that stays honest.
          </p>
        </section>

        <section>
          <h2 className="text-[22px] font-semibold text-ink-900">Four things we refuse to compromise</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {pillars.map((pillar) => (
              <div
                key={pillar.title}
                className="rounded-3xl border border-forest-700/10 bg-cream-50 p-4 shadow-soft"
              >
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-sage-100 text-forest-700">
                  <pillar.icon size={16} />
                </span>
                <h3 className="mt-3 text-[15px] font-semibold leading-snug text-ink-900">
                  {pillar.title}
                </h3>
                <p className="mt-1.5 text-[12px] leading-relaxed text-ink-500">{pillar.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-forest-700/12 bg-sage-50 p-5">
          <div className="flex items-start gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-cream-50 text-forest-700">
              <ShieldCheck size={17} />
            </span>
            <div>
              <h2 className="text-[16px] font-semibold text-ink-900">Privacy is a feature</h2>
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-600">
                A public QR scan reveals a plant&apos;s name, species, age, location at city level and
                care count. It never reveals coordinates, owner contact details, monitoring requests or
                field polygons. Field records are invisible to anyone who is not signed in.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-[22px] font-semibold text-ink-900">How it works</h2>
          <ol className="mt-4 space-y-3">
            {[
              'Register the plant with a name, species and a pin on the map.',
              'A QR label is generated — print it and tie it to the trunk.',
              'Care gets logged by the owner or the approved monitor.',
              'An administrator reviews monitoring requests and support tickets.',
              'Anyone can scan the label to read the plant’s public story.',
            ].map((step, index) => (
              <li key={step} className="flex gap-3">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-forest-700 text-[11px] font-bold text-cream-50">
                  {index + 1}
                </span>
                <p className="pt-1 text-[13px] leading-relaxed text-ink-700">{step}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="rounded-3xl border border-forest-700/10 bg-cream-50 p-5 shadow-soft">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-[18px] font-semibold text-ink-900">Walk the demo grove</h2>
              <p className="mt-1 text-[12px] text-ink-500">
                Twelve plants, two fields, three roles and a live map at GITAM University.
              </p>
            </div>
            <Link
              to="/signin?demo=1"
              className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-2xl bg-forest-700 px-5 text-sm font-semibold text-cream-50 transition hover:bg-forest-800"
            >
              Try a demo account <ArrowRight size={15} aria-hidden />
            </Link>
          </div>
        </section>

        <footer className="border-t border-cream-400 pt-5 text-[10.5px] leading-relaxed text-ink-400">
          <p className="flex items-center gap-1.5">
            <Sprout size={12} aria-hidden /> Built as a capstone project. Local-first: your data stays on
            your machine.
          </p>
          <p className="mt-1.5">
            Map data © OpenStreetMap contributors, available under the Open Database Licence. Leaflet is
            used for map rendering.
          </p>
        </footer>
      </div>
    </div>
  )
}

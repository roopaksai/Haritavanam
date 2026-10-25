import { Link } from 'react-router-dom'
import { ArrowLeft, Sprout } from 'lucide-react'
import { useAuth } from '../lib/auth'
import { LogoMark } from '../components/brand'

export default function NotFound() {
  const { user } = useAuth()

  return (
    <main className="flex min-h-[100svh] flex-col items-center justify-center bg-cream-200 px-6 text-center">
      <LogoMark size={64} />
      <p className="mt-6 font-display text-[64px] font-semibold leading-none text-forest-800/20">404</p>
      <h1 className="mt-2 text-[26px] font-semibold text-ink-900">This path hasn’t been planted</h1>
      <p className="mt-2 max-w-sm text-[13px] leading-relaxed text-ink-500">
        The page you were looking for is not here. The grove is still where you left it.
      </p>
      <div className="mt-6 flex gap-2">
        <Link
          to={user ? '/dashboard' : '/welcome'}
          className="inline-flex h-11 items-center gap-2 rounded-2xl bg-forest-700 px-5 text-[13.5px] font-semibold text-cream-50"
        >
          <ArrowLeft size={15} /> {user ? 'Back to overview' : 'Back to welcome'}
        </Link>
        <Link
          to="/about"
          className="inline-flex h-11 items-center gap-2 rounded-2xl border border-forest-700/15 bg-cream-50 px-4 text-[13.5px] font-semibold text-forest-800"
        >
          <Sprout size={15} /> About
        </Link>
      </div>
    </main>
  )
}

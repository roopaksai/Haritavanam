import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import {
  Bell,
  Home,
  LayoutGrid,
  LifeBuoy,
  LogOut,
  Map,
  Plus,
  QrCode,
  Settings,
  ShieldCheck,
  Trees,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useAuth } from '../lib/auth'
import { todayLong } from '../lib/format'
import { Avatar, Button, IconButton } from './ui'
import { Wordmark } from './brand'

interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  end?: boolean
}

const primaryNav: NavItem[] = [
  { to: '/dashboard', label: 'Overview', icon: Home, end: true },
  { to: '/plants', label: 'Plants', icon: Trees },
  { to: '/map', label: 'Field map', icon: Map },
  { to: '/qr', label: 'Labels', icon: QrCode },
  { to: '/tickets', label: 'Support', icon: LifeBuoy },
]

const mobileNav: NavItem[] = [
  { to: '/dashboard', label: 'Home', icon: Home, end: true },
  { to: '/map', label: 'Map', icon: Map },
  { to: '/add', label: 'Add', icon: Plus },
  { to: '/plants', label: 'Plants', icon: Trees },
  { to: '/settings', label: 'More', icon: LayoutGrid },
]

const titles: Record<string, string> = {
  '/dashboard': 'Overview',
  '/plants': 'Plants',
  '/map': 'Field map',
  '/add': 'Register a plant',
  '/qr': 'Labels',
  '/tickets': 'Support',
  '/admin': 'Administration',
  '/settings': 'Settings',
}

export default function AppShell() {
  const { user, signOut, offline } = useAuth()
  const location = useLocation()
  const title = titles[location.pathname] ?? 'Haritavanam'
  const isAdmin = user?.role === 'admin'

  return (
    <div className="min-h-full bg-cream-200">
      {/* -------------------------------------------------- desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[264px] flex-col border-r border-forest-700/10 bg-cream-100/70 px-4 pb-5 pt-6 lg:flex">
        <Wordmark withTagline size="md" className="px-2" />

        <nav className="mt-9 flex flex-1 flex-col gap-1" aria-label="Main">
          {primaryNav.map((item) => (
            <SideLink key={item.to} item={item} />
          ))}
          {isAdmin ? <SideLink item={{ to: '/admin', label: 'Administration', icon: ShieldCheck }} /> : null}
          <SideLink item={{ to: '/settings', label: 'Settings', icon: Settings }} />
        </nav>

        <div className="rounded-2xl border border-forest-700/10 bg-cream-50 p-3">
          <div className="flex items-center gap-2.5">
            <Avatar name={user?.name} color={user?.avatarColor} size={36} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-semibold leading-tight text-ink-900">
                {user?.name}
              </p>
              <p className="mt-0.5 text-[10.5px] uppercase tracking-wider text-ink-400">
                {user?.role}
              </p>
            </div>
            <IconButton label="Sign out" onClick={() => void signOut()} className="-mr-1 h-8 w-8">
              <LogOut size={15} />
            </IconButton>
          </div>
        </div>
      </aside>

      {/* ------------------------------------------------------ mobile header */}
      <header className="safe-top sticky top-0 z-40 border-b border-forest-700/8 bg-cream-200/85 backdrop-blur-md lg:hidden">
        <div className="flex h-14 items-center gap-2 px-4">
          <Wordmark size="sm" />
          <div className="ml-auto flex items-center gap-0.5">
            <Link to="/tickets" aria-label="Support tickets">
              <IconButton label="Support tickets" className="relative">
                <Bell size={19} />
                <span className="absolute right-2.5 top-2.5 h-1.5 w-1.5 rounded-full bg-clay-500" />
              </IconButton>
            </Link>
            <Link to="/settings" aria-label="Your profile">
              <Avatar name={user?.name} color={user?.avatarColor} size={32} />
            </Link>
          </div>
        </div>
      </header>

      {/* -------------------------------------------------------- desktop bar */}
      <div className="lg:pl-[264px]">
        <div className="sticky top-0 z-30 hidden border-b border-forest-700/8 bg-cream-200/85 backdrop-blur-md lg:block">
          <div className="mx-auto flex h-[68px] w-full max-w-6xl items-center gap-4 px-8">
            <div className="min-w-0">
              <h1 className="truncate text-[23px] font-semibold leading-none text-ink-900">{title}</h1>
              <p className="mt-1 text-[11.5px] text-ink-400">{todayLong()}</p>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Link to="/tickets">
                <Button variant="secondary" size="sm" icon={<LifeBuoy size={15} />}>
                  Support
                </Button>
              </Link>
              <Link to="/add">
                <Button size="sm" icon={<Plus size={16} />}>
                  Register plant
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {offline ? (
          <div className="mx-auto w-full max-w-6xl px-4 pt-3 lg:px-8">
            <p className="rounded-2xl border border-amber-600/25 bg-amber-100 px-3.5 py-2.5 text-[12.5px] font-medium text-amber-600">
              The API is not reachable. Run <code className="font-mono">npm run dev</code> in the
              project root to load live data.
            </p>
          </div>
        ) : null}

        <main className="mx-auto w-full max-w-6xl px-4 pb-28 pt-4 sm:px-5 lg:px-8 lg:pb-14 lg:pt-6">
          <Outlet />
        </main>
      </div>

      {/* --------------------------------------------------- mobile tab bar */}
      <nav
        className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-forest-700/10 bg-cream-50/95 shadow-nav backdrop-blur-lg lg:hidden"
        aria-label="Main"
      >
        <div className="mx-auto grid max-w-md grid-cols-5 items-center px-2 pb-1.5 pt-2">
          {mobileNav.map((item) => {
            if (item.to === '/add') {
              return (
                <NavLink key={item.to} to={item.to} className="relative flex flex-col items-center">
                  <span className="-mt-6 grid h-[52px] w-[52px] place-items-center rounded-full bg-forest-700 text-cream-50 shadow-lift ring-[5px] ring-cream-200 transition active:scale-95">
                    <Plus size={24} strokeWidth={2.4} />
                  </span>
                  <span className="mt-1 text-[10px] font-semibold text-forest-800">Add</span>
                </NavLink>
              )
            }
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex flex-col items-center gap-1 rounded-xl py-1.5 transition ${
                    isActive ? 'text-forest-800' : 'text-ink-400'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <item.icon size={21} strokeWidth={isActive ? 2.4 : 1.9} aria-hidden />
                    <span className={`text-[10px] ${isActive ? 'font-semibold' : 'font-medium'}`}>
                      {item.label}
                    </span>
                  </>
                )}
              </NavLink>
            )
          })}
        </div>
      </nav>
    </div>
  )
}

function SideLink({ item }: { item: NavItem }) {
  return (
    <NavLink
      to={item.to}
      end={item.end}
      className={({ isActive }) =>
        `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13.5px] font-medium transition ${
          isActive
            ? 'bg-sage-100 text-forest-900 shadow-[inset_0_0_0_1px_rgba(58,90,64,0.08)]'
            : 'text-ink-700 hover:bg-forest-700/6'
        }`
      }
    >
      {({ isActive }) => (
        <>
          <item.icon
            size={18}
            strokeWidth={isActive ? 2.3 : 1.9}
            className={isActive ? 'text-forest-700' : 'text-ink-400 group-hover:text-forest-700'}
            aria-hidden
          />
          {item.label}
        </>
      )}
    </NavLink>
  )
}

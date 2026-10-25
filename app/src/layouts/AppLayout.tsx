import { Outlet, NavLink, useNavigate } from 'react-router-dom'

const navItems = [
  { to: '/dashboard', label: 'Home', icon: '⌂' },
  { to: '/dashboard', label: 'Map', icon: '⌖' },
  { to: '/add', label: 'Add', icon: '+' },
  { to: '/qr', label: 'QR', icon: '  ' },
  { to: '/settings', label: 'More', icon: '☰' },
]

export default function AppLayout() {
  const navigate = useNavigate()
  return (
    <div className="flex flex-col h-full bg-background">
      <header className="bg-primary text-white px-4 py-3 flex items-center justify-between">
        <span className="font-semibold text-base">Haritavanam</span>
        <button onClick={() => navigate('/settings')} className="text-white text-lg" aria-label="Menu">☰</button>
      </header>
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
      <nav className="bg-surface border-t border-border flex justify-around py-2">
        {navItems.map((n) => (
          <NavLink key={n.label} to={n.to} className={({ isActive }) =>
            `flex flex-col items-center text-[11px] ${isActive ? 'text-primary font-semibold' : 'text-muted'}`
          }>
            <span className="text-lg leading-none">{n.icon}</span>
            <span>{n.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
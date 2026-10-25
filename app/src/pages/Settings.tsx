import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Bell,
  ChevronRight,
  Download,
  Fingerprint,
  Info,
  LifeBuoy,
  LogOut,
  MessageSquareHeart,
  QrCode,
  Smartphone,
  UserRound,
} from 'lucide-react'
import { api, ApiError } from '../lib/api'
import { useAuth } from '../lib/auth'
import type { DemoAccount } from '../lib/types'
import { useToast } from '../lib/toast'
import {
  Avatar,
  Badge,
  Button,
  Card,
  Field,
  Input,
  SectionTitle,
  Sheet,
  Skeleton,
} from '../components/ui'

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const NOTIFY_KEY = 'hv:notifications'

export default function Settings() {
  const { user, signOut, updateUser } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()

  const [profileOpen, setProfileOpen] = useState(false)
  const [accounts, setAccounts] = useState<DemoAccount[] | null>(null)
  const [demoPassword, setDemoPassword] = useState('')
  const [notifications, setNotifications] = useState(() => {
    try {
      return localStorage.getItem(NOTIFY_KEY) === '1'
    } catch {
      return false
    }
  })
  const [installEvent, setInstallEvent] = useState<InstallPromptEvent | null>(null)
  const [installed, setInstalled] = useState(false)

  useEffect(() => {
    api
      .demoAccounts()
      .then((data) => {
        setAccounts(data.accounts)
        setDemoPassword(data.password)
      })
      .catch(() => setAccounts([]))
  }, [])

  useEffect(() => {
    const onPrompt = (event: Event) => {
      event.preventDefault()
      setInstallEvent(event as InstallPromptEvent)
    }
    const onInstalled = () => setInstalled(true)
    window.addEventListener('beforeinstallprompt', onPrompt)
    window.addEventListener('appinstalled', onInstalled)
    if (window.matchMedia('(display-mode: standalone)').matches) setInstalled(true)
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  function toggleNotifications() {
    const next = !notifications
    setNotifications(next)
    try {
      localStorage.setItem(NOTIFY_KEY, next ? '1' : '0')
    } catch {
      /* ignore */
    }
    if (next && 'Notification' in window && Notification.permission === 'default') {
      void Notification.requestPermission()
    }
    toast.info(next ? 'Care reminders enabled on this device' : 'Care reminders paused')
  }

  async function install() {
    if (!installEvent) {
      toast.info('Use your browser menu → “Install app” to add Haritavanam to the home screen.')
      return
    }
    await installEvent.prompt()
    const choice = await installEvent.userChoice
    if (choice.outcome === 'accepted') setInstalled(true)
    setInstallEvent(null)
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5 pb-safe pb-[70px]">
      <div>
        <h1 className="text-[26px] font-semibold leading-tight text-ink-900 sm:text-[30px]">Settings</h1>
        <p className="mt-1 text-[12.5px] text-ink-500">Your profile, this device, and the demo data.</p>
      </div>

      {/* profile */}
      <Card className="p-4">
        <div className="flex items-center gap-3.5">
          <Avatar name={user?.name} color={user?.avatarColor} size={54} />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="truncate text-[16px] font-semibold text-ink-900">{user?.name}</p>
              <Badge className="border-forest-700/15 bg-sage-100 text-forest-800">{user?.role}</Badge>
            </div>
            <p className="truncate text-[11.5px] text-ink-400">{user?.email}</p>
            {user?.headline ? (
              <p className="mt-1 truncate text-[11px] italic text-ink-500">{user.headline}</p>
            ) : null}
          </div>
          <Button size="sm" variant="secondary" onClick={() => setProfileOpen(true)}>
            Edit
          </Button>
        </div>

        <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-cream-300 pt-3 text-[11.5px]">
          <div>
            <dt className="text-ink-400">Phone</dt>
            <dd className="mt-0.5 font-semibold text-ink-800">{user?.phone ?? 'Not added'}</dd>
          </div>
          <div>
            <dt className="text-ink-400">Member ID</dt>
            <dd className="mt-0.5 font-mono text-[10.5px] text-ink-600">{user?.id}</dd>
          </div>
        </dl>
      </Card>

      {/* device */}
      <section>
        <SectionTitle title="This device" hint="Haritavanam is a local-first installable app" />
        <Card className="divide-y divide-cream-300">
          <Row
            icon={<Bell size={17} />}
            title="Care reminders"
            description="A daily nudge for plants due in the next 24 hours."
            action={
              <button
                type="button"
                role="switch"
                aria-checked={notifications}
                aria-label="Toggle care reminders"
                onClick={toggleNotifications}
                className={`relative h-6 w-11 shrink-0 rounded-full transition ${
                  notifications ? 'bg-forest-700' : 'bg-cream-400'
                }`}
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-cream-50 shadow transition-all ${
                    notifications ? 'left-[22px]' : 'left-0.5'
                  }`}
                />
              </button>
            }
          />
          <Row
            icon={<Download size={17} />}
            title={installed ? 'Installed' : 'Install on this device'}
            description={
              installed
                ? 'Haritavanam is running as an installed app.'
                : 'Add it to your home screen for a full-screen, offline-ready shell.'
            }
            action={
              installed ? (
                <Badge className="border-forest-700/15 bg-sage-100 text-forest-800">Ready</Badge>
              ) : (
                <Button size="sm" variant="secondary" onClick={() => void install()}>
                  Install
                </Button>
              )
            }
          />
          <Row
            icon={<Smartphone size={17} />}
            title="Offline behaviour"
            description="Cached screens and map tiles stay readable; new care logs need the API."
            action={<Badge className="border-forest-700/10 bg-cream-100 text-ink-500">Local</Badge>}
          />
        </Card>
      </section>

      {/* demo accounts */}
      <section>
        <SectionTitle title="Demo accounts" hint="For switching roles while reviewing the build" />
        <Card className="divide-y divide-cream-300">
          {accounts === null ? (
            <div className="space-y-2 p-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            accounts.map((account) => (
              <div key={account.id} className="flex items-center gap-3 px-4 py-3">
                <Avatar name={account.name} color={account.avatarColor} size={30} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12.5px] font-semibold text-ink-900">{account.name}</p>
                  <p className="truncate text-[10.5px] text-ink-400">{account.email}</p>
                </div>
                <Badge className="border-forest-700/10 bg-cream-100 text-ink-500">{account.role}</Badge>
              </div>
            ))
          )}
          <div className="flex items-center gap-2 px-4 py-3">
            <Fingerprint size={15} className="text-forest-600" aria-hidden />
            <p className="text-[11px] text-ink-500">
              Shared password{' '}
              <code className="rounded bg-cream-200 px-1.5 py-0.5 font-mono text-[10.5px] text-ink-700">
                {demoPassword || 'Haritavanam@123'}
              </code>
            </p>
          </div>
        </Card>
      </section>

      {/* links */}
      <section>
        <SectionTitle title="More" />
        <Card className="divide-y divide-cream-300">
          <LinkRow to="/tickets" icon={<LifeBuoy size={16} />} label="Support tickets" />
          <LinkRow to="/feedback" icon={<MessageSquareHeart size={16} />} label="Send feedback" />
          <LinkRow to="/about" icon={<Info size={16} />} label="About Haritavanam" />
          <LinkRow to="/qr" icon={<QrCode size={16} />} label="QR labels" />
        </Card>
      </section>

      <Button
        variant="secondary"
        full
        icon={<LogOut size={15} />}
        onClick={() => {
          void signOut().then(() => navigate('/welcome'))
        }}
      >
        Sign out
      </Button>

      <p className="pb-4 text-center text-[10px] leading-relaxed text-ink-400">
        Haritavanam v0.1 · local-first build · data never leaves this machine
      </p>

      <ProfileSheet
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        initial={{ name: user?.name ?? '', phone: user?.phone ?? '', headline: user?.headline ?? '' }}
        onSaved={(next) => {
          updateUser(next)
          setProfileOpen(false)
        }}
      />
    </div>
  )
}

function Row({
  icon,
  title,
  description,
  action,
}: {
  icon: React.ReactNode
  title: string
  description: string
  action: React.ReactNode
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-sage-100 text-forest-700">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[12.5px] font-semibold text-ink-900">{title}</p>
        <p className="mt-0.5 text-[10.5px] leading-snug text-ink-400">{description}</p>
      </div>
      {action}
    </div>
  )
}

function LinkRow({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 px-4 py-3.5 transition hover:bg-forest-700/5"
    >
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-cream-100 text-forest-700">
        {icon}
      </span>
      <span className="flex-1 text-[12.5px] font-semibold text-ink-900">{label}</span>
      <ChevronRight size={15} className="text-ink-400" aria-hidden />
    </Link>
  )
}

function ProfileSheet({
  open,
  onClose,
  initial,
  onSaved,
}: {
  open: boolean
  onClose: () => void
  initial: { name: string; phone: string; headline: string }
  onSaved: (user: Awaited<ReturnType<typeof api.updateProfile>>['user']) => void
}) {
  const toast = useToast()
  const [name, setName] = useState(initial.name)
  const [phone, setPhone] = useState(initial.phone)
  const [headline, setHeadline] = useState(initial.headline)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      setName(initial.name)
      setPhone(initial.phone)
      setHeadline(initial.headline)
    }
  }, [open, initial.name, initial.phone, initial.headline])

  async function save() {
    setSaving(true)
    try {
      const data = await api.updateProfile({ name, phone, headline })
      toast.success('Profile updated')
      onSaved(data.user)
    } catch (cause) {
      toast.error(cause instanceof ApiError ? cause.message : 'Could not save your profile')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Edit profile"
      description="Only your name is shown to other members of this grove."
      footer={
        <Button full loading={saving} onClick={() => void save()} icon={<UserRound size={15} />}>
          Save profile
        </Button>
      }
    >
      <div className="space-y-3.5">
        <Field label="Name">
          <Input value={name} onChange={(event) => setName(event.target.value)} />
        </Field>
        <Field label="Phone" hint="Used only for admin coordination in this demo.">
          <Input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+91 …" />
        </Field>
        <Field label="One line about you">
          <Input
            value={headline}
            onChange={(event) => setHeadline(event.target.value)}
            placeholder="Weekend watering volunteer"
          />
        </Field>
      </div>
    </Sheet>
  )
}

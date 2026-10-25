import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, KeyRound, ShieldCheck, Sprout, UserRound } from 'lucide-react'
import { api, ApiError } from '../lib/api'
import { useAuth } from '../lib/auth'
import type { DemoAccount } from '../lib/types'
import { Avatar, Button, ErrorState, Field, Input, Skeleton } from '../components/ui'
import { LogoMark } from '../components/brand'
import { useToast } from '../lib/toast'

const roleCopy: Record<string, string> = {
  admin: 'Approves monitoring requests and triages tickets',
  owner: 'Owns trees and fields, nominates a monitor',
  monitor: 'Logs care for records assigned by an admin',
}

export default function SignIn() {
  const { signIn, user, refresh } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const toast = useToast()

  const [accounts, setAccounts] = useState<DemoAccount[] | null>(null)
  const [password, setPassword] = useState('')
  const [accountsError, setAccountsError] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [secret, setSecret] = useState('')
  const [submitting, setSubmitting] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)

  const from = (location.state as { from?: string } | null)?.from ?? '/dashboard'

  useEffect(() => {
    if (user) navigate(from, { replace: true })
  }, [user, from, navigate])

  useEffect(() => {
    let active = true
    api
      .demoAccounts()
      .then((data) => {
        if (!active) return
        setAccounts(data.accounts)
        setPassword(data.password)
        setEmail(data.accounts[1]?.email ?? data.accounts[0]?.email ?? '')
        setSecret(data.password)
      })
      .catch((cause: unknown) => {
        if (!active) return
        setAccounts([])
        setAccountsError(cause instanceof ApiError ? cause.message : 'Could not load demo accounts')
      })
    return () => {
      active = false
    }
  }, [])

  async function handleDemo(account: DemoAccount) {
    setSubmitting(account.id)
    setFormError(null)
    try {
      await signIn(account.email, password)
      toast.success(`Welcome, ${account.name.split(' ')[0]}`)
      navigate(from, { replace: true })
    } catch (cause) {
      const message = cause instanceof ApiError ? cause.message : 'Could not sign in'
      setFormError(message)
      if (cause instanceof ApiError && cause.isOffline) await refresh()
    } finally {
      setSubmitting(null)
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setSubmitting('form')
    setFormError(null)
    try {
      await signIn(email.trim(), secret)
      navigate(from, { replace: true })
    } catch (cause) {
      setFormError(cause instanceof ApiError ? cause.message : 'Could not sign in')
    } finally {
      setSubmitting(null)
    }
  }

  return (
    <main className="flex min-h-[100svh] bg-cream-200">
      {/* visual panel */}
      <div className="relative hidden w-[46%] shrink-0 overflow-hidden lg:block">
        <img src="/brand/hero.jpg" alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-forest-950/70 via-forest-950/25 to-forest-950/70" />
        <div className="relative flex h-full flex-col justify-between p-10">
          <Link to="/welcome" className="inline-flex items-center gap-2.5">
            <LogoMark size={34} />
            <span className="font-display text-[17px] font-semibold tracking-tight text-cream-50">
              Haritavanam
            </span>
          </Link>

          <div className="max-w-md">
            <p className="text-[10.5px] font-semibold uppercase tracking-[0.22em] text-sage-200">
              Plant · Track · Preserve
            </p>
            <h1 className="display-tight mt-3 text-[46px] text-cream-50">
              The grove remembers
              <br />
              what we forget.
            </h1>
            <p className="mt-4 text-[14px] leading-relaxed text-cream-100/75">
              Twelve trees, two plots and every watering logged. Sign in to see what needs you today.
            </p>
          </div>

          <p className="text-[10.5px] text-cream-100/45">
            GITAM University · Nagadenahalli, Bengaluru North
          </p>
        </div>
      </div>

      {/* form panel */}
      <div className="flex flex-1 flex-col px-5 py-8 sm:px-10">
        <div className="mx-auto flex w-full max-w-[420px] flex-1 flex-col">
          <div className="flex items-center justify-between lg:hidden">
            <Link to="/welcome" className="flex items-center gap-2">
              <LogoMark size={32} />
              <span className="font-display text-[16px] font-semibold text-ink-900">Haritavanam</span>
            </Link>
            <Link
              to="/welcome"
              className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-forest-700"
            >
              <ArrowLeft size={13} /> Back
            </Link>
          </div>

          <div className="mt-10 lg:mt-16">
            <h2 className="text-[30px] font-semibold leading-tight text-ink-900">Welcome back</h2>
            <p className="mt-2 text-[13.5px] leading-relaxed text-ink-500">
              Sign in to register plants, log care and review what the grove needs.
            </p>
          </div>

          {/* demo accounts */}
          <div className="mt-7">
            <div className="flex items-center justify-between">
              <p className="label-caps">Demo accounts · one tap</p>
              <span className="text-[10px] text-ink-400">password prefilled</span>
            </div>

            <div className="mt-2.5 space-y-2">
              {accounts === null ? (
                <>
                  <Skeleton className="h-[66px] w-full rounded-2xl" />
                  <Skeleton className="h-[66px] w-full rounded-2xl" />
                  <Skeleton className="h-[66px] w-full rounded-2xl" />
                </>
              ) : accountsError ? (
                <ErrorState message={accountsError} onRetry={() => void refresh()} />
              ) : (
                accounts.map((account) => (
                  <button
                    key={account.id}
                    type="button"
                    onClick={() => void handleDemo(account)}
                    disabled={submitting !== null}
                    className="group flex w-full items-center gap-3 rounded-2xl border border-forest-700/12 bg-cream-50 p-3 text-left shadow-soft transition hover:border-forest-700/25 hover:bg-cream-100 disabled:opacity-60"
                  >
                    <Avatar name={account.name} color={account.avatarColor} size={38} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-[13.5px] font-semibold leading-tight text-ink-900">
                          {account.name}
                        </p>
                        <span className="rounded-full bg-sage-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-forest-800">
                          {account.role}
                        </span>
                      </div>
                      <p className="mt-1 truncate text-[11px] text-ink-400">
                        {roleCopy[account.role] ?? account.email}
                      </p>
                    </div>
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-forest-700/8 text-forest-700 transition group-hover:bg-forest-700 group-hover:text-cream-50">
                      {submitting === account.id ? (
                        <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      ) : (
                        <ArrowRight size={14} />
                      )}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="my-6 flex items-center gap-3">
            <span className="h-px flex-1 bg-cream-400" />
            <span className="text-[10px] uppercase tracking-[0.16em] text-ink-400">or use email</span>
            <span className="h-px flex-1 bg-cream-400" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <Field label="Email" htmlFor="email">
              <div className="relative">
                <UserRound
                  size={15}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400"
                  aria-hidden
                />
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@haritavanam.test"
                  className="pl-10"
                />
              </div>
            </Field>

            <Field label="Password" htmlFor="password">
              <div className="relative">
                <KeyRound
                  size={15}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400"
                  aria-hidden
                />
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={secret}
                  onChange={(event) => setSecret(event.target.value)}
                  placeholder="••••••••••"
                  className="pl-10"
                />
              </div>
            </Field>

            {formError ? <ErrorState message={formError} /> : null}

            <Button type="submit" full size="lg" loading={submitting === 'form'}>
              Sign in
            </Button>
          </form>

          <div className="mt-6 rounded-2xl border border-forest-700/10 bg-sage-50 p-3.5">
            <p className="flex items-start gap-2 text-[11.5px] leading-relaxed text-forest-800/80">
              <ShieldCheck size={14} className="mt-0.5 shrink-0" aria-hidden />
              <span>
                Local demo build. Accounts and password are seeded in{' '}
                <code className="rounded bg-cream-50 px-1 py-0.5 font-mono text-[10.5px]">
                  server/src/db/seed.js
                </code>
                . No data leaves this machine.
              </span>
            </p>
          </div>

          <div className="mt-auto flex items-center justify-between pt-8">
            <Link
              to="/about"
              className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-forest-700"
            >
              <Sprout size={14} aria-hidden /> Why Haritavanam
            </Link>
            <span className="text-[10.5px] text-ink-400">v0.1 · local</span>
          </div>
        </div>
      </div>
    </main>
  )
}

import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  BadgeCheck,
  Check,
  ChevronRight,
  Clock,
  Inbox,
  Leaf,
  LifeBuoy,
  ShieldCheck,
  Trees,
  UserRound,
  Users,
  X,
} from 'lucide-react'
import { api, ApiError } from '../lib/api'
import { formatDate, priorityTheme, relativeTime, ticketTheme } from '../lib/format'
import type { MonitoringRequest, Ticket } from '../lib/types'
import { useAsync } from '../lib/useAsync'
import { useToast } from '../lib/toast'
import {
  Avatar,
  Badge,
  Button,
  Card,
  EmptyState,
  ErrorState,
  Field,
  SectionTitle,
  Sheet,
  Skeleton,
  StatTile,
  Textarea,
} from '../components/ui'

export default function Admin() {
  const toast = useToast()
  const result = useAsync(async () => {
    const [stats, requests, tickets, people] = await Promise.all([
      api.stats(),
      api.monitoringRequests(),
      api.tickets(),
      api.people(),
    ])
    return {
      stats: stats.stats,
      requests: requests.requests,
      tickets: tickets.tickets,
      people: people.people,
    }
  }, [])

  const [decision, setDecision] = useState<{
    request: MonitoringRequest
    status: 'approved' | 'rejected'
  } | null>(null)

  if (result.loading && !result.data) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-[92px] rounded-3xl" />
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[0, 1, 2, 3].map((key) => (
            <Skeleton key={key} className="h-[92px] rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-[240px] rounded-3xl" />
      </div>
    )
  }

  if (result.error) return <ErrorState message={result.error} onRetry={result.reload} />

  const stats = result.data!.stats
  const requests = result.data!.requests
  const tickets = result.data!.tickets
  const people = result.data!.people

  const pending = requests.filter((request) => request.status === 'pending')
  const decided = requests.filter((request) => request.status !== 'pending').slice(0, 5)
  const openTickets = tickets.filter((ticket) => ticket.status !== 'resolved')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[26px] font-semibold leading-tight text-ink-900 sm:text-[30px]">
          Administration
        </h1>
        <p className="mt-1 text-[12.5px] text-ink-500">
          Approvals, the two-person rule, and the support queue.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-4">
        <StatTile label="Plants" value={stats.plants} hint={`${stats.critical} critical`} icon={<Trees size={15} />} tone={stats.critical ? 'clay' : 'default'} />
        <StatTile label="Fields" value={stats.fields} hint="Mapped polygons" icon={<Leaf size={15} />} />
        <StatTile label="Pending approvals" value={pending.length} hint="Monitoring requests" icon={<Clock size={15} />} tone={pending.length ? 'amber' : 'default'} />
        <StatTile label="Open tickets" value={openTickets.length} hint="Awaiting reply" icon={<LifeBuoy size={15} />} />
      </div>

      <Card className="p-4">
        <div className="flex items-start gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-sage-100 text-forest-700">
            <ShieldCheck size={17} />
          </span>
          <div>
            <h2 className="text-[15px] font-semibold text-ink-900">Two-person rule</h2>
            <p className="mt-1 text-[11.5px] leading-relaxed text-ink-500">
              A record has one owner and at most one monitor. Owners nominate a candidate; only an
              administrator can approve. Approving a second monitor for the same record is refused by
              the server, not just hidden in the interface.
            </p>
          </div>
        </div>
      </Card>

      <section>
        <SectionTitle
          title="Monitoring requests"
          hint="Approve or decline a nominated monitor"
          action={
            <Badge className="border-amber-600/20 bg-amber-100 text-amber-600">
              {pending.length} pending
            </Badge>
          }
        />

        {pending.length === 0 ? (
          <Card>
            <EmptyState
              icon={<Inbox size={22} />}
              title="Nothing waiting"
              description="New nominations will appear here for review."
              className="py-8"
            />
          </Card>
        ) : (
          <ul className="space-y-3">
            {pending.map((request) => (
              <li key={request.id}>
                <Card className="p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex min-w-0 items-start gap-3">
                      <Avatar name={request.requesterName} size={38} color="#5D8264" />
                      <div className="min-w-0">
                        <p className="text-[13.5px] font-semibold leading-tight text-ink-900">
                          {request.requesterName}
                          <span className="ml-2 text-[11px] font-normal text-ink-400">
                            nominated for {request.targetType}
                          </span>
                        </p>
                        <p className="mt-1 text-[12.5px] font-medium text-forest-800">
                          {request.targetName}
                        </p>
                        <p className="mt-1 text-[11px] text-ink-500">
                          Owner {request.ownerName}
                          {request.suggestedByName ? ` · suggested by ${request.suggestedByName}` : ''}
                        </p>
                        {request.note ? (
                          <p className="mt-2 rounded-xl bg-cream-100 px-3 py-2 text-[11.5px] leading-relaxed text-ink-600">
                            “{request.note}”
                          </p>
                        ) : null}
                        <p className="mt-1.5 text-[10px] text-ink-400">
                          Requested {relativeTime(request.createdAt)}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        icon={<X size={14} />}
                        onClick={() => setDecision({ request, status: 'rejected' })}
                      >
                        Decline
                      </Button>
                      <Button
                        size="sm"
                        icon={<Check size={14} />}
                        onClick={() => setDecision({ request, status: 'approved' })}
                      >
                        Approve
                      </Button>
                    </div>
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>

      {decided.length > 0 ? (
        <section>
          <SectionTitle title="Recent decisions" />
          <Card className="divide-y divide-cream-300">
            {decided.map((request) => (
              <div key={request.id} className="flex items-center gap-3 px-4 py-3">
                <span
                  className={`grid h-7 w-7 shrink-0 place-items-center rounded-full ${
                    request.status === 'approved'
                      ? 'bg-sage-100 text-forest-700'
                      : 'bg-clay-100 text-clay-600'
                  }`}
                >
                  {request.status === 'approved' ? <Check size={13} /> : <X size={13} />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12.5px] font-medium text-ink-800">
                    {request.requesterName} → {request.targetName}
                  </p>
                  <p className="text-[10.5px] text-ink-400">
                    {request.status} {request.decidedAt ? relativeTime(request.decidedAt) : ''}
                  </p>
                </div>
                <Badge
                  className={
                    request.status === 'approved'
                      ? 'border-forest-700/15 bg-sage-100 text-forest-800'
                      : 'border-clay-600/20 bg-clay-100 text-clay-700'
                  }
                >
                  {request.status}
                </Badge>
              </div>
            ))}
          </Card>
        </section>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <section>
          <SectionTitle
            title="Support queue"
            hint={`${openTickets.length} open · ${tickets.length} total`}
            action={
              <Link to="/tickets" className="text-[11.5px] font-semibold text-forest-700">
                Open board
              </Link>
            }
          />
          <Card>
            {tickets.length === 0 ? (
              <EmptyState icon={<LifeBuoy size={22} />} title="No tickets" className="py-8" />
            ) : (
              <ul className="divide-y divide-cream-300">
                {tickets.slice(0, 6).map((ticket: Ticket) => (
                  <li key={ticket.id}>
                    <Link
                      to={`/tickets/${ticket.id}`}
                      className="flex items-center gap-3 px-4 py-3 transition hover:bg-forest-700/5"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[12.5px] font-semibold text-ink-900">
                          {ticket.subject}
                        </p>
                        <p className="mt-0.5 text-[10.5px] text-ink-400">
                          {ticket.requesterName} · {formatDate(ticket.createdAt)}
                        </p>
                      </div>
                      <Badge className={ticketTheme[ticket.status].chip}>
                        {ticketTheme[ticket.status].label}
                      </Badge>
                      <Badge className={priorityTheme[ticket.priority].chip}>
                        {priorityTheme[ticket.priority].label}
                      </Badge>
                      <ChevronRight size={14} className="text-ink-400" aria-hidden />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </section>

        <section>
          <SectionTitle title="People" hint={`${people.length} accounts`} />
          <Card className="divide-y divide-cream-300">
            {people.map((person) => (
              <div key={person.id} className="flex items-center gap-3 px-4 py-3">
                <Avatar name={person.name} size={32} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12.5px] font-semibold text-ink-900">{person.name}</p>
                  <p className="truncate text-[10.5px] text-ink-400">
                    {person.headline ?? person.role}
                  </p>
                </div>
                <Badge
                  className={
                    person.role === 'admin'
                      ? 'border-forest-700/20 bg-forest-700/10 text-forest-800'
                      : 'border-forest-700/10 bg-cream-100 text-ink-500'
                  }
                >
                  {person.role === 'admin' ? <BadgeCheck size={11} /> : <UserRound size={11} />}
                  {person.role}
                </Badge>
              </div>
            ))}
          </Card>
          <p className="mt-2 flex items-center gap-1.5 text-[10px] text-ink-400">
            <Users size={11} aria-hidden /> Accounts are seeded locally; invitations arrive with the
            cloud build.
          </p>
        </section>
      </div>

      <DecisionSheet
        decision={decision}
        onClose={() => setDecision(null)}
        onDone={() => {
          setDecision(null)
          result.reload()
          toast.success('Decision saved')
        }}
      />
    </div>
  )
}

function DecisionSheet({
  decision,
  onClose,
  onDone,
}: {
  decision: { request: MonitoringRequest; status: 'approved' | 'rejected' } | null
  onClose: () => void
  onDone: () => void
}) {
  const toast = useToast()
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)

  async function submit() {
    if (!decision) return
    setSaving(true)
    try {
      await api.decideMonitoringRequest(decision.request.id, decision.status, note || undefined)
      setNote('')
      onDone()
    } catch (cause) {
      toast.error(cause instanceof ApiError ? cause.message : 'Could not save that decision')
    } finally {
      setSaving(false)
    }
  }

  if (!decision) return null
  const approving = decision.status === 'approved'

  return (
    <Sheet
      open
      onClose={onClose}
      title={approving ? 'Approve monitor' : 'Decline request'}
      description={
        approving
          ? `${decision.request.requesterName} will become the only monitor for ${decision.request.targetName}.`
          : `${decision.request.requesterName} will not gain access to ${decision.request.targetName}.`
      }
      footer={
        <Button
          full
          variant={approving ? 'primary' : 'danger'}
          loading={saving}
          onClick={() => void submit()}
          icon={approving ? <Check size={15} /> : <X size={15} />}
        >
          {approving ? 'Approve monitor' : 'Decline request'}
        </Button>
      }
    >
      <Field
        label="Note for the record"
        hint="Shown to the owner and requester. Optional but recommended."
      >
        <Textarea
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder={approving ? 'Capacity confirmed, one monitor per record.' : 'Already covered by the existing monitor.'}
          maxLength={240}
        />
      </Field>
    </Sheet>
  )
}

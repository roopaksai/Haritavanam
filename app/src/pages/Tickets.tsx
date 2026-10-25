import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertCircle,
  Bug,
  ChevronRight,
  LifeBuoy,
  MessageSquare,
  Plus,
  ShieldQuestion,
  TreePine,
} from 'lucide-react'
import { api, ApiError } from '../lib/api'
import { useAuth, usePlantScope } from '../lib/auth'
import { formatDate, priorityTheme, relativeTime, ticketTheme } from '../lib/format'
import type { Priority, Ticket, TicketStatus } from '../lib/types'
import { useAsync } from '../lib/useAsync'
import { useToast } from '../lib/toast'
import {
  Badge,
  Button,
  Card,
  EmptyState,
  ErrorState,
  Field,
  Input,
  Segmented,
  Select,
  Sheet,
  Skeleton,
  Textarea,
} from '../components/ui'

type Filter = 'all' | TicketStatus

const categoryLabel: Record<string, string> = {
  tree_health: 'Tree health',
  monitoring: 'Monitoring',
  app_issue: 'App issue',
  other: 'Other',
}

export default function Tickets() {
  const result = useAsync(() => api.tickets(), [])
  const [filter, setFilter] = useState<Filter>('all')
  const [createOpen, setCreateOpen] = useState(false)

  const tickets: Ticket[] = result.data?.tickets ?? []
  const filtered = filter === 'all' ? tickets : tickets.filter((ticket) => ticket.status === filter)

  return (
    <div className="space-y-5 pb-safe pb-[70px]">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[26px] font-semibold leading-tight text-ink-900 sm:text-[30px]">
            Support
          </h1>
          <p className="mt-1 text-[12.5px] text-ink-500">
            Ask about a tree, a monitoring change or something the app is doing.
          </p>
        </div>
        <Button size="sm" icon={<Plus size={15} />} onClick={() => setCreateOpen(true)}>
          New ticket
        </Button>
      </div>

      <Segmented
        ariaLabel="Filter tickets"
        options={[
          { value: 'all', label: 'All', count: tickets.length },
          { value: 'open', label: 'Open' },
          { value: 'in_progress', label: 'In progress' },
          { value: 'resolved', label: 'Resolved' },
        ]}
        value={filter}
        onChange={setFilter}
      />

      {result.error ? <ErrorState message={result.error} onRetry={result.reload} /> : null}

      {result.loading && !result.data ? (
        <div className="space-y-3">
          {[0, 1, 2].map((key) => (
            <Skeleton key={key} className="h-[104px] rounded-3xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={<LifeBuoy size={22} />}
            title={filter === 'all' ? 'Nothing reported' : 'Nothing in this state'}
            description={
              filter === 'all'
                ? 'If something looks wrong with a plant, open a ticket and an administrator will pick it up.'
                : 'Try another filter, or open a new ticket.'
            }
            action={
              <Button size="sm" icon={<Plus size={15} />} onClick={() => setCreateOpen(true)}>
                New ticket
              </Button>
            }
          />
        </Card>
      ) : (
        <ul className="space-y-3">
          {filtered.map((ticket) => (
            <li key={ticket.id}>
              <Link
                to={`/tickets/${ticket.id}`}
                className="group block rounded-3xl border border-forest-700/10 bg-cream-50 p-4 shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift"
              >
                <div className="flex items-start gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-sage-100 text-forest-700">
                    {ticket.category === 'tree_health' ? (
                      <TreePine size={16} />
                    ) : ticket.category === 'app_issue' ? (
                      <Bug size={16} />
                    ) : ticket.category === 'monitoring' ? (
                      <ShieldQuestion size={16} />
                    ) : (
                      <MessageSquare size={16} />
                    )}
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-[14px] font-semibold leading-tight text-ink-900">
                        {ticket.subject}
                      </p>
                      <Badge className={ticketTheme[ticket.status].chip}>{ticketTheme[ticket.status].label}</Badge>
                      <Badge className={priorityTheme[ticket.priority].chip}>
                        {priorityTheme[ticket.priority].label}
                      </Badge>
                    </div>
                    <p className="mt-1 line-clamp-2 text-[12px] leading-relaxed text-ink-500">
                      {ticket.description}
                    </p>
                    <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10.5px] text-ink-400">
                      <span>{categoryLabel[ticket.category] ?? ticket.category}</span>
                      <span>#{ticket.id.slice(0, 6)}</span>
                      <span>Updated {relativeTime(ticket.updatedAt)}</span>
                      {ticket.replyCount ? (
                        <span className="inline-flex items-center gap-1 font-semibold text-forest-700">
                          <MessageSquare size={10} /> {ticket.replyCount} repl
                          {ticket.replyCount === 1 ? 'y' : 'ies'}
                        </span>
                      ) : null}
                    </p>
                  </div>

                  <ChevronRight
                    size={16}
                    className="mt-2 shrink-0 text-ink-400 transition group-hover:text-forest-700"
                    aria-hidden
                  />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <CreateTicketSheet
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={() => {
          setCreateOpen(false)
          result.reload()
        }}
      />
    </div>
  )
}

function CreateTicketSheet({
  open,
  onClose,
  onCreated,
}: {
  open: boolean
  onClose: () => void
  onCreated: () => void
}) {
  const { user } = useAuth()
  const scope = usePlantScope()
  const toast = useToast()
  const plants = useAsync(() => (open ? api.plants({ scope }) : Promise.resolve({ plants: [] })), [open, scope])

  const [subject, setSubject] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('tree_health')
  const [priority, setPriority] = useState<Priority>('medium')
  const [plantId, setPlantId] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit() {
    if (subject.trim().length < 4 || description.trim().length < 10) {
      setError('Give the ticket a clear subject and a little more detail.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      await api.createTicket({
        subject: subject.trim(),
        description: description.trim(),
        category,
        priority,
        plantId: plantId || null,
      })
      toast.success('Ticket opened — an administrator will review it')
      setSubject('')
      setDescription('')
      setPlantId('')
      onCreated()
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : 'Could not open the ticket')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="New support ticket"
      description="Describe what you see. Photos can be added from the plant page."
      footer={
        <Button full loading={saving} onClick={() => void submit()}>
          Open ticket
        </Button>
      }
    >
      <div className="space-y-3.5">
        <Field label="Subject">
          <Input
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
            placeholder="Hollow patch on the main trunk"
            maxLength={120}
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Category">
            <Select value={category} onChange={(event) => setCategory(event.target.value)}>
              <option value="tree_health">Tree health</option>
              <option value="monitoring">Monitoring</option>
              <option value="app_issue">App issue</option>
              <option value="other">Other</option>
            </Select>
          </Field>
          <Field label="Priority">
            <Select value={priority} onChange={(event) => setPriority(event.target.value as Priority)}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </Select>
          </Field>
        </div>

        <Field label="Related plant" hint="Optional — links the ticket to a record.">
          <Select value={plantId} onChange={(event) => setPlantId(event.target.value)}>
            <option value="">No specific plant</option>
            {(plants.data?.plants ?? []).map((plant) => (
              <option key={plant.id} value={plant.id}>
                {plant.name}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="What is happening?">
          <Textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Where it is, when you noticed it, and what changed…"
            maxLength={800}
          />
        </Field>

        {error ? (
          <p className="flex items-start gap-2 rounded-xl border border-clay-600/20 bg-clay-100 px-3 py-2 text-[12px] text-clay-700">
            <AlertCircle size={14} className="mt-0.5 shrink-0" aria-hidden /> {error}
          </p>
        ) : null}

        <p className="text-[10.5px] leading-relaxed text-ink-400">
          Opening as <span className="font-semibold text-ink-600">{user?.name}</span> ·{' '}
          {formatDate(new Date().toISOString())}
        </p>
      </div>
    </Sheet>
  )
}

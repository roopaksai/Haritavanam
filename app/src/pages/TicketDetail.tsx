import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, LifeBuoy, Send, ShieldCheck, UserRound } from 'lucide-react'
import { api, ApiError } from '../lib/api'
import { useAuth } from '../lib/auth'
import { formatDateTime, priorityTheme, relativeTime, ticketTheme } from '../lib/format'
import type { Priority, TicketStatus } from '../lib/types'
import { useAsync } from '../lib/useAsync'
import { useToast } from '../lib/toast'
import {
  Avatar,
  Badge,
  Button,
  Card,
  ErrorState,
  Field,
  Select,
  Skeleton,
  Textarea,
} from '../components/ui'

export default function TicketDetail() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()

  const result = useAsync(() => api.ticket(id!), [id])
  const [reply, setReply] = useState('')
  const [sending, setSending] = useState(false)

  const ticket = result.data?.ticket

  async function send() {
    if (!ticket || reply.trim().length < 2) return
    setSending(true)
    try {
      await api.replyTicket(ticket.id, reply.trim())
      setReply('')
      toast.success('Reply sent')
      result.reload()
    } catch (cause) {
      toast.error(cause instanceof ApiError ? cause.message : 'Could not send that reply')
    } finally {
      setSending(false)
    }
  }

  async function setStatus(status: TicketStatus) {
    if (!ticket) return
    try {
      await api.updateTicket(ticket.id, { status })
      toast.success(`Ticket marked ${status.replace('_', ' ')}`)
      result.reload()
    } catch (cause) {
      toast.error(cause instanceof ApiError ? cause.message : 'Could not update the ticket')
    }
  }

  async function setPriority(priority: Priority) {
    if (!ticket) return
    try {
      await api.updateTicket(ticket.id, { priority })
      result.reload()
    } catch (cause) {
      toast.error(cause instanceof ApiError ? cause.message : 'Could not update the priority')
    }
  }

  if (result.loading && !ticket) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-[132px] rounded-3xl" />
        <Skeleton className="h-[180px] rounded-3xl" />
      </div>
    )
  }

  if (result.error) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" icon={<ArrowLeft size={15} />} onClick={() => navigate(-1)}>
          Back
        </Button>
        <ErrorState message={result.error} onRetry={result.reload} />
      </div>
    )
  }

  if (!ticket) return null
  const isAdmin = user?.role === 'admin'
  const closed = ticket.status === 'resolved'

  return (
    <div className="mx-auto max-w-3xl space-y-4 pb-safe pb-[70px]">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-forest-700"
      >
        <ArrowLeft size={14} /> All tickets
      </button>

      <Card className="p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-2">
          <Badge className={ticketTheme[ticket.status].chip}>{ticketTheme[ticket.status].label}</Badge>
          <Badge className={priorityTheme[ticket.priority].chip}>
            {priorityTheme[ticket.priority].label} priority
          </Badge>
          <span className="text-[10.5px] text-ink-400">#{ticket.id.slice(0, 8)}</span>
        </div>
        <h1 className="mt-2.5 text-[23px] font-semibold leading-tight text-ink-900 sm:text-[26px]">
          {ticket.subject}
        </h1>
        <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-ink-400">
          <span className="inline-flex items-center gap-1">
            <UserRound size={11} /> {ticket.requesterName}
          </span>
          <span>·</span>
          <span>{formatDateTime(ticket.createdAt)}</span>
        </p>

        <p className="mt-4 whitespace-pre-line text-[13px] leading-relaxed text-ink-700">
          {ticket.description}
        </p>

        {ticket.plantId ? (
          <Link
            to={`/plants/${ticket.plantId}`}
            className="mt-3 inline-flex items-center gap-1 text-[11.5px] font-semibold text-forest-700"
          >
            View related plant
          </Link>
        ) : null}
      </Card>

      {isAdmin ? (
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <ShieldCheck size={15} className="text-forest-700" aria-hidden />
            <h2 className="text-[14px] font-semibold text-ink-900">Administrator controls</h2>
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <Field label="Status">
              <Select
                value={ticket.status}
                onChange={(event) => void setStatus(event.target.value as TicketStatus)}
              >
                <option value="open">Open</option>
                <option value="in_progress">In progress</option>
                <option value="resolved">Resolved</option>
              </Select>
            </Field>
            <Field label="Priority">
              <Select
                value={ticket.priority}
                onChange={(event) => void setPriority(event.target.value as Priority)}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </Select>
            </Field>
          </div>
        </Card>
      ) : null}

      <Card className="p-4 sm:p-5">
        <h2 className="text-[16px] font-semibold text-ink-900">
          Conversation{ticket.replies.length ? ` · ${ticket.replies.length}` : ''}
        </h2>

        {ticket.replies.length === 0 ? (
          <p className="mt-3 rounded-2xl border border-dashed border-forest-700/20 px-4 py-6 text-center text-[12px] text-ink-400">
            No replies yet. An administrator usually responds within a day.
          </p>
        ) : (
          <ul className="mt-4 space-y-4">
            {ticket.replies.map((item) => {
              const mine = item.authorId === user?.id
              return (
                <li key={item.id} className={`flex gap-2.5 ${mine ? 'flex-row-reverse' : ''}`}>
                  <Avatar
                    name={item.authorName}
                    size={30}
                    color={item.authorRole === 'admin' ? '#3A5A40' : '#8C5A3C'}
                  />
                  <div className={`max-w-[85%] ${mine ? 'text-right' : ''}`}>
                    <p className="text-[10.5px] text-ink-400">
                      <span className="font-semibold text-ink-700">{item.authorName}</span>
                      {item.authorRole === 'admin' ? ' · admin' : ''} · {relativeTime(item.createdAt)}
                    </p>
                    <div
                      className={`mt-1 rounded-2xl px-3.5 py-2.5 text-[12.5px] leading-relaxed ${
                        mine
                          ? 'rounded-tr-sm bg-forest-700 text-cream-50'
                          : 'rounded-tl-sm bg-cream-100 text-ink-800'
                      }`}
                    >
                      {item.body}
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        )}

        {closed ? (
          <p className="mt-4 flex items-center gap-2 rounded-xl bg-sage-50 px-3 py-2.5 text-[11.5px] text-forest-800/80">
            <LifeBuoy size={13} aria-hidden /> This ticket is resolved. Open a new one if something changes.
          </p>
        ) : (
          <div className="mt-4 border-t border-cream-300 pt-4">
            <Textarea
              value={reply}
              onChange={(event) => setReply(event.target.value)}
              placeholder="Add an update…"
              maxLength={600}
              className="min-h-[80px]"
            />
            <div className="mt-2 flex justify-end">
              <Button size="sm" loading={sending} onClick={() => void send()} icon={<Send size={14} />}>
                Send reply
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}

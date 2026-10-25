import { Router } from 'express'
import { getStore } from '../db/index.js'
import { isAdmin, userMap } from '../lib/access.js'
import { asyncHandler, forbidden, notFound, nowIso, oneOf, requireFields } from '../lib/http.js'
import { newId } from '../lib/crypto.js'

export const ticketsRouter = Router()

const STATUSES = ['open', 'in_progress', 'resolved']
const PRIORITIES = ['low', 'medium', 'high']
const CATEGORIES = ['tree_health', 'monitoring', 'app_issue', 'other']

ticketsRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const store = await getStore()
    let tickets = await store.list('tickets')
    if (!isAdmin(req.user)) tickets = tickets.filter((ticket) => ticket.userId === req.user.id)
    tickets.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    const people = await userMap(store)
    res.json({
      tickets: tickets.map((ticket) => ({
        ...ticket,
        requesterName: people.get(ticket.userId)?.name ?? 'Unknown',
        replyCount: ticket.replies?.length ?? 0,
        lastReply:
          ticket.replies?.length > 0 ? ticket.replies[ticket.replies.length - 1] : null,
      })),
    })
  }),
)

ticketsRouter.post(
  '/',
  asyncHandler(async (req, res) => {
    requireFields(req.body, ['subject', 'description'])
    const store = await getStore()
    const ticket = {
      id: newId(),
      userId: req.user.id,
      subject: String(req.body.subject).trim(),
      category: oneOf(req.body.category ?? 'other', CATEGORIES, 'category'),
      description: String(req.body.description).trim(),
      status: 'open',
      priority: oneOf(req.body.priority ?? 'medium', PRIORITIES, 'priority'),
      plantId: req.body.plantId ?? null,
      replies: [],
      createdAt: nowIso(),
      updatedAt: nowIso(),
    }
    await store.insert('tickets', ticket)
    res.status(201).json({ ticket })
  }),
)

ticketsRouter.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const store = await getStore()
    const ticket = await store.get('tickets', req.params.id)
    if (!ticket) throw notFound('Ticket not found')
    if (!isAdmin(req.user) && ticket.userId !== req.user.id) throw forbidden()

    const people = await userMap(store)
    res.json({
      ticket: {
        ...ticket,
        requesterName: people.get(ticket.userId)?.name ?? 'Unknown',
        replies: (ticket.replies ?? []).map((reply) => ({
          ...reply,
          authorName: people.get(reply.authorId)?.name ?? 'Haritavanam',
          authorRole: people.get(reply.authorId)?.role ?? 'admin',
        })),
      },
    })
  }),
)

ticketsRouter.post(
  '/:id/replies',
  asyncHandler(async (req, res) => {
    requireFields(req.body, ['body'])
    const store = await getStore()
    const ticket = await store.get('tickets', req.params.id)
    if (!ticket) throw notFound('Ticket not found')
    if (!isAdmin(req.user) && ticket.userId !== req.user.id) throw forbidden()
    if (ticket.status === 'resolved') throw forbidden('This ticket is already resolved')

    const reply = {
      id: newId(),
      authorId: req.user.id,
      body: String(req.body.body).trim(),
      createdAt: nowIso(),
    }
    const updated = await store.update('tickets', ticket.id, {
      replies: [...(ticket.replies ?? []), reply],
      updatedAt: nowIso(),
      status: isAdmin(req.user) && ticket.status === 'open' ? 'in_progress' : ticket.status,
    })
    res.status(201).json({
      reply: { ...reply, authorName: req.user.name, authorRole: req.user.role },
      ticket: updated,
    })
  }),
)

ticketsRouter.patch(
  '/:id',
  asyncHandler(async (req, res) => {
    if (!isAdmin(req.user)) throw forbidden('Only an administrator can triage tickets')
    const store = await getStore()
    const ticket = await store.get('tickets', req.params.id)
    if (!ticket) throw notFound('Ticket not found')

    const patch = { updatedAt: nowIso() }
    if (req.body.status !== undefined) patch.status = oneOf(req.body.status, STATUSES, 'status')
    if (req.body.priority !== undefined) patch.priority = oneOf(req.body.priority, PRIORITIES, 'priority')

    const updated = await store.update('tickets', ticket.id, patch)
    res.json({ ticket: updated })
  }),
)

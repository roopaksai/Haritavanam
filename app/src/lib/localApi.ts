/**
 * Haritavanam local-first API.
 *
 * Implements the exact same function signatures as `api.ts` so every page
 * works unchanged whether the app talks to a remote backend or to this
 * IndexedDB layer. Used when `VITE_API_URL` is unset.
 *
 * All reads/writes go through `db` (Dexie/IndexedDB). Auth sessions live in
 * `sessionStorage` so a tab refresh keeps you signed in, but closing the tab
 * signs you out — matching the demo's session-only semantics.
 */

import { db, seedDatabase, getSession, createSession, destroySession, getCurrentUser, verifyPassword, nowIso, getDemoAccounts, type StoredUser } from './storage'
import { bytesToBase64 } from './crypto-compat'
import type {
  CareLog,
  CareType,
  DiseaseScan,
  Field,
  MonitoringRequest,
  Plant,
  Ticket,
  TicketStatus,
} from './types'

const DEMO_PASSWORD = 'Haritavanam@123'
const SESSION_KEY = 'hv:session'

function sessionToken() {
  try {
    return sessionStorage.getItem(SESSION_KEY)
  } catch {
    return null
  }
}

function setSessionToken(token: string | null) {
  try {
    if (token) sessionStorage.setItem(SESSION_KEY, token)
    else sessionStorage.removeItem(SESSION_KEY)
  } catch {
    /* ignore */
  }
}

async function requireSession() {
  const token = sessionToken()
  if (!token) throw new ApiError('Sign in required', 401, 'unauthorized')
  const session = await getSession(token)
  if (!session) throw new ApiError('Session expired', 401, 'unauthorized')
  return session
}

async function getCurrentUserFromSession() {
  const token = sessionToken()
  if (!token) return null
  return getCurrentUser(token)
}

export class ApiError extends Error {
  status: number
  code: string
  details?: unknown

  constructor(message: string, status: number, code = 'error', details?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.details = details
  }

  get isOffline() {
    return false
  }
}

function decoratePlant(plant: Plant, ownerName: string, monitorName: string | null): Plant {
  return {
    ...plant,
    ownerName,
    ownerInitials: initials(ownerName),
    monitorName,
    monitorInitials: monitorName ? initials(monitorName) : null,
  }
}

function initials(name?: string | null) {
  if (!name) return '—'
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

async function userMap() {
  const users = await db.users.toArray()
  return new Map(users.map((user) => [user.id, user]))
}

/* ---------------------------------------------------------------- auth */

export const localApi = {
  async me() {
    await seedDatabase()
    const user = await getCurrentUserFromSession()
    return { user: user ?? null }
  },

  async demoAccounts() {
    const accounts = await getDemoAccounts()
    return { accounts, password: DEMO_PASSWORD }
  },

  async login(email: string, password: string) {
    await seedDatabase()
    const trimmed = String(email || '').trim().toLowerCase()
    const user = await db.users.where('email').equals(trimmed).first()
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      throw new ApiError('Email or password is incorrect', 401, 'unauthorized')
    }
    const { token } = await createSession(user.id)
    setSessionToken(token)
    return { user: sanitizeUser(user) }
  },

  async logout() {
    const token = sessionToken()
    if (token) await destroySession(token)
    setSessionToken(null)
    return { ok: true }
  },

  async updateProfile(patch: { name?: string | null | undefined; phone?: string | null | undefined; headline?: string | null | undefined }) {
    const user = await requireSession()
    const current = await db.users.get(user.userId)
    if (!current) throw new ApiError('User not found', 404, 'not_found')

    const updates: Partial<StoredUser> = {}
    if (typeof patch.name === 'string') {
      updates.name = patch.name.trim()
      if (updates.name === '') throw new ApiError('Name cannot be empty', 400, 'bad_request')
    }
    if (typeof patch.phone === 'string') updates.phone = patch.phone.trim() || null
    if (typeof patch.headline === 'string') updates.headline = patch.headline.trim() || null

    await db.users.update(current.id, updates)
    const updated = await db.users.get(current.id)
    return { user: sanitizeUser(updated!) }
  },

  /* ---------------------------------------------------------------- plants */

  async plants(params: { scope?: string; q?: string; status?: string } = {}) {
    await seedDatabase()
    const session = await requireSession()
    const { scope = 'mine', q = '', status } = params

    const users = await userMap()
    let plants = await db.plants.toArray()

    const isAdmin = session.userId ? (await db.users.get(session.userId))?.role === 'admin' : false

    if (!isAdmin || scope === 'mine') {
      plants = plants.filter(
        (plant) => plant.ownerId === session.userId || plant.monitorId === session.userId,
      )
    }
    if (scope === 'monitoring' && !isAdmin) {
      plants = plants.filter((plant) => plant.monitorId === session.userId)
    }
    if (scope === 'owned' && !isAdmin) {
      plants = plants.filter((plant) => plant.ownerId === session.userId)
    }
    if (status) plants = plants.filter((plant) => plant.status === status)
    if (q) {
      const needle = String(q).toLowerCase()
      plants = plants.filter((plant) =>
        [plant.name, plant.species, plant.localName].join(' ').toLowerCase().includes(needle),
      )
    }

    plants.sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)))

    const enriched = await Promise.all(
      plants.map(async (plant) => {
        const owner = users.get(plant.ownerId)
        const monitor = plant.monitorId ? users.get(plant.monitorId) : undefined
        return decoratePlant(plant, owner?.name ?? 'Unassigned', monitor?.name ?? null)
      }),
    )

    return { plants: enriched }
  },

  async plant(id: string) {
    await seedDatabase()
    const session = await requireSession()
    const users = await userMap()
    const plant = await db.plants.get(id)
    if (!plant) throw new ApiError('Plant not found', 404, 'not_found')

    const isAdminUser = (await db.users.get(session.userId))?.role === 'admin'
    if (!isAdminUser && plant.ownerId !== session.userId && plant.monitorId !== session.userId) {
      throw new ApiError('You do not have access to this record', 403, 'forbidden')
    }

    const logs = await db.careLogs.where('plantId').equals(id).toArray()
    logs.sort((a, b) => b.createdAt.localeCompare(a.createdAt))

    const scans = await db.diseaseScans.where('plantId').equals(id).toArray()
    scans.sort((a, b) => b.createdAt.localeCompare(a.createdAt))

    const owner = users.get(plant.ownerId)
    const monitor = plant.monitorId ? users.get(plant.monitorId) : undefined

    return {
      plant: decoratePlant(plant, owner?.name ?? 'Unassigned', monitor?.name ?? null),
      careLogs: logs,
      scans,
      permissions: {
        canEdit: isAdminUser || plant.ownerId === session.userId,
        canLogCare:
          isAdminUser || plant.ownerId === session.userId || plant.monitorId === session.userId,
        isMonitor: plant.monitorId === session.userId,
      },
    }
  },

  async createPlant(body: Partial<Plant>) {
    const session = await requireSession()
    const user = await db.users.get(session.userId)
    if (!user) throw new ApiError('Sign in required', 401, 'unauthorized')

    const lat = Number(body.lat)
    const lng = Number(body.lng)
    if (!(lat >= -90 && lat <= 90) || !(lng >= -180 && lng <= 180)) {
      throw new ApiError('Location is outside valid coordinates', 400, 'bad_request')
    }

    const health = Number(body.health ?? 100)
    const computedStatus = health >= 85 ? 'healthy' : health >= 65 ? 'needs_attention' : 'critical'
    const now = nowIso()

    const plant: Plant = {
      id: `plt_${Date.now().toString(36)}`,
      name: String(body.name ?? '').trim(),
      species: String(body.species ?? '').trim(),
      localName: body.localName ? String(body.localName).trim() : null,
      ownerId: session.userId,
      monitorId: body.monitorId ?? null,
      status: computedStatus,
      health,
      plantedOn: body.plantedOn || now.slice(0, 10),
      lat,
      lng,
      areaSqm: body.areaSqm ? Number(body.areaSqm) : null,
      address: body.address ? String(body.address).trim() : null,
      photoUrl: body.photoUrl ?? null,
      notes: body.notes ? String(body.notes).trim() : null,
      qrToken: qrSlugLocal(),
      lastWateredAt: null,
      nextWateringDue: nextWateringDueLocal('water'),
      createdAt: now,
      updatedAt: now,
    }

    await db.plants.add(plant)
    const owner = (await db.users.get(plant.ownerId))?.name ?? 'Unassigned'
    return { plant: decoratePlant(plant, owner, null) }
  },

  async updatePlant(id: string, body: Partial<Plant>) {
    const session = await requireSession()
    const plant = await db.plants.get(id)
    if (!plant) throw new ApiError('Plant not found', 404, 'not_found')

    const isAdminUser = (await db.users.get(session.userId))?.role === 'admin'
    if (!isAdminUser && plant.ownerId !== session.userId) {
      throw new ApiError('Only the owner can edit this record', 403, 'forbidden')
    }

    const patch: Partial<Plant> = { updatedAt: nowIso() }
    if (typeof body.name === 'string') patch.name = body.name.trim() || undefined
    if (typeof body.species === 'string') patch.species = body.species.trim() || undefined
    if (body.localName !== null && body.localName !== undefined)
      patch.localName = body.localName.trim() || null
    if (body.notes !== null && body.notes !== undefined)
      patch.notes = body.notes.trim() || null
    if (body.photoUrl !== null && body.photoUrl !== undefined)
      patch.photoUrl = body.photoUrl || null
    if (typeof body.plantedOn === 'string') patch.plantedOn = body.plantedOn.trim() || undefined
    if (body.address !== null && body.address !== undefined)
      patch.address = body.address.trim() || null
    if (body.status !== undefined) patch.status = body.status
    if (body.health !== undefined) patch.health = Number(body.health)

    await db.plants.update(id, patch)
    const updated = await db.plants.get(id)
    if (!updated) throw new ApiError('Plant not found after update', 404, 'not_found')
    const owner = (await db.users.get(updated.ownerId))?.name ?? 'Unassigned'
    const monitor = updated.monitorId ? (await db.users.get(updated.monitorId))?.name : null
    return { plant: decoratePlant(updated, owner, monitor ?? null) }
  },

  async deletePlant(id: string) {
    const session = await requireSession()
    const plant = await db.plants.get(id)
    if (!plant) throw new ApiError('Plant not found', 404, 'not_found')

    const isAdminUser = (await db.users.get(session.userId))?.role === 'admin'
    if (!isAdminUser && plant.ownerId !== session.userId) {
      throw new ApiError('Only the owner can delete this record', 403, 'forbidden')
    }

    await db.plants.delete(id)
    await db.careLogs.where('plantId').equals(id).delete()
    await db.diseaseScans.where('plantId').equals(id).delete()
    return { ok: true }
  },

  async logCare(plantId: string, body: { type: CareType; note?: string }) {
    const session = await requireSession()
    const plant = await db.plants.get(plantId)
    if (!plant) throw new ApiError('Plant not found', 404, 'not_found')

    const isAdminUser = (await db.users.get(session.userId))?.role === 'admin'
    if (
      !isAdminUser &&
      plant.ownerId !== session.userId &&
      plant.monitorId !== session.userId
    ) {
      throw new ApiError('You cannot log care for this record', 403, 'forbidden')
    }

    const user = await db.users.get(session.userId)
    const log: CareLog = {
      id: `care_${Date.now().toString(36)}`,
      plantId,
      type: body.type,
      note: body.note ?? null,
      actorId: session.userId,
      actorName: user?.name,
      createdAt: nowIso(),
    }
    await db.careLogs.add(log)

    const now = nowIso()
    const days = body.type === 'water' ? 3 : 7
    const due = new Date()
    due.setDate(due.getDate() + days)
    await db.plants.update(plantId, {
      lastWateredAt: now,
      nextWateringDue: due.toISOString(),
      updatedAt: now,
    })

    return { careLog: log }
  },

  /* ---------------------------------------------------------------- fields */

  async fields() {
    await seedDatabase()
    const session = await requireSession()
    const users = await userMap()
    const isAdminUser = (await db.users.get(session.userId))?.role === 'admin'

    let fields = await db.fields.toArray()
    if (!isAdminUser) {
      fields = fields.filter(
        (field) => field.ownerId === session.userId || field.monitorId === session.userId,
      )
    }

    const enriched = await Promise.all(
      fields.map(async (field) => {
        const owner = users.get(field.ownerId)
        const monitor = field.monitorId ? users.get(field.monitorId) : undefined
        return {
          ...field,
          ownerName: owner?.name ?? 'Unassigned',
          monitorName: monitor?.name ?? null,
        }
      }),
    )

    return { fields: enriched }
  },

  async createField(body: { name: string; polygon: [number, number][]; crop?: string; notes?: string }) {
    const session = await requireSession()
    if (!Array.isArray(body.polygon) || body.polygon.length < 3) {
      throw new ApiError('A field needs at least three boundary points', 400, 'bad_request')
    }
    const polygon = body.polygon.map((point) => {
      const lat = Number(point[0])
      const lng = Number(point[1])
      if (!(lat >= -90 && lat <= 90) || !(lng >= -180 && lng <= 180)) {
        throw new ApiError('Boundary point is outside valid coordinates', 400, 'bad_request')
      }
      return [lat, lng] as [number, number]
    })
    const centerLat = Number((polygon.reduce((sum, p) => sum + p[0], 0) / polygon.length).toFixed(6))
    const centerLng = Number((polygon.reduce((sum, p) => sum + p[1], 0) / polygon.length).toFixed(6))

    const now = nowIso()
    const field: Field = {
      id: `fld_${Date.now().toString(36)}`,
      name: String(body.name).trim(),
      crop: body.crop ? String(body.crop).trim() : null,
      ownerId: session.userId,
      monitorId: null,
      status: 'new',
      areaSqm: null,
      polygon,
      centerLat,
      centerLng,
      plantedOn: now.slice(0, 10),
      photoUrl: null,
      notes: body.notes ? String(body.notes).trim() : null,
      createdAt: now,
      updatedAt: now,
    }

    await db.fields.add(field)
    return { field }
  },

  /* ---------------------------------------------------------------- monitoring */

  async monitoringRequests() {
    await seedDatabase()
    const session = await requireSession()
    const users = await userMap()
    const isAdminUser = (await db.users.get(session.userId))?.role === 'admin'

    let requests = await db.monitoringRequests.toArray()
    if (!isAdminUser) {
      requests = requests.filter(
        (request) => request.ownerId === session.userId || request.requesterId === session.userId,
      )
    }
    requests.sort((a, b) => b.createdAt.localeCompare(a.createdAt))

    const enriched = await Promise.all(
      requests.map(async (request) => {
        const requester = users.get(request.requesterId)
        const owner = users.get(request.ownerId)
        return {
          ...request,
          requesterName: requester?.name ?? 'Unknown',
          ownerName: owner?.name ?? 'Unknown',
          suggestedByName: request.suggestedBy ? users.get(request.suggestedBy)?.name : null,
        }
      }),
    )

    return { requests: enriched }
  },

  async createMonitoringRequest(body: {
    targetType: 'plant' | 'field'
    targetId: string
    requesterId?: string
    note?: string
  }) {
    const session = await requireSession()
    const actor = await db.users.get(session.userId)

    const targetType = body.targetType
    const collection = targetType === 'plant' ? db.plants : db.fields
    const target = await collection.get(body.targetId)
    if (!target) throw new ApiError(`${targetType === 'plant' ? 'Plant' : 'Field'} not found`, 404, 'not_found')

    const ownerId = target.ownerId
    const actorIsOwner = session.userId === ownerId
    const actorIsAdmin = actor?.role === 'admin'

    let requesterId = session.userId
    let suggestedBy: string | null = null

    if (actorIsOwner || actorIsAdmin) {
      if (!body.requesterId) throw new ApiError('Choose the person you want to nominate', 400, 'bad_request')
      requesterId = String(body.requesterId)
      suggestedBy = session.userId
    } else if (target.monitorId === session.userId) {
      throw new ApiError('You already monitor this record', 409, 'conflict')
    }

    if (requesterId === ownerId) throw new ApiError('The owner already carries this record', 400, 'bad_request')
    if (target.monitorId) throw new ApiError('This record already has an active monitor', 409, 'conflict')

    const requester = await db.users.get(requesterId)
    if (!requester) throw new ApiError('The nominated person does not exist', 400, 'bad_request')

    const duplicate = await db.monitoringRequests
      .where('targetType')
      .equals(targetType)
      .filter((r) => r.targetId === target.id && r.requesterId === requesterId && r.status === 'pending')
      .first()
    if (duplicate) throw new ApiError('A request for this person is already pending', 409, 'conflict')

    const now = nowIso()
    const request: MonitoringRequest = {
      id: `mon_${Date.now().toString(36)}`,
      targetType,
      targetId: target.id,
      targetName: target.name,
      requesterId,
      ownerId,
      suggestedBy,
      status: 'pending',
      note: body.note ? String(body.note).trim() : null,
      adminNote: null,
      decidedBy: null,
      decidedAt: null,
      createdAt: now,
    }
    await db.monitoringRequests.add(request)

    return {
      request: {
        ...request,
        requesterName: requester.name,
        ownerName: actor?.name ?? 'Unknown',
        suggestedByName: suggestedBy ? actor?.name : null,
      },
    }
  },

  async decideMonitoringRequest(id: string, status: 'approved' | 'rejected', note?: string) {
    const session = await requireSession()
    const actor = await db.users.get(session.userId)
    if (actor?.role !== 'admin') throw new ApiError('Only an administrator can approve a monitoring request', 403, 'forbidden')

    const request = await db.monitoringRequests.get(id)
    if (!request) throw new ApiError('Request not found', 404, 'not_found')
    if (request.status !== 'pending') throw new ApiError('This request has already been decided', 409, 'conflict')

    if (status === 'approved') {
      const collection = request.targetType === 'plant' ? db.plants : db.fields
      const target = await collection.get(request.targetId)
      if (!target) throw new ApiError('The record no longer exists', 404, 'not_found')
      if (target.monitorId && target.monitorId !== request.requesterId) {
        throw new ApiError('This record already has an active monitor', 409, 'conflict')
      }
      await collection.update(target.id, { monitorId: request.requesterId, updatedAt: nowIso() })
    }

    await db.monitoringRequests.update(id, {
      status,
      adminNote: note ? String(note).trim() : null,
      decidedBy: session.userId,
      decidedAt: nowIso(),
    })

    const updated = await db.monitoringRequests.get(id)
    if (!updated) throw new ApiError('Request not found after decision', 404, 'not_found')
    const users = await userMap()
    return {
      request: {
        ...updated,
        requesterName: users.get(updated.requesterId)?.name ?? 'Unknown',
        ownerName: users.get(updated.ownerId)?.name ?? 'Unknown',
        suggestedByName: updated.suggestedBy ? users.get(updated.suggestedBy)?.name : null,
      },
    }
  },

  /* ---------------------------------------------------------------- tickets */

  async tickets() {
    const session = await requireSession()
    const users = await userMap()
    const isAdminUser = (await db.users.get(session.userId))?.role === 'admin'

    let tickets = await db.tickets.toArray()
    if (!isAdminUser) tickets = tickets.filter((ticket) => ticket.userId === session.userId)
    tickets.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))

    const enriched = await Promise.all(
      tickets.map(async (ticket) => {
        const requester = users.get(ticket.userId)
        return {
          ...ticket,
          requesterName: requester?.name ?? 'Unknown',
          replyCount: ticket.replies?.length ?? 0,
          lastReply:
            ticket.replies?.length > 0 ? ticket.replies[ticket.replies.length - 1] : null,
        }
      }),
    )

    return { tickets: enriched }
  },

  async ticket(id: string) {
    const session = await requireSession()
    const users = await userMap()
    const ticket = await db.tickets.get(id)
    if (!ticket) throw new ApiError('Ticket not found', 404, 'not_found')

    const isAdminUser = (await db.users.get(session.userId))?.role === 'admin'
    if (!isAdminUser && ticket.userId !== session.userId) {
      throw new ApiError('You do not have access to this ticket', 403, 'forbidden')
    }

    const enriched = {
      ...ticket,
      requesterName: users.get(ticket.userId)?.name ?? 'Unknown',
      replies: (ticket.replies ?? []).map((reply) => {
        const author = users.get(reply.authorId)
        return {
          ...reply,
          authorName: author?.name ?? 'Haritavanam',
          authorRole: author?.role ?? 'admin',
        }
      }),
      replyCount: ticket.replies?.length ?? 0,
      lastReply:
        ticket.replies?.length > 0 ? ticket.replies[ticket.replies.length - 1] : null,
    }
    return { ticket: enriched }
  },

  async createTicket(body: {
    subject: string
    description: string
    category: string
    priority: TicketStatus
    plantId?: string | null
  }) {
    const session = await requireSession()
    const user = await db.users.get(session.userId)
    if (!user) throw new ApiError('Sign in required', 401, 'unauthorized')

    const now = nowIso()
    const ticket: Ticket = {
      id: `tkt_${Date.now().toString(36)}`,
      userId: session.userId,
      subject: String(body.subject).trim(),
      category: body.category as Ticket['category'],
      description: String(body.description).trim(),
      status: 'open',
      priority: body.priority as Ticket['priority'],
      plantId: body.plantId ?? null,
      replies: [],
      createdAt: now,
      updatedAt: now,
    }

    await db.tickets.add(ticket)
    return { ticket: { ...ticket, requesterName: user.name, replyCount: 0, lastReply: null } }
  },

  async replyTicket(id: string, body: string) {
    const session = await requireSession()
    const users = await userMap()
    const ticket = await db.tickets.get(id)
    if (!ticket) throw new ApiError('Ticket not found', 404, 'not_found')

    const isAdminUser = (await db.users.get(session.userId))?.role === 'admin'
    if (!isAdminUser && ticket.userId !== session.userId) {
      throw new ApiError('You do not have access to this ticket', 403, 'forbidden')
    }
    if (ticket.status === 'resolved') throw new ApiError('This ticket is already resolved', 403, 'forbidden')

    const reply = {
      id: `rep_${Date.now().toString(36)}`,
      authorId: session.userId,
      body: String(body).trim(),
      createdAt: nowIso(),
    }
    const updatedReplies = [...(ticket.replies ?? []), reply]
    const now = nowIso()
    await db.tickets.update(id, {
      replies: updatedReplies,
      updatedAt: now,
      status: isAdminUser && ticket.status === 'open' ? 'in_progress' : ticket.status,
    })

    const updated = await db.tickets.get(id)
    const author = users.get(reply.authorId)
    return {
      reply: { ...reply, authorName: author?.name ?? 'Haritavanam', authorRole: author?.role ?? 'admin' },
      ticket: {
        ...updated,
        replies: updatedReplies.map((r) => {
          const a = users.get(r.authorId)
          return { ...r, authorName: a?.name ?? 'Haritavanam', authorRole: a?.role ?? 'admin' }
        }),
        replyCount: updatedReplies.length,
        lastReply: updatedReplies[updatedReplies.length - 1],
      },
    }
  },

  async updateTicket(id: string, body: { status?: TicketStatus; priority?: string }) {
    const session = await requireSession()
    const actor = await db.users.get(session.userId)
    if (actor?.role !== 'admin') throw new ApiError('Only an administrator can triage tickets', 403, 'forbidden')

    const ticket = await db.tickets.get(id)
    if (!ticket) throw new ApiError('Ticket not found', 404, 'not_found')

    const patch: Partial<Ticket> = { updatedAt: nowIso() }
    if (body.status !== undefined) patch.status = body.status
    if (body.priority !== undefined) patch.priority = body.priority as Ticket['priority']

    await db.tickets.update(id, patch)
    const updated = await db.tickets.get(id)
    if (!updated) throw new ApiError('Ticket not found after update', 404, 'not_found')
    const users = await userMap()
    const requester = users.get(updated.userId)
    return {
      ticket: {
        ...updated,
        requesterName: requester?.name ?? 'Unknown',
        replyCount: (updated.replies ?? []).length,
        lastReply: (updated.replies ?? []).length > 0 ? updated.replies[updated.replies.length - 1] : null,
      },
    }
  },

  /* ---------------------------------------------------------------- insights */

  async stats() {
    const session = await requireSession()
    const isAdminUser = (await db.users.get(session.userId))?.role === 'admin'

    const plants = await db.plants.toArray()
    const fields = await db.fields.toArray()
    const logs = await db.careLogs.toArray()
    const tickets = await db.tickets.toArray()
    const requests = await db.monitoringRequests.toArray()

    const mine = isAdminUser
      ? plants
      : plants.filter((plant) => plant.ownerId === session.userId || plant.monitorId === session.userId)
    const myFields = isAdminUser
      ? fields
      : fields.filter((field) => field.ownerId === session.userId || field.monitorId === session.userId)
    const myIds = new Set(mine.map((plant) => plant.id))

    const weekAgo = Date.now() - 7 * 86400000
    const careThisWeek = logs.filter(
      (log) => myIds.has(log.plantId) && new Date(log.createdAt).getTime() >= weekAgo,
    ).length

    const avgHealth = mine.length
      ? Math.round(mine.reduce((sum, plant) => sum + Number(plant.health ?? 0), 0) / mine.length)
      : 0

    const dueSoon = mine.filter((plant) => {
      if (!plant.nextWateringDue) return false
      return new Date(plant.nextWateringDue).getTime() <= Date.now() + 86400000
    }).length

    const openTickets = isAdminUser
      ? tickets.filter((ticket) => ticket.status !== 'resolved').length
      : tickets.filter((ticket) => ticket.userId === session.userId && ticket.status !== 'resolved').length

    const pendingRequests = isAdminUser
      ? requests.filter((request) => request.status === 'pending').length
      : requests.filter((request) => request.status === 'pending' && request.ownerId === session.userId).length

    const monitors = (await db.users.where('role').equals('monitor').toArray()).length

    return {
      stats: {
        plants: mine.length,
        fields: myFields.length,
        healthy: mine.filter((plant) => plant.status === 'healthy').length,
        needsAttention: mine.filter((plant) => plant.status === 'needs_attention').length,
        critical: mine.filter((plant) => plant.status === 'critical').length,
        careThisWeek,
        dueSoon,
        avgHealth,
        openTickets,
        pendingRequests,
        monitors,
        pendingMonitoringRequests: requests.filter((request) => request.status === 'pending').length,
      },
    }
  },

  async people() {
    await seedDatabase()
    const users = await db.users.toArray()
    return {
      people: users.map((user) => ({
        id: user.id,
        name: user.name,
        role: user.role,
        email: user.email,
        avatarColor: user.avatarColor,
        headline: user.headline,
      })),
    }
  },

  /* ---------------------------------------------------------------- disease */

  async analyze(body: { plantId: string; imageUrl?: string; symptomText?: string }) {
    const session = await requireSession()
    const plant = await db.plants.get(body.plantId)
    if (!plant) throw new ApiError('Plant not found', 404, 'not_found')

    const isAdminUser = (await db.users.get(session.userId))?.role === 'admin'
    if (!isAdminUser && plant.ownerId !== session.userId && plant.monitorId !== session.userId) {
      throw new ApiError('You do not have access to this record', 403, 'forbidden')
    }
    if (!body.imageUrl && !body.symptomText) {
      throw new ApiError('Attach a photo or describe the symptom', 400, 'bad_request')
    }

    const seed = `${plant.id}:${body.imageUrl ?? ''}:${body.symptomText ?? ''}`
    const conditions = [
      { name: 'Neem leaf spot (Pseudocercospora)', advice: 'Remove the affected leaves and avoid overhead watering for two weeks.', severity: 'moderate' },
      { name: 'Powdery mildew', advice: 'Improve airflow around the canopy and apply a sulphur-based spray in the early morning.', severity: 'low' },
      { name: 'Nutrient deficiency (nitrogen)', advice: 'Apply well-rotted compost at the drip line and re-check new growth in 14 days.', severity: 'low' },
      { name: 'Possibly healthy foliage', advice: 'No clear lesion pattern. Keep monitoring weekly and log any change with a photo.', severity: 'none' },
      { name: 'Bark canker (early stage)', advice: 'Do not prune around the wound. Ask an arborist to inspect within a week.', severity: 'high' },
    ]
    function pick(seedStr: string, length: number) {
      let hash = 0
      for (let i = 0; i < seedStr.length; i += 1) hash = (hash * 31 + seedStr.charCodeAt(i)) % 100000
      return hash % length
    }
    const primary = conditions[pick(seed, conditions.length)]
    const secondary = conditions[(pick(seed, conditions.length) + 2) % conditions.length]
    const confidence = 0.62 + pick(seed, 24) / 100

    const results = [
      { name: primary.name, confidence: Number(confidence.toFixed(2)), severity: primary.severity, advice: primary.advice },
      { name: secondary.name, confidence: Number((confidence - 0.21).toFixed(2)), severity: secondary.severity, advice: secondary.advice },
    ]

    const scan: DiseaseScan = {
      id: `scan_${Date.now().toString(36)}`,
      plantId: plant.id,
      imageUrl: body.imageUrl ?? null,
      symptomText: body.symptomText ?? null,
      provider: 'mock',
      results,
      createdAt: nowIso(),
    }
    await db.diseaseScans.add(scan)

    return {
      scan,
      providerConfigured: false,
      providerNote: 'Simulated result for the demo. Add PLANT_ID_API_KEY to a backend to enable a live provider.',
      disclaimer: 'Possible matches, not a diagnosis. Confirm with a qualified arborist before treating a tree.',
    }
  },

  /* ---------------------------------------------------------------- upload */

  async upload(file: File) {
    await seedDatabase()
    await requireSession()

    const arrayBuffer = await file.arrayBuffer()
    const bytes = new Uint8Array(arrayBuffer)
    const base64 = bytesToBase64(bytes)
    const url = `data:${file.type};base64,${base64}`

    const id = `upl_${Date.now().toString(36)}`
    await db.uploads.add({ id, url, size: file.size, createdAt: nowIso() })

    return { url, size: file.size }
  },

  /* ---------------------------------------------------------------- feedback */

  async feedback(body: { rating: number; message: string }) {
    const session = await requireSession()
    const rating = Number(body.rating ?? 0)
    if (!(rating >= 1 && rating <= 5)) throw new ApiError('Rating must be between 1 and 5', 400, 'bad_request')

    await db.feedback.add({
      id: `fb_${Date.now().toString(36)}`,
      userId: session.userId,
      rating,
      message: String(body.message).trim(),
      createdAt: nowIso(),
    })
    return { ok: true }
  },

  /* ---------------------------------------------------------------- public */

  async publicPlant(token: string) {
    await seedDatabase()
    const plant = await db.plants.where('qrToken').equals(token).first()
    if (!plant) throw new ApiError('This label is not linked to a plant', 404, 'not_found')

    const owner = await db.users.get(plant.ownerId)
    const logs = await db.careLogs.where('plantId').equals(plant.id).toArray()
    logs.sort((a, b) => b.createdAt.localeCompare(a.createdAt))

    await db.plants.update(plant.id, {
      scanCount: Number(plant.scanCount ?? 0) + 1,
    })

    return {
      plant: {
        name: plant.name,
        species: plant.species,
        localName: plant.localName,
        plantedOn: plant.plantedOn,
        photoUrl: plant.photoUrl,
        status: plant.status,
        health: plant.health,
        areaSqm: plant.areaSqm,
        city: 'Bengaluru',
        region: 'Karnataka',
        country: 'India',
        ownerFirstName: owner?.name?.split(' ')[0] ?? 'A caretaker',
        careCount: logs.length,
        lastCaredAt: logs[0]?.createdAt ?? null,
        qrToken: plant.qrToken,
      },
    }
  },
}

/* ---------------------------------------------------------------- helpers */

function sanitizeUser(user: StoredUser) {
  const { passwordHash, isDemo, ...rest } = user
  return rest
}

function qrSlugLocal() {
  const alphabet = '23456789abcdefghjkmnpqrstuvwxyz'
  let out = ''
  for (let i = 0; i < 10; i += 1) out += alphabet[Math.floor(Math.random() * alphabet.length)]
  return out
}

function nextWateringDueLocal(type: CareType) {
  const date = new Date()
  date.setDate(date.getDate() + (type === 'water' ? 3 : 7))
  return date.toISOString()
}

export { localApi as api }

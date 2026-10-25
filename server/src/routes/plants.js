import { Router } from 'express'
import { getStore } from '../db/index.js'
import { newId, qrSlug } from '../lib/crypto.js'
import { canAccessPlant, canManagePlant, decorateWithPeople, isAdmin, userMap } from '../lib/access.js'
import {
  asyncHandler,
  badRequest,
  forbidden,
  notFound,
  nowIso,
  oneOf,
  requireFields,
} from '../lib/http.js'

export const plantsRouter = Router()

const STATUSES = ['healthy', 'needs_attention', 'critical', 'new']
const CARE_TYPES = ['water', 'fertilise', 'prune', 'inspect', 'photo', 'pest']

export function nextWateringDue(type) {
  const date = new Date()
  date.setDate(date.getDate() + (type === 'water' ? 3 : 7))
  return date.toISOString()
}

export async function enrichPlants(store, plants) {
  const people = await userMap(store)
  const logs = await store.list('careLogs')
  const byPlant = new Map()
  for (const log of logs) {
    const list = byPlant.get(log.plantId)
    if (list) list.push(log)
    else byPlant.set(log.plantId, [log])
  }
  return plants.map((plant) => {
    const plantLogs = (byPlant.get(plant.id) ?? []).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    return {
      ...decorateWithPeople(plant, people),
      careCount: plantLogs.length,
      lastCare: plantLogs[0]
        ? { type: plantLogs[0].type, note: plantLogs[0].note, createdAt: plantLogs[0].createdAt }
        : null,
    }
  })
}

plantsRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const store = await getStore()
    const { scope = 'mine', q = '', status } = req.query
    let plants = await store.list('plants')

    if (!isAdmin(req.user) || scope === 'mine') {
      plants = plants.filter(
        (plant) => plant.ownerId === req.user.id || plant.monitorId === req.user.id,
      )
    }
    if (scope === 'monitoring' && !isAdmin(req.user)) {
      plants = plants.filter((plant) => plant.monitorId === req.user.id)
    }
    if (scope === 'owned' && !isAdmin(req.user)) {
      plants = plants.filter((plant) => plant.ownerId === req.user.id)
    }
    if (status) plants = plants.filter((plant) => plant.status === status)
    if (q) {
      const needle = String(q).toLowerCase()
      plants = plants.filter((plant) =>
        [plant.name, plant.species, plant.localName].join(' ').toLowerCase().includes(needle),
      )
    }

    plants.sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)))
    res.json({ plants: await enrichPlants(store, plants) })
  }),
)

plantsRouter.post(
  '/',
  asyncHandler(async (req, res) => {
    requireFields(req.body, ['name', 'species', 'lat', 'lng'])
    const store = await getStore()

    const lat = Number(req.body.lat)
    const lng = Number(req.body.lng)
    if (!(lat >= -90 && lat <= 90) || !(lng >= -180 && lng <= 180)) {
      throw badRequest('Location is outside valid coordinates')
    }

    const plant = {
      id: newId(),
      name: String(req.body.name).trim(),
      species: String(req.body.species).trim(),
      localName: req.body.localName ? String(req.body.localName).trim() : null,
      ownerId: req.user.id,
      monitorId: req.body.monitorId ?? null,
      status: oneOf(req.body.status ?? 'new', STATUSES, 'status'),
      health: Number(req.body.health ?? 100),
      plantedOn: req.body.plantedOn || new Date().toISOString().slice(0, 10),
      lat,
      lng,
      areaSqm: req.body.areaSqm ? Number(req.body.areaSqm) : null,
      address: req.body.address ? String(req.body.address).trim() : null,
      photoUrl: req.body.photoUrl ?? null,
      notes: req.body.notes ? String(req.body.notes).trim() : null,
      qrToken: qrSlug(),
      lastWateredAt: null,
      nextWateringDue: nextWateringDue('water'),
      createdAt: nowIso(),
      updatedAt: nowIso(),
    }

    await store.insert('plants', plant)
    const [enriched] = await enrichPlants(store, [plant])
    res.status(201).json({ plant: enriched })
  }),
)

plantsRouter.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const store = await getStore()
    const plant = await store.get('plants', req.params.id)
    if (!plant) throw notFound('Plant not found')
    if (!canAccessPlant(plant, req.user)) throw forbidden()

    const [enriched] = await enrichPlants(store, [plant])
    const logs = await store.list('careLogs', { plantId: plant.id })
    logs.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    const people = await userMap(store)
    const careLogs = logs.map((log) => ({
      ...log,
      actorName: people.get(log.actorId)?.name ?? 'Haritavanam',
    }))

    const scans = await store.list('diseaseScans', { plantId: plant.id })
    scans.sort((a, b) => b.createdAt.localeCompare(a.createdAt))

    res.json({
      plant: enriched,
      careLogs,
      scans: scans.slice(0, 5),
      permissions: {
        canEdit: canManagePlant(plant, req.user),
        canLogCare: canAccessPlant(plant, req.user),
        isMonitor: plant.monitorId === req.user.id,
      },
    })
  }),
)

plantsRouter.patch(
  '/:id',
  asyncHandler(async (req, res) => {
    const store = await getStore()
    const plant = await store.get('plants', req.params.id)
    if (!plant) throw notFound('Plant not found')
    if (!canManagePlant(plant, req.user)) throw forbidden()

    const patch = { updatedAt: nowIso() }
    for (const key of ['name', 'species', 'localName', 'address', 'notes', 'photoUrl', 'plantedOn']) {
      if (key in req.body) patch[key] = req.body[key] ? String(req.body[key]).trim() : null
    }
    if (req.body.status !== undefined) patch.status = oneOf(req.body.status, STATUSES, 'status')
    if (req.body.health !== undefined) {
      const health = Number(req.body.health)
      if (!(health >= 0 && health <= 100)) throw badRequest('Health must be between 0 and 100')
      patch.health = health
    }
    if (req.body.lat !== undefined) patch.lat = Number(req.body.lat)
    if (req.body.lng !== undefined) patch.lng = Number(req.body.lng)
    if (req.body.monitorId !== undefined) {
      if (!isAdmin(req.user)) throw forbidden('Only an administrator can assign a monitor directly')
      patch.monitorId = req.body.monitorId
    }

    const updated = await store.update('plants', plant.id, patch)
    const [enriched] = await enrichPlants(store, [updated])
    res.json({ plant: enriched })
  }),
)

plantsRouter.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const store = await getStore()
    const plant = await store.get('plants', req.params.id)
    if (!plant) throw notFound('Plant not found')
    if (!isAdmin(req.user) && plant.ownerId !== req.user.id) throw forbidden()

    await store.remove('plants', plant.id)
    const logs = await store.list('careLogs', { plantId: plant.id })
    for (const log of logs) await store.remove('careLogs', log.id)
    res.json({ ok: true })
  }),
)

plantsRouter.get(
  '/:id/care-logs',
  asyncHandler(async (req, res) => {
    const store = await getStore()
    const plant = await store.get('plants', req.params.id)
    if (!plant) throw notFound('Plant not found')
    if (!canAccessPlant(plant, req.user)) throw forbidden()

    const logs = await store.list('careLogs', { plantId: plant.id })
    logs.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    const people = await userMap(store)
    res.json({
      careLogs: logs.map((log) => ({ ...log, actorName: people.get(log.actorId)?.name ?? 'Haritavanam' })),
    })
  }),
)

plantsRouter.post(
  '/:id/care-logs',
  asyncHandler(async (req, res) => {
    const store = await getStore()
    const plant = await store.get('plants', req.params.id)
    if (!plant) throw notFound('Plant not found')
    if (!canAccessPlant(plant, req.user)) throw forbidden()

    const type = oneOf(req.body?.type ?? 'water', CARE_TYPES, 'type')
    const log = {
      id: newId(),
      plantId: plant.id,
      type,
      note: req.body?.note ? String(req.body.note).trim() : null,
      actorId: req.user.id,
      createdAt: nowIso(),
    }
    await store.insert('careLogs', log)

    const patch = { updatedAt: nowIso() }
    if (type === 'water') {
      patch.lastWateredAt = log.createdAt
      patch.nextWateringDue = nextWateringDue('water')
    }
    await store.update('plants', plant.id, patch)

    res.status(201).json({ careLog: { ...log, actorName: req.user.name } })
  }),
)

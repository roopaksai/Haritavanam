import { Router } from 'express'
import { getStore } from '../db/index.js'
import { canAccessField, decorateWithPeople, isAdmin, userMap } from '../lib/access.js'
import { asyncHandler, badRequest, forbidden, notFound, nowIso, oneOf, requireFields } from '../lib/http.js'
import { newId } from '../lib/crypto.js'

export const fieldsRouter = Router()

const STATUSES = ['healthy', 'needs_attention', 'critical', 'new']

function parsePolygon(input) {
  if (!Array.isArray(input) || input.length < 3) {
    throw badRequest('A field needs at least three boundary points')
  }
  return input.map((point) => {
    const lat = Number(Array.isArray(point) ? point[0] : point?.lat)
    const lng = Number(Array.isArray(point) ? point[1] : point?.lng)
    if (!(lat >= -90 && lat <= 90) || !(lng >= -180 && lng <= 180)) {
      throw badRequest('Boundary point is outside valid coordinates')
    }
    return [lat, lng]
  })
}

const centreOf = (polygon) => {
  const lat = polygon.reduce((sum, point) => sum + point[0], 0) / polygon.length
  const lng = polygon.reduce((sum, point) => sum + point[1], 0) / polygon.length
  return { centerLat: Number(lat.toFixed(6)), centerLng: Number(lng.toFixed(6)) }
}

fieldsRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const store = await getStore()
    let fields = await store.list('fields')
    if (!isAdmin(req.user)) {
      fields = fields.filter(
        (field) => field.ownerId === req.user.id || field.monitorId === req.user.id,
      )
    }
    const people = await userMap(store)
    res.json({ fields: fields.map((field) => decorateWithPeople(field, people)) })
  }),
)

fieldsRouter.post(
  '/',
  asyncHandler(async (req, res) => {
    requireFields(req.body, ['name', 'polygon'])
    const store = await getStore()
    const polygon = parsePolygon(req.body.polygon)

    const field = {
      id: newId(),
      name: String(req.body.name).trim(),
      crop: req.body.crop ? String(req.body.crop).trim() : null,
      ownerId: req.user.id,
      monitorId: null,
      status: oneOf(req.body.status ?? 'new', STATUSES, 'status'),
      areaSqm: req.body.areaSqm ? Number(req.body.areaSqm) : null,
      polygon,
      ...centreOf(polygon),
      plantedOn: req.body.plantedOn || new Date().toISOString().slice(0, 10),
      photoUrl: req.body.photoUrl ?? null,
      notes: req.body.notes ? String(req.body.notes).trim() : null,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    }
    await store.insert('fields', field)
    const people = await userMap(store)
    res.status(201).json({ field: decorateWithPeople(field, people) })
  }),
)

fieldsRouter.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const store = await getStore()
    const field = await store.get('fields', req.params.id)
    if (!field) throw notFound('Field not found')
    if (!canAccessField(field, req.user)) throw forbidden()
    const people = await userMap(store)
    res.json({ field: decorateWithPeople(field, people) })
  }),
)

fieldsRouter.patch(
  '/:id',
  asyncHandler(async (req, res) => {
    const store = await getStore()
    const field = await store.get('fields', req.params.id)
    if (!field) throw notFound('Field not found')
    if (!isAdmin(req.user) && field.ownerId !== req.user.id) throw forbidden()

    const patch = { updatedAt: nowIso() }
    for (const key of ['name', 'crop', 'notes', 'photoUrl', 'plantedOn']) {
      if (key in req.body) patch[key] = req.body[key] ? String(req.body[key]).trim() : null
    }
    if (req.body.polygon !== undefined) {
      patch.polygon = parsePolygon(req.body.polygon)
      Object.assign(patch, centreOf(patch.polygon))
    }
    if (req.body.status !== undefined) patch.status = oneOf(req.body.status, STATUSES, 'status')

    const updated = await store.update('fields', field.id, patch)
    const people = await userMap(store)
    res.json({ field: decorateWithPeople(updated, people) })
  }),
)

fieldsRouter.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const store = await getStore()
    const field = await store.get('fields', req.params.id)
    if (!field) throw notFound('Field not found')
    if (!isAdmin(req.user) && field.ownerId !== req.user.id) throw forbidden()
    await store.remove('fields', field.id)
    res.json({ ok: true })
  }),
)

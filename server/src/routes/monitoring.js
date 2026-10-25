import { Router } from 'express'
import { getStore } from '../db/index.js'
import { isAdmin, userMap } from '../lib/access.js'
import { asyncHandler, badRequest, conflict, forbidden, notFound, nowIso, oneOf, requireFields } from '../lib/http.js'
import { newId } from '../lib/crypto.js'

export const monitoringRouter = Router()

const TARGETS = ['plant', 'field']

async function loadTarget(store, targetType, targetId) {
  const collection = targetType === 'plant' ? 'plants' : 'fields'
  const target = await store.get(collection, targetId)
  if (!target) throw notFound(`${targetType === 'plant' ? 'Plant' : 'Field'} not found`)
  return target
}

monitoringRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const store = await getStore()
    let requests = await store.list('monitoringRequests')

    if (!isAdmin(req.user)) {
      requests = requests.filter(
        (request) => request.ownerId === req.user.id || request.requesterId === req.user.id,
      )
    }
    requests.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    const people = await userMap(store)
    res.json({
      requests: requests.map((request) => ({
        ...request,
        requesterName: people.get(request.requesterId)?.name ?? 'Unknown',
        ownerName: people.get(request.ownerId)?.name ?? 'Unknown',
        suggestedByName: people.get(request.suggestedBy)?.name ?? null,
      })),
    })
  }),
)

monitoringRouter.post(
  '/',
  asyncHandler(async (req, res) => {
    requireFields(req.body, ['targetType', 'targetId'])
    const targetType = oneOf(req.body.targetType, TARGETS, 'targetType')
    const store = await getStore()
    const target = await loadTarget(store, targetType, req.body.targetId)

    const ownerId = target.ownerId
    const actorIsOwner = req.user.id === ownerId
    const actorIsAdmin = isAdmin(req.user)

    let requesterId = req.user.id
    let suggestedBy = null

    if (actorIsOwner || actorIsAdmin) {
      // Only an owner/admin nominates a candidate; the candidate never gains access until approved.
      if (!req.body.requesterId) throw badRequest('Choose the person you want to nominate')
      requesterId = String(req.body.requesterId)
      suggestedBy = req.user.id
    } else if (target.monitorId === req.user.id) {
      throw conflict('You already monitor this record')
    }

    if (requesterId === ownerId) throw badRequest('The owner already carries this record')
    if (target.monitorId) throw conflict('This record already has an active monitor')

    const requester = await store.get('users', requesterId)
    if (!requester) throw badRequest('The nominated person does not exist')

    const duplicate = await store.findOne('monitoringRequests', {
      targetType,
      targetId: target.id,
      requesterId,
      status: 'pending',
    })
    if (duplicate) throw conflict('A request for this person is already pending')

    const request = {
      id: newId(),
      targetType,
      targetId: target.id,
      targetName: target.name,
      requesterId,
      ownerId,
      suggestedBy,
      status: 'pending',
      note: req.body.note ? String(req.body.note).trim() : null,
      adminNote: null,
      decidedBy: null,
      decidedAt: null,
      createdAt: nowIso(),
    }
    await store.insert('monitoringRequests', request)

    const people = await userMap(store)
    res.status(201).json({
      request: {
        ...request,
        requesterName: people.get(requesterId)?.name ?? 'Unknown',
        ownerName: people.get(ownerId)?.name ?? 'Unknown',
        suggestedByName: suggestedBy ? people.get(suggestedBy)?.name : null,
      },
    })
  }),
)

monitoringRouter.post(
  '/:id/decision',
  asyncHandler(async (req, res) => {
    if (!isAdmin(req.user)) throw forbidden('Only an administrator can approve a monitoring request')
    const decision = oneOf(req.body?.status, ['approved', 'rejected'], 'status')
    const store = await getStore()

    const request = await store.get('monitoringRequests', req.params.id)
    if (!request) throw notFound('Request not found')
    if (request.status !== 'pending') throw conflict('This request has already been decided')

    if (decision === 'approved') {
      const collection = request.targetType === 'plant' ? 'plants' : 'fields'
      const target = await store.get(collection, request.targetId)
      if (!target) throw notFound('The record no longer exists')
      if (target.monitorId && target.monitorId !== request.requesterId) {
        throw conflict('This record already has an active monitor')
      }
      await store.update(collection, target.id, {
        monitorId: request.requesterId,
        updatedAt: nowIso(),
      })
    }

    const updated = await store.update('monitoringRequests', request.id, {
      status: decision,
      adminNote: req.body?.note ? String(req.body.note).trim() : null,
      decidedBy: req.user.id,
      decidedAt: nowIso(),
    })

    const people = await userMap(store)
    res.json({
      request: {
        ...updated,
        requesterName: people.get(updated.requesterId)?.name ?? 'Unknown',
        ownerName: people.get(updated.ownerId)?.name ?? 'Unknown',
        suggestedByName: updated.suggestedBy ? people.get(updated.suggestedBy)?.name : null,
      },
    })
  }),
)

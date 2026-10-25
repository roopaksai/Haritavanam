import { Router } from 'express'
import { getStore } from '../db/index.js'
import { asyncHandler, notFound, nowIso } from '../lib/http.js'

export const publicRouter = Router()

/**
 * Unauthenticated QR view.
 * Deliberately narrow: no personal data, no coordinates, and never field polygons.
 */
publicRouter.get(
  '/plants/:token',
  asyncHandler(async (req, res) => {
    const store = await getStore()
    const plant = await store.findOne('plants', { qrToken: req.params.token })
    if (!plant) throw notFound('This label is not linked to a plant')

    const owner = await store.get('users', plant.ownerId)
    const logs = await store.list('careLogs', { plantId: plant.id })
    logs.sort((a, b) => b.createdAt.localeCompare(a.createdAt))

    await store.update('plants', plant.id, {
      scanCount: Number(plant.scanCount ?? 0) + 1,
      lastScannedAt: nowIso(),
    })

    res.json({
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
      // Field boundaries are intentionally withheld from public scans.
    })
  }),
)

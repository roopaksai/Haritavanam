import { Router } from 'express'
import { config } from '../config.js'
import { getStore } from '../db/index.js'
import { canAccessPlant } from '../lib/access.js'
import { asyncHandler, badRequest, forbidden, notFound, nowIso, requireFields } from '../lib/http.js'
import { newId } from '../lib/crypto.js'

export const diseaseRouter = Router()

const CONDITIONS = [
  {
    name: 'Neem leaf spot (Pseudocercospora)',
    advice: 'Remove the affected leaves and avoid overhead watering for two weeks.',
    severity: 'moderate',
  },
  {
    name: 'Powdery mildew',
    advice: 'Improve airflow around the canopy and apply a sulphur-based spray in the early morning.',
    severity: 'low',
  },
  {
    name: 'Nutrient deficiency (nitrogen)',
    advice: 'Apply well-rotted compost at the drip line and re-check new growth in 14 days.',
    severity: 'low',
  },
  {
    name: 'Possibly healthy foliage',
    advice: 'No clear lesion pattern. Keep monitoring weekly and log any change with a photo.',
    severity: 'none',
  },
  {
    name: 'Bark canker (early stage)',
    advice: 'Do not prune around the wound. Ask an arborist to inspect within a week.',
    severity: 'high',
  },
]

/** Deterministic pseudo-random selection so the demo is stable per plant. */
function pick(seed, length) {
  let hash = 0
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) % 100000
  }
  return hash % length
}

diseaseRouter.post(
  '/analyze',
  asyncHandler(async (req, res) => {
    requireFields(req.body, ['plantId'])
    const store = await getStore()
    const plant = await store.get('plants', req.body.plantId)
    if (!plant) throw notFound('Plant not found')
    if (!canAccessPlant(plant, req.user)) throw forbidden()
    if (!req.body.imageUrl && !req.body.symptomText) {
      throw badRequest('Attach a photo or describe the symptom')
    }

    const seed = `${plant.id}:${req.body.imageUrl ?? ''}:${req.body.symptomText ?? ''}`
    const primary = CONDITIONS[pick(seed, CONDITIONS.length)]
    const secondary = CONDITIONS[(pick(seed, CONDITIONS.length) + 2) % CONDITIONS.length]
    const confidence = 0.62 + (pick(seed, 24) / 100)

    const results = [
      { name: primary.name, confidence: Number(confidence.toFixed(2)), severity: primary.severity, advice: primary.advice },
      {
        name: secondary.name,
        confidence: Number((confidence - 0.21).toFixed(2)),
        severity: secondary.severity,
        advice: secondary.advice,
      },
    ]

    const scan = {
      id: newId(),
      plantId: plant.id,
      userId: req.user.id,
      imageUrl: req.body.imageUrl ?? null,
      symptomText: req.body.symptomText ?? null,
      provider: config.diseaseApiKey ? 'pending-provider' : 'mock',
      results,
      createdAt: nowIso(),
    }
    await store.insert('diseaseScans', scan)

    res.json({
      scan,
      // The UI reads these flags to show an honest "simulated" badge and a place to plug a key in.
      providerConfigured: Boolean(config.diseaseApiKey),
      providerNote: config.diseaseApiKey
        ? 'A provider key is configured. Replace the mock analyser in server/src/routes/disease.js with the provider call.'
        : 'Simulated result for the demo. Add PLANT_ID_API_KEY to server/.env to enable a live provider.',
      disclaimer:
        'Possible matches, not a diagnosis. Confirm with a qualified arborist before treating a tree.',
    })
  }),
)

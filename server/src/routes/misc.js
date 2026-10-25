import fs from 'node:fs'
import path from 'node:path'
import { Router } from 'express'
import multer from 'multer'
import { config } from '../config.js'
import { getStore } from '../db/index.js'
import { isAdmin } from '../lib/access.js'
import { asyncHandler, badRequest, nowIso, requireFields } from '../lib/http.js'
import { newId } from '../lib/crypto.js'

export const miscRouter = Router()

fs.mkdirSync(config.uploadDir, { recursive: true })

const storage = multer.diskStorage({
  destination: (_req, _file, done) => done(null, config.uploadDir),
  filename: (_req, file, done) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg'
    done(null, `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 6 * 1024 * 1024 },
  fileFilter: (_req, file, done) => {
    if (!file.mimetype.startsWith('image/')) return done(new Error('Only image files can be uploaded'))
    done(null, true)
  },
})

miscRouter.post('/uploads', upload.single('file'), (req, res) => {
  if (!req.file) throw badRequest('No file received')
  res.status(201).json({ url: `/uploads/${req.file.filename}`, size: req.file.size })
})

miscRouter.get(
  '/stats',
  asyncHandler(async (req, res) => {
    const store = await getStore()
    const plants = await store.list('plants')
    const fields = await store.list('fields')
    const logs = await store.list('careLogs')
    const tickets = await store.list('tickets')
    const requests = await store.list('monitoringRequests')

    const mine = isAdmin(req.user)
      ? plants
      : plants.filter((plant) => plant.ownerId === req.user.id || plant.monitorId === req.user.id)
    const myFields = isAdmin(req.user)
      ? fields
      : fields.filter((field) => field.ownerId === req.user.id || field.monitorId === req.user.id)
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

    const openTickets = isAdmin(req.user)
      ? tickets.filter((ticket) => ticket.status !== 'resolved').length
      : tickets.filter((ticket) => ticket.userId === req.user.id && ticket.status !== 'resolved').length

    const pendingRequests = isAdmin(req.user)
      ? requests.filter((request) => request.status === 'pending').length
      : requests.filter((request) => request.status === 'pending' && request.ownerId === req.user.id).length

    const monitors = await store.count('users', { role: 'monitor' })

    res.json({
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
    })
  }),
)

miscRouter.post(
  '/feedback',
  asyncHandler(async (req, res) => {
    requireFields(req.body, ['message'])
    const rating = Number(req.body.rating ?? 0)
    if (!(rating >= 1 && rating <= 5)) throw badRequest('Rating must be between 1 and 5')
    const store = await getStore()
    await store.insert('feedback', {
      id: newId(),
      userId: req.user.id,
      rating,
      message: String(req.body.message).trim(),
      createdAt: nowIso(),
    })
    res.status(201).json({ ok: true })
  }),
)

miscRouter.get(
  '/people',
  asyncHandler(async (req, res) => {
    const store = await getStore()
    const users = await store.list('users')
    res.json({
      people: users.map((user) => ({
        id: user.id,
        name: user.name,
        role: user.role,
        email: user.email,
        avatarColor: user.avatarColor,
        headline: user.headline,
      })),
    })
  }),
)

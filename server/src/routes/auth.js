import { Router } from 'express'
import { config } from '../config.js'
import { getStore } from '../db/index.js'
import { newId, newToken, verifyPassword } from '../lib/crypto.js'
import { asyncHandler, badRequest, unauthorized } from '../lib/http.js'
import { sanitizeUser, sessionCookie } from '../middleware/auth.js'

export const authRouter = Router()

authRouter.get(
  '/demo-accounts',
  asyncHandler(async (_req, res) => {
    const store = await getStore()
    const users = await store.list('users', { isDemo: true })
    const accounts = users
      .sort((a, b) => ['admin', 'owner', 'monitor'].indexOf(a.role) - ['admin', 'owner', 'monitor'].indexOf(b.role))
      .map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        headline: user.headline,
        avatarColor: user.avatarColor,
      }))
    res.json({ accounts, password: config.demoPassword })
  }),
)

authRouter.post(
  '/login',
  asyncHandler(async (req, res) => {
    const email = String(req.body?.email || '').trim().toLowerCase()
    const password = String(req.body?.password || '')
    if (!email || !password) throw badRequest('Email and password are required')

    const store = await getStore()
    const user = await store.findOne('users', { email })
    if (!user || !verifyPassword(password, user.passwordHash)) {
      throw unauthorized('Email or password is incorrect')
    }

    const session = {
      id: newId(),
      token: newToken(),
      userId: user.id,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + config.sessionDays * 86400000).toISOString(),
    }
    await store.insert('sessions', session)
    res.cookie(config.cookieName, session.token, sessionCookie())
    res.json({ user: sanitizeUser(user) })
  }),
)

authRouter.post(
  '/logout',
  asyncHandler(async (req, res) => {
    const token = req.cookies?.[config.cookieName]
    if (token) {
      const store = await getStore()
      const session = await store.findOne('sessions', { token })
      if (session) await store.remove('sessions', session.id)
    }
    res.clearCookie(config.cookieName, { path: '/' })
    res.json({ ok: true })
  }),
)

authRouter.get(
  '/me',
  asyncHandler(async (req, res) => {
    res.json({ user: req.user ?? null })
  }),
)

authRouter.patch(
  '/me',
  asyncHandler(async (req, res) => {
    if (!req.user) throw unauthorized()
    const patch = {}
    for (const key of ['name', 'phone', 'headline']) {
      if (typeof req.body?.[key] === 'string') patch[key] = req.body[key].trim()
    }
    if (patch.name === '') throw badRequest('Name cannot be empty')

    const store = await getStore()
    const updated = await store.update('users', req.user.id, patch)
    res.json({ user: sanitizeUser(updated) })
  }),
)

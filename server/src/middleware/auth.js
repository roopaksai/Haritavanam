import { config } from '../config.js'
import { getStore } from '../db/index.js'
import { forbidden, unauthorized } from '../lib/http.js'

export function sanitizeUser(user) {
  if (!user) return null
  const { passwordHash, ...safe } = user
  return safe
}

/** Reads the session cookie and attaches a sanitized user when valid. */
export async function attachUser(req, _res, next) {
  try {
    const token = req.cookies?.[config.cookieName]
    if (!token) return next()

    const store = await getStore()
    const session = await store.findOne('sessions', { token })
    if (!session) return next()

    if (new Date(session.expiresAt).getTime() < Date.now()) {
      await store.remove('sessions', session.id)
      return next()
    }

    const user = await store.get('users', session.userId)
    if (user) req.user = sanitizeUser(user)
    next()
  } catch (error) {
    next(error)
  }
}

export function requireAuth(req, _res, next) {
  if (!req.user) return next(unauthorized())
  next()
}

export function requireRole(...roles) {
  return (req, _res, next) => {
    if (!req.user) return next(unauthorized())
    if (!roles.includes(req.user.role)) return next(forbidden('This action needs a different role'))
    next()
  }
}

export const sessionCookie = () => ({
  httpOnly: true,
  sameSite: 'lax',
  secure: config.env === 'production',
  path: '/',
  maxAge: config.sessionDays * 24 * 60 * 60 * 1000,
})

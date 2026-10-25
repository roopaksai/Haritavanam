import crypto from 'node:crypto'

/** scrypt password hashing — no native modules, no external service. */
export function hashPassword(plain) {
  const salt = crypto.randomBytes(16).toString('hex')
  const derived = crypto.scryptSync(plain, salt, 64).toString('hex')
  return `scrypt$${salt}$${derived}`
}

export function verifyPassword(plain, stored) {
  const [scheme, salt, digest] = String(stored || '').split('$')
  if (scheme !== 'scrypt' || !salt || !digest) return false
  const expected = Buffer.from(digest, 'hex')
  const actual = crypto.scryptSync(plain, salt, 64)
  return expected.length === actual.length && crypto.timingSafeEqual(expected, actual)
}

export const newId = () => crypto.randomUUID()
export const newToken = (bytes = 32) => crypto.randomBytes(bytes).toString('hex')

/** Short, human-readable code used for QR slugs. */
export function qrSlug() {
  const alphabet = '23456789abcdefghjkmnpqrstuvwxyz'
  let out = ''
  const bytes = crypto.randomBytes(10)
  for (const byte of bytes) out += alphabet[byte % alphabet.length]
  return out
}

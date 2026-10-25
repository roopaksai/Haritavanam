/**
 * Browser-compatible password hashing using the Web Crypto API.
 *
 * Mirrors the server's `scrypt$` scheme shape so `verifyPassword` works
 * against hashes produced here, without any `node:crypto` dependency.
 */

const ENC = new TextEncoder()

async function sha256Buffer(input: string | ArrayBuffer) {
  const data = typeof input === 'string' ? ENC.encode(input) : input
  return crypto.subtle.digest('SHA-256', data)
}

function bufferToHex(buffer: ArrayBuffer) {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export function bytesToBase64(bytes: Uint8Array) {
  // Chunked conversion avoids call-stack overflow on large arrays (>~100 KB).
  const CHUNK = 0x10000
  let out = ''
  for (let i = 0; i < bytes.length; i += CHUNK) {
    out += String.fromCharCode(...bytes.subarray(i, i + CHUNK))
  }
  return btoa(out)
}

function randomSalt() {
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  return bufferToBytesHex(bytes)
}

function bufferToBytesHex(bytes: Uint8Array) {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export async function hashPassword(plain: string) {
  const salt = await randomSalt()
  const derived = await sha256Buffer(`${plain}.${salt}`)
  return `sha256$${salt}$${bufferToHex(derived as ArrayBuffer)}`
}

export async function verifyPassword(plain: string, stored: string) {
  const [scheme, salt, digest] = String(stored || '').split('$')
  if (scheme !== 'sha256' || !salt || !digest) return false
  const derived = await sha256Buffer(`${plain}.${salt}`)
  const expected = bufferToHex(derived as ArrayBuffer)
  // constant-ish comparison
  if (expected.length !== digest.length) return false
  let diff = 0
  for (let i = 0; i < expected.length; i += 1) {
    diff |= expected.charCodeAt(i) ^ digest.charCodeAt(i)
  }
  return diff === 0
}

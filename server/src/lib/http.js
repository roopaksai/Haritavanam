export class ApiError extends Error {
  constructor(status, message, code = 'error', details = undefined) {
    super(message)
    this.status = status
    this.code = code
    this.details = details
  }
}

export const badRequest = (message, details) => new ApiError(400, message, 'bad_request', details)
export const unauthorized = (message = 'Sign in required') => new ApiError(401, message, 'unauthorized')
export const forbidden = (message = 'You do not have access to this record') =>
  new ApiError(403, message, 'forbidden')
export const notFound = (message = 'Not found') => new ApiError(404, message, 'not_found')
export const conflict = (message) => new ApiError(409, message, 'conflict')

/** Express 4 does not forward rejected promises — wrap every async handler. */
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next)

export function requireFields(body, fields) {
  const missing = fields.filter((field) => {
    const value = body?.[field]
    return value === undefined || value === null || (typeof value === 'string' && !value.trim())
  })
  if (missing.length) throw badRequest(`Missing required field(s): ${missing.join(', ')}`, { missing })
}

export function numberInRange(value, min, max, label) {
  const number = Number(value)
  if (!Number.isFinite(number) || number < min || number > max) {
    throw badRequest(`${label} must be a number between ${min} and ${max}`)
  }
  return number
}

export function oneOf(value, allowed, label) {
  if (!allowed.includes(value)) {
    throw badRequest(`${label} must be one of: ${allowed.join(', ')}`)
  }
  return value
}

export const nowIso = () => new Date().toISOString()

import { ApiError } from '../lib/http.js'

export function notFoundHandler(_req, res) {
  res.status(404).json({ error: { message: 'Endpoint not found', code: 'not_found' } })
}

export function errorHandler(error, _req, res, _next) {
  if (error instanceof ApiError) {
    return res.status(error.status).json({
      error: { message: error.message, code: error.code, details: error.details },
    })
  }
  if (error?.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ error: { message: 'Image is larger than 6 MB', code: 'too_large' } })
  }
  if (error?.code === 'ER_DUP_ENTRY' || error?.code === 11000) {
    return res.status(409).json({ error: { message: 'That record already exists', code: 'conflict' } })
  }
  console.error('[error]', error)
  res.status(500).json({ error: { message: 'Something went wrong on the server', code: 'server_error' } })
}

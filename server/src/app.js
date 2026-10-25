import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { config } from './config.js'
import { attachUser, requireAuth } from './middleware/auth.js'
import { errorHandler, notFoundHandler } from './middleware/error.js'
import { authRouter } from './routes/auth.js'
import { plantsRouter } from './routes/plants.js'
import { fieldsRouter } from './routes/fields.js'
import { monitoringRouter } from './routes/monitoring.js'
import { ticketsRouter } from './routes/tickets.js'
import { publicRouter } from './routes/public.js'
import { diseaseRouter } from './routes/disease.js'
import { miscRouter } from './routes/misc.js'

export function createApp() {
  const app = express()
  app.disable('x-powered-by')
  app.set('trust proxy', 1)

  app.use(
    cors({
      origin: [config.appOrigin, 'http://localhost:5173', 'http://127.0.0.1:5173'],
      credentials: true,
    }),
  )
  app.use(express.json({ limit: '200kb' }))
  app.use(cookieParser())
  app.use('/uploads', express.static(config.uploadDir, { maxAge: '7d', index: false }))
  app.use(attachUser)

  app.get('/api/health', (_req, res) => {
    res.json({
      ok: true,
      storage: config.mongoUri ? 'mongodb' : 'json',
      diseaseProvider: config.diseaseApiKey ? 'configured' : 'mock',
      time: new Date().toISOString(),
    })
  })

  // Public QR lookups must be mounted before the authenticated /api catch-all.
  app.use('/api/public', publicRouter)
  app.use('/api/auth', authRouter)
  app.use('/api/plants', requireAuth, plantsRouter)
  app.use('/api/fields', requireAuth, fieldsRouter)
  app.use('/api/monitoring-requests', requireAuth, monitoringRouter)
  app.use('/api/tickets', requireAuth, ticketsRouter)
  app.use('/api/disease', requireAuth, diseaseRouter)
  app.use('/api', requireAuth, miscRouter)

  app.use(notFoundHandler)
  app.use(errorHandler)

  return app
}

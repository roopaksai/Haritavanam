import { createApp } from './app.js'
import { config } from './config.js'
import { getStore } from './db/index.js'
import { seedDatabase } from './db/seed.js'

const store = await getStore()
await seedDatabase(store)

const app = createApp()
const server = app.listen(config.port, () => {
  console.log(`[api] Haritavanam API listening on http://localhost:${config.port}`)
  console.log(`[api] storage: ${config.mongoUri ? 'MongoDB' : 'local JSON file'}`)
  console.log(`[api] disease analysis: ${config.diseaseApiKey ? 'provider key found' : 'mock mode'}`)
})

const shutdown = (signal) => {
  console.log(`[api] ${signal} received, closing`)
  server.close(() => process.exit(0))
}
process.on('SIGINT', () => shutdown('SIGINT'))
process.on('SIGTERM', () => shutdown('SIGTERM'))

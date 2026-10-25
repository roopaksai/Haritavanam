import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
export const ROOT = path.resolve(here, '..')

// Minimal .env loader — avoids a dependency and works on every Node version.
const envPath = path.join(ROOT, '.env')
if (fs.existsSync(envPath)) {
  for (const raw of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const line = raw.trim()
    if (!line || line.startsWith('#')) continue
    const match = line.match(/^([A-Za-z0-9_]+)\s*=\s*(.*)$/)
    if (!match) continue
    const [, key, value] = match
    if (process.env[key] === undefined) {
      process.env[key] = value.replace(/^["']|["']$/g, '')
    }
  }
}

export const config = {
  port: Number(process.env.PORT || 4000),
  env: process.env.NODE_ENV || 'development',
  appOrigin: process.env.APP_ORIGIN || 'http://localhost:5173',
  mongoUri: (process.env.MONGODB_URI || '').trim(),
  mongoDb: process.env.MONGODB_DB || 'haritavanam',
  dataDir: path.join(ROOT, 'data'),
  uploadDir: path.join(ROOT, 'uploads'),
  cookieName: 'hv_session',
  sessionDays: 7,
  diseaseApiKey: process.env.PLANT_ID_API_KEY || '',
  demoPassword: 'Haritavanam@123',
}

export const isProduction = config.env === 'production'

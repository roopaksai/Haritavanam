import path from 'node:path'
import { config } from '../config.js'
import { JsonStore } from './jsonStore.js'

let storePromise = null

export function getStore() {
  if (!storePromise) storePromise = createStore()
  return storePromise
}

async function createStore() {
  if (config.mongoUri) {
    const { MongoStore } = await import('./mongoStore.js')
    const store = new MongoStore(config.mongoUri, config.mongoDb)
    await store.init()
    console.log('[db] connected to MongoDB')
    return store
  }
  const store = new JsonStore(path.join(config.dataDir, 'db.json'))
  await store.init()
  console.log('[db] local JSON store at server/data/db.json (set MONGODB_URI to use MongoDB)')
  return store
}

export const COLLECTIONS = [
  'users',
  'sessions',
  'plants',
  'fields',
  'careLogs',
  'monitoringRequests',
  'tickets',
  'feedback',
  'diseaseScans',
]

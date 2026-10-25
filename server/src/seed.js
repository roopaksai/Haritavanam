import { getStore } from './db/index.js'
import { seedDatabase } from './db/seed.js'

const reset = process.argv.includes('--reset')

const store = await getStore()
const result = await seedDatabase(store, { reset })
console.log(result.seeded ? '[seed] done' : '[seed] nothing to do (use --reset to rebuild)')
process.exit(0)

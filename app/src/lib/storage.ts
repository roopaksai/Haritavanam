import Dexie, { type Table } from 'dexie'
import { hashPassword, verifyPassword } from './crypto-compat'
import type {
  CareLog,
  DemoAccount,
  DiseaseScan,
  Field,
  Feedback,
  MonitoringRequest,
  Plant,
  Ticket,
  User,
} from './types'

/**
 * Stored user shape extends the public `User` type with credential fields that
 * never leave the local database.
 */
export interface StoredUser extends User {
  passwordHash: string
  isDemo: boolean
  createdAt: string
}

/**
 * Haritavanam local-first database (IndexedDB via Dexie).
 *
 * Used when `VITE_API_URL` is not set — i.e. the frontend runs standalone
 * (e.g. on Vercel) with no backend. Every page calls the same `api.*`
 * functions, which delegate here instead of hitting the network.
 *
 * Collections mirror the server store so a future MongoDB backend is a
 * drop-in replacement: only `api.ts` needs to switch transport.
 */

const DB_NAME = 'HaritavanamDB'
const DB_VERSION = 1

const CAMPUS = { lat: 13.2886216, lng: 77.5974282 }
const DEMO_PASSWORD = 'Haritavanam@123'

const PHOTOS = [
  'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=1000&q=70',
  'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=1000&q=70',
  'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1000&q=70',
  'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=1000&q=70',
  'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1000&q=70',
  'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=1000&q=70',
]

const iso = (daysAgo: number, hour = 9) => {
  const date = new Date()
  date.setDate(date.getDate() - daysAgo)
  date.setHours(hour, 0, 0, 0)
  return date.toISOString()
}

const daysFromNow = (days: number, hour = 7) => {
  const date = new Date()
  date.setDate(date.getDate() + days)
  date.setHours(hour, 0, 0, 0)
  return date.toISOString()
}

function qrSlug() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let out = ''
  for (let i = 0; i < 10; i += 1) out += chars[Math.floor(Math.random() * chars.length)]
  return out
}

function newId() {
  return `loc_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`
}

function nowIso() {
  return new Date().toISOString()
}

export { nowIso }

export class HaritavanamDB extends Dexie {
  users!: Table<StoredUser, string>
  sessions!: Table<{ id: string; token: string; userId: string; createdAt: string; expiresAt: string }, string>
  plants!: Table<Plant, string>
  fields!: Table<Field, string>
  careLogs!: Table<CareLog, string>
  monitoringRequests!: Table<MonitoringRequest, string>
  tickets!: Table<Ticket, string>
  feedback!: Table<Feedback, string>
  diseaseScans!: Table<DiseaseScan, string>
  uploads!: Table<{ id: string; url: string; size: number; createdAt: string }, string>

  constructor() {
    super(DB_NAME)
    this.version(DB_VERSION).stores({
      users: 'id, email, role',
      sessions: 'id, token, userId, expiresAt',
      plants: 'id, ownerId, monitorId, status, qrToken, updatedAt',
      fields: 'id, ownerId, monitorId, status, updatedAt',
      careLogs: 'id, plantId, createdAt',
      monitoringRequests: 'id, targetType, targetId, requesterId, ownerId, status, createdAt',
      tickets: 'id, userId, status, plantId, createdAt, updatedAt',
      feedback: 'id, userId, createdAt',
      diseaseScans: 'id, plantId, createdAt',
      uploads: 'id, createdAt',
    })
  }
}

/* ---------------------------------------------------------------- in-memory fallback */

/**
 * Minimal in-memory table that mirrors the Dexie Table methods used by
 * localApi. Used when IndexedDB is unavailable (private mode, quota,
 * Safari restrictions, etc.) so the app never crashes.
 */
class InMemoryTable<T extends { id: string }> {
  private data: Map<string, T>

  constructor() {
    this.data = new Map()
  }

  async add(doc: T) {
    this.data.set(doc.id, doc)
    return doc
  }

  async get(id: string) {
    return this.data.get(id) ?? undefined
  }

  async count() {
    return this.data.size
  }

  async toArray() {
    return Array.from(this.data.values())
  }

  async update(id: string, patch: Partial<T>) {
    const existing = this.data.get(id)
    if (!existing) return undefined
    const next = { ...existing, ...patch } as T
    this.data.set(id, next)
    return next
  }

  async delete(id: string) {
    return this.data.delete(id)
  }

  where() {
    return new InMemoryQuery(this.data)
  }
}

class InMemoryQuery<T extends { id: string }> {
  private data: Map<string, T>

  constructor(data: Map<string, T>) {
    this.data = data
  }

  equals(value: unknown) {
    return new InMemoryFiltered(this.data, (item) => {
      return Object.values(item).some((v) => v === value)
    })
  }

  async first() {
    const filtered = this._filtered()
    return filtered.length > 0 ? filtered[0] : undefined
  }

  async toArray() {
    return this._filtered()
  }

  filter(fn: (item: T) => boolean) {
    return new InMemoryFiltered(this.data, fn)
  }

  private _filtered() {
    return Array.from(this.data.values())
  }
}

class InMemoryFiltered<T extends { id: string }> {
  private data: Map<string, T>
  private fn: (item: T) => boolean

  constructor(data: Map<string, T>, fn: (item: T) => boolean) {
    this.data = data
    this.fn = fn
  }

  async first() {
    for (const item of this.data.values()) {
      if (this.fn(item)) return item
    }
    return undefined
  }

  async toArray() {
    const out: T[] = []
    for (const item of this.data.values()) {
      if (this.fn(item)) out.push(item)
    }
    return out
  }

  async delete() {
    const ids: string[] = []
    for (const [id, item] of this.data) {
      if (this.fn(item)) ids.push(id)
    }
    for (const id of ids) this.data.delete(id)
    return ids.length
  }
}

interface InMemoryDB {
  users: InMemoryTable<StoredUser>
  sessions: InMemoryTable<{ id: string; token: string; userId: string; createdAt: string; expiresAt: string }>
  plants: InMemoryTable<Plant>
  fields: InMemoryTable<Field>
  careLogs: InMemoryTable<CareLog>
  monitoringRequests: InMemoryTable<MonitoringRequest>
  tickets: InMemoryTable<Ticket>
  feedback: InMemoryTable<Feedback>
  diseaseScans: InMemoryTable<DiseaseScan>
  uploads: InMemoryTable<{ id: string; url: string; size: number; createdAt: string }>
}

function makeInMemoryDB(): InMemoryDB {
  return {
    users: new InMemoryTable(),
    sessions: new InMemoryTable(),
    plants: new InMemoryTable(),
    fields: new InMemoryTable(),
    careLogs: new InMemoryTable(),
    monitoringRequests: new InMemoryTable(),
    tickets: new InMemoryTable(),
    feedback: new InMemoryTable(),
    diseaseScans: new InMemoryTable(),
    uploads: new InMemoryTable(),
  }
}

let dbImpl: any

try {
  dbImpl = new HaritavanamDB()
  // eslint-disable-next-line no-empty
} catch {
  dbImpl = makeInMemoryDB()
}

export const db = dbImpl as unknown as HaritavanamDB
export const dbIsMemory = !(dbImpl instanceof HaritavanamDB)

/* ---------------------------------------------------------------- seed data (plain, hashed at seed time) */

const plantSeeds: Array<[string, string, string, number, number, number, number, number]> = [
  ['Neem Grove 01', 'Azadirachta indica', 'Neem', 92, 0.0012, 0.0009, 3.2, 412],
  ['Rain Tree 04', 'Samanea saman', 'Mara', 74, 0.0021, -0.0014, 4.1, 388],
  ['Gulmohar 07', 'Delonix regia', 'Mayflower', 88, -0.0008, 0.0018, 2.4, 205],
  ['Peepal 02', 'Ficus religiosa', 'Ashwattha', 95, 0.0016, -0.0006, 3.7, 640],
  ['Honge 05', 'Pongamia pinnata', 'Honge', 61, -0.0022, 0.0004, 2.9, 289],
  ['Mango 09', 'Mangifera indica', 'Maavina mara', 90, 0.0004, -0.0021, 2.2, 156],
  ['Silver Oak 03', 'Grevillea robusta', 'Silver Oak', 48, 0.0028, 0.0011, 3.4, 233],
  ['Teak 06', 'Tectona grandis', 'Thega', 86, -0.0011, -0.0019, 3.0, 274],
  ['Jamun 08', 'Syzygium cumini', 'Nerale', 82, 0.0009, 0.0026, 2.6, 198],
  ['Copper Pod 10', 'Peltophorum pterocarpum', 'Copper Pod', 70, -0.0026, -0.0012, 3.8, 245],
  ['Banyan 11', 'Ficus benghalensis', 'Aala', 93, 0.0031, -0.0024, 4.6, 720],
  ['Bamboo Cluster 12', 'Bambusoideae', 'Bidiru', 97, 0.0019, 0.0022, 1.4, 54],
]

function buildUser(overrides: Partial<StoredUser> & { id: string; email: string; name: string; role: User['role'] }): StoredUser {
  return {
    phone: null,
    headline: null,
    avatarColor: '#3A5A40',
    isDemo: true,
    passwordHash: '',
    createdAt: nowIso(),
    ...overrides,
  } as StoredUser
}

const seedUserSpecs: Array<Partial<User> & { id: string; email: string; name: string; role: User['role'] }> = [
  {
    id: 'usr_admin',
    email: 'admin@haritavanam.test',
    name: 'Sai Roopak',
    role: 'admin',
    phone: '+91 98450 11223',
    headline: 'Campus greening programme',
    avatarColor: '#3A5A40',
  },
  {
    id: 'usr_owner',
    email: 'owner@haritavanam.test',
    name: 'Ananya Rao',
    role: 'owner',
    phone: '+91 98450 44556',
    headline: 'Planting since 2021',
    avatarColor: '#8C5A3C',
  },
  {
    id: 'usr_monitor',
    email: 'monitor@haritavanam.test',
    name: 'Vikram Menon',
    role: 'monitor',
    phone: '+91 98450 77889',
    headline: 'Weekend watering volunteer',
    avatarColor: '#4E6B52',
  },
  {
    id: 'usr_meera',
    email: 'meera@haritavanam.test',
    name: 'Meera Iyer',
    role: 'owner',
    phone: '+91 98450 99001',
    headline: 'Biodiversity student',
    avatarColor: '#9A6A4F',
  },
]

const seedPlants: Plant[] = plantSeeds.map((row, index) => {
  const [name, species, localName, health, dLat, dLng, area, ageDays] = row
  const ownerId = index < 8 ? 'usr_owner' : 'usr_meera'
  const lat = Number((CAMPUS.lat + dLat).toFixed(6))
  const lng = Number((CAMPUS.lng + dLng).toFixed(6))
  const status = health >= 85 ? 'healthy' : health >= 65 ? 'needs_attention' : 'critical'
  const plantedOn = new Date(Date.now() - ageDays * 86400000).toISOString().slice(0, 10)
  return {
    id: `plt_${index + 1}`,
    name,
    species,
    localName,
    ownerId,
    monitorId: ownerId === 'usr_owner' ? 'usr_monitor' : null,
    status,
    health,
    plantedOn,
    lat,
    lng,
    areaSqm: Math.round(area * 100),
    address: 'GITAM University, Nagadenahalli, Bengaluru North',
    photoUrl: PHOTOS[index % PHOTOS.length],
    notes:
      index === 6
        ? 'Bark wound on the north side. Needs arborist review before monsoon.'
        : index === 4
          ? 'Leaf yellowing observed; soil test suggested.'
          : null,
    qrToken: qrSlug(),
    lastWateredAt: iso(index % 4, 7),
    nextWateringDue: daysFromNow((index % 3) + 1),
    createdAt: iso(Math.min(ageDays, 30), 10),
    updatedAt: iso(index % 5, 16),
  }
})

const seedFields: Field[] = [
  {
    id: 'fld_1',
    name: 'North Orchard',
    crop: 'Mixed fruit saplings',
    ownerId: 'usr_owner',
    monitorId: 'usr_monitor',
    status: 'healthy',
    areaSqm: 1840,
    centerLat: 13.28995,
    centerLng: 77.59645,
    polygon: [
      [13.29021, 77.59618],
      [13.29024, 77.59674],
      [13.28971, 77.59679],
      [13.28968, 77.59621],
    ],
    plantedOn: '2023-07-14',
    photoUrl: PHOTOS[4],
    notes: 'Drip irrigation installed along the eastern row.',
    createdAt: iso(120, 11),
    updatedAt: iso(6, 9),
  },
  {
    id: 'fld_2',
    name: 'Heritage Grove',
    crop: 'Native canopy species',
    ownerId: 'usr_meera',
    monitorId: null,
    status: 'needs_attention',
    areaSqm: 2460,
    centerLat: 13.28745,
    centerLng: 77.59862,
    polygon: [
      [13.28772, 77.59828],
      [13.28778, 77.59896],
      [13.28716, 77.59902],
      [13.28711, 77.59831],
    ],
    plantedOn: '2022-06-02',
    photoUrl: PHOTOS[1],
    notes: 'Awaiting a second monitor. Owner has suggested Meera Iyer.',
    createdAt: iso(200, 8),
    updatedAt: iso(12, 15),
  },
]

const seedCareLogs: CareLog[] = []
const careTemplates: Array<[string, string, number]> = [
  ['water', 'Deep watering, 12 litres at the root zone', 1],
  ['inspect', 'Checked for pest damage — clear', 3],
  ['fertilise', 'Applied vermicompost, 2 kg', 8],
  ['water', 'Morning watering round', 11],
  ['prune', 'Removed two dead lower branches', 17],
]

seedPlants.slice(0, 9).forEach((plant, plantIndex) => {
  careTemplates.forEach(([type, note, days], templateIndex) => {
    if ((plantIndex + templateIndex) % 3 === 0) {
      seedCareLogs.push({
        id: `care_${plantIndex}_${templateIndex}`,
        plantId: plant.id,
        type: type as CareLog['type'],
        note,
        actorId: plant.monitorId ?? plant.ownerId,
        createdAt: iso(days, 7 + templateIndex),
      })
    }
  })
})

const seedTickets: Ticket[] = [
  {
    id: 'tkt_1',
    userId: 'usr_owner',
    subject: 'Rain Tree 04 has a hollow in the main trunk',
    category: 'tree_health',
    description:
      'Noticed a cavity about 1.2 m from the ground after the weekend rain. No visible fungal growth yet, but the bark sounds hollow when tapped.',
    status: 'in_progress',
    priority: 'high',
    plantId: 'plt_2',
    replies: [
      {
        id: 'rep_1',
        authorId: 'usr_admin',
        body: 'Thanks Ananya — an arborist visit is scheduled for Thursday morning. Please keep the area clear.',
        createdAt: iso(2, 11),
      },
    ],
    createdAt: iso(4, 9),
    updatedAt: iso(2, 11),
  },
  {
    id: 'tkt_2',
    userId: 'usr_monitor',
    subject: 'Cannot upload care photo from the field',
    category: 'app_issue',
    description:
      'Photo upload spins forever when the phone is on campus Wi-Fi. Works on mobile data.',
    status: 'open',
    priority: 'medium',
    plantId: null,
    replies: [],
    createdAt: iso(1, 18),
    updatedAt: iso(1, 18),
  },
  {
    id: 'tkt_3',
    userId: 'usr_meera',
    subject: 'Add a second monitor for Heritage Grove',
    category: 'monitoring',
    description: 'The grove is too large for one person. Requesting a second monitor.',
    status: 'resolved',
    priority: 'low',
    plantId: null,
    replies: [
      {
        id: 'rep_2',
        authorId: 'usr_admin',
        body: 'Approved in principle. Please submit the monitoring request from the field page.',
        createdAt: iso(9, 12),
      },
    ],
    createdAt: iso(11, 10),
    updatedAt: iso(9, 12),
  },
]

const seedMonitoringRequests: MonitoringRequest[] = [
  {
    id: 'mon_1',
    targetType: 'field',
    targetId: 'fld_2',
    targetName: 'Heritage Grove',
    requesterId: 'usr_meera',
    ownerId: 'usr_meera',
    suggestedBy: 'usr_meera',
    status: 'pending',
    note: 'I live 400 m from the grove and can cover weekday watering.',
    adminNote: null,
    decidedBy: null,
    decidedAt: null,
    createdAt: iso(3, 14),
  },
  {
    id: 'mon_2',
    targetType: 'plant',
    targetId: 'plt_3',
    targetName: 'Gulmohar 07',
    requesterId: 'usr_monitor',
    ownerId: 'usr_owner',
    suggestedBy: 'usr_owner',
    status: 'approved',
    note: 'Vikram already covers the eastern row.',
    adminNote: 'Approved — capacity respected, one monitor per record.',
    decidedBy: 'usr_admin',
    decidedAt: iso(20, 10),
    createdAt: iso(22, 16),
  },
]

const seedFeedback: Feedback[] = [
  {
    id: 'fb_1',
    userId: 'usr_monitor',
    rating: 5,
    message: 'The QR label on the tree made the handover to the new volunteer effortless.',
    createdAt: iso(7, 17),
  },
]

export interface SeedData {
  users: StoredUser[]
  plants: Plant[]
  fields: Field[]
  careLogs: CareLog[]
  monitoringRequests: MonitoringRequest[]
  tickets: Ticket[]
  feedback: Feedback[]
}

/**
 * Build the full seed dataset, hashing passwords asynchronously.
 */
export async function buildSeedData(): Promise<SeedData> {
  const passwordHash = await hashPassword(DEMO_PASSWORD)
  const users = seedUserSpecs.map((spec) => buildUser({ ...spec, passwordHash } as unknown as StoredUser))
  return {
    users,
    plants: seedPlants,
    fields: seedFields,
    careLogs: seedCareLogs,
    monitoringRequests: seedMonitoringRequests,
    tickets: seedTickets,
    feedback: seedFeedback,
  }
}

/** Strip credential fields before handing a user to the UI layer. */
function sanitizeStoredUser(user: StoredUser): User {
  const { passwordHash, isDemo, ...rest } = user
  return rest
}

/**
 * Seed the database once on first launch. Safe to call repeatedly — existing
 * rows are never overwritten.
 */
export async function seedDatabase() {
  const existing = await db.users.count()
  if (existing > 0) return { seeded: false }

  const { users, plants, fields, careLogs, monitoringRequests, tickets, feedback } = await buildSeedData()

  for (const user of users) await db.users.add(user)
  for (const plant of plants) await db.plants.add(plant)
  for (const field of fields) await db.fields.add(field)
  for (const log of careLogs) await db.careLogs.add(log)
  for (const request of monitoringRequests) await db.monitoringRequests.add(request)
  for (const ticket of tickets) await db.tickets.add(ticket)
  for (const item of feedback) await db.feedback.add(item)

  console.log('[seed] local database ready — demo password: Haritavanam@123')
  return { seeded: true }
}

/* ---------------------------------------------------------------- demo accounts */

export async function getDemoAccounts(): Promise<DemoAccount[]> {
  await seedDatabase()
  const users = (await db.users.toArray()).filter((u) => u.isDemo === true)
  return users
    .sort((a, b) => ['admin', 'owner', 'monitor'].indexOf(a.role) - ['admin', 'owner', 'monitor'].indexOf(b.role))
    .map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      headline: user.headline ?? undefined,
      avatarColor: user.avatarColor,
    })) as DemoAccount[]
}

/* ---------------------------------------------------------------- sessions */

export async function createSession(userId: string) {
  const token = `sess_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 12)}`
  const session = {
    id: newId(),
    token,
    userId,
    createdAt: nowIso(),
    expiresAt: new Date(Date.now() + 30 * 86400000).toISOString(),
  }
  await db.sessions.add(session)
  return { session, token }
}

export async function getSession(token: string) {
  const session = await db.sessions.where('token').equals(token).first()
  if (!session) return null
  if (new Date(session.expiresAt).getTime() < Date.now()) {
    await db.sessions.delete(session.id)
    return null
  }
  return session
}

export async function destroySession(token: string) {
  const session = await db.sessions.where('token').equals(token).first()
  if (session) await db.sessions.delete(session.id)
}

export async function getCurrentUser(token: string | null) {
  if (!token) return null
  const session = await getSession(token)
  if (!session) return null
  const stored = await db.users.get(session.userId)
  return stored ? sanitizeStoredUser(stored) : null
}

/* ---------------------------------------------------------------- password verify (re-exported) */

export { verifyPassword }

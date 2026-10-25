import { hashPassword, newId, qrSlug } from '../lib/crypto.js'
import { COLLECTIONS } from './index.js'

const CAMPUS = { lat: 13.2886216, lng: 77.5974282 }

const iso = (daysAgo, hour = 9) => {
  const date = new Date()
  date.setDate(date.getDate() - daysAgo)
  date.setHours(hour, 0, 0, 0)
  return date.toISOString()
}

const daysFromNow = (days, hour = 7) => {
  const date = new Date()
  date.setDate(date.getDate() + days)
  date.setHours(hour, 0, 0, 0)
  return date.toISOString()
}

const PHOTOS = [
  'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=1000&q=70',
  'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=1000&q=70',
  'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1000&q=70',
  'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=1000&q=70',
  'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1000&q=70',
  'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=1000&q=70',
]

export async function seedDatabase(store, { reset = false } = {}) {
  if (reset) {
    await store.resetCollections(COLLECTIONS)
    console.log('[seed] collections cleared')
  }

  const existing = await store.count('users')
  if (existing > 0) {
    console.log(`[seed] skipped — ${existing} users already present`)
    return { seeded: false }
  }

  const password = hashPassword('Haritavanam@123')
  const now = new Date().toISOString()

  const users = [
    {
      id: 'usr_admin',
      email: 'admin@haritavanam.test',
      name: 'Sai Roopak',
      role: 'admin',
      phone: '+91 98450 11223',
      headline: 'Campus greening programme',
      avatarColor: '#3A5A40',
      isDemo: true,
      passwordHash: password,
      createdAt: now,
    },
    {
      id: 'usr_owner',
      email: 'owner@haritavanam.test',
      name: 'Ananya Rao',
      role: 'owner',
      phone: '+91 98450 44556',
      headline: 'Planting since 2021',
      avatarColor: '#8C5A3C',
      isDemo: true,
      passwordHash: password,
      createdAt: now,
    },
    {
      id: 'usr_monitor',
      email: 'monitor@haritavanam.test',
      name: 'Vikram Menon',
      role: 'monitor',
      phone: '+91 98450 77889',
      headline: 'Weekend watering volunteer',
      avatarColor: '#4E6B52',
      isDemo: true,
      passwordHash: password,
      createdAt: now,
    },
    {
      id: 'usr_meera',
      email: 'meera@haritavanam.test',
      name: 'Meera Iyer',
      role: 'owner',
      phone: '+91 98450 99001',
      headline: 'Biodiversity student',
      avatarColor: '#9A6A4F',
      isDemo: true,
      passwordHash: password,
      createdAt: now,
    },
  ]

  const plantSeeds = [
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

  const plants = plantSeeds.map((row, index) => {
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

  const fields = [
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

  const careTemplates = [
    ['water', 'Deep watering, 12 litres at the root zone', 1],
    ['inspect', 'Checked for pest damage — clear', 3],
    ['fertilise', 'Applied vermicompost, 2 kg', 8],
    ['water', 'Morning watering round', 11],
    ['prune', 'Removed two dead lower branches', 17],
  ]

  const careLogs = []
  plants.slice(0, 9).forEach((plant, plantIndex) => {
    careTemplates.forEach(([type, note, days], templateIndex) => {
      if ((plantIndex + templateIndex) % 3 === 0) {
        careLogs.push({
          id: `care_${plantIndex}_${templateIndex}`,
          plantId: plant.id,
          type,
          note,
          actorId: plant.monitorId ?? plant.ownerId,
          createdAt: iso(days, 7 + templateIndex),
        })
      }
    })
  })

  const tickets = [
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

  const monitoringRequests = [
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

  const feedback = [
    {
      id: 'fb_1',
      userId: 'usr_monitor',
      rating: 5,
      message: 'The QR label on the tree made the handover to the new volunteer effortless.',
      createdAt: iso(7, 17),
    },
  ]

  const data = { users, plants, fields, careLogs, monitoringRequests, tickets, feedback }

  for (const [collection, rows] of Object.entries(data)) {
    for (const row of rows) {
      await store.insert(collection, row)
    }
    console.log(`[seed] ${collection}: ${rows.length}`)
  }

  console.log('[seed] demo accounts ready — password for all: Haritavanam@123')
  return { seeded: true }
}

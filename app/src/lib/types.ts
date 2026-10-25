export type Role = 'admin' | 'owner' | 'monitor'
export type PlantStatus = 'healthy' | 'needs_attention' | 'critical' | 'new'
export type CareType = 'water' | 'fertilise' | 'prune' | 'inspect' | 'photo' | 'pest'
export type TicketStatus = 'open' | 'in_progress' | 'resolved'
export type Priority = 'low' | 'medium' | 'high'

export interface User {
  id: string
  email: string
  name: string
  role: Role
  phone?: string | null
  headline?: string | null
  avatarColor?: string
}

export interface CareLog {
  id: string
  plantId: string
  type: CareType
  note?: string | null
  actorId: string
  actorName?: string
  createdAt: string
}

export interface Plant {
  id: string
  name: string
  species: string
  localName?: string | null
  ownerId: string
  monitorId?: string | null
  status: PlantStatus
  health: number
  plantedOn: string
  lat: number
  lng: number
  areaSqm?: number | null
  address?: string | null
  photoUrl?: string | null
  notes?: string | null
  qrToken: string
  lastWateredAt?: string | null
  nextWateringDue?: string | null
  scanCount?: number
  createdAt: string
  updatedAt: string
  ownerName?: string
  ownerInitials?: string
  monitorName?: string | null
  monitorInitials?: string | null
  careCount?: number
  lastCare?: { type: CareType; note?: string | null; createdAt: string } | null
}

export interface Field {
  id: string
  name: string
  crop?: string | null
  ownerId: string
  monitorId?: string | null
  status: PlantStatus
  areaSqm?: number | null
  polygon: [number, number][]
  centerLat: number
  centerLng: number
  plantedOn: string
  photoUrl?: string | null
  notes?: string | null
  ownerName?: string
  monitorName?: string | null
  createdAt: string
  updatedAt: string
}

export interface TicketReply {
  id: string
  authorId: string
  authorName?: string
  authorRole?: Role
  body: string
  createdAt: string
}

export interface Ticket {
  id: string
  userId: string
  requesterName?: string
  subject: string
  category: 'tree_health' | 'monitoring' | 'app_issue' | 'other'
  description: string
  status: TicketStatus
  priority: Priority
  plantId?: string | null
  replies: TicketReply[]
  replyCount?: number
  lastReply?: TicketReply | null
  createdAt: string
  updatedAt: string
}

export interface MonitoringRequest {
  id: string
  targetType: 'plant' | 'field'
  targetId: string
  targetName: string
  requesterId: string
  requesterName?: string
  ownerId: string
  ownerName?: string
  suggestedBy?: string | null
  suggestedByName?: string | null
  decidedBy?: string | null
  status: 'pending' | 'approved' | 'rejected'
  note?: string | null
  adminNote?: string | null
  createdAt: string
  decidedAt?: string | null
}

export interface Stats {
  plants: number
  fields: number
  healthy: number
  needsAttention: number
  critical: number
  careThisWeek: number
  dueSoon: number
  avgHealth: number
  openTickets: number
  pendingRequests: number
  monitors: number
  pendingMonitoringRequests: number
}

export interface DiseaseResult {
  name: string
  confidence: number
  severity: string
  advice: string
}

export interface DiseaseScan {
  id: string
  plantId: string
  imageUrl?: string | null
  symptomText?: string | null
  provider: string
  results: DiseaseResult[]
  createdAt: string
}

export interface DemoAccount {
  id: string
  name: string
  email: string
  role: Role
  headline?: string | undefined
  avatarColor?: string | undefined
}

export interface Feedback {
  id: string
  userId: string
  rating: number
  message: string
  createdAt: string
}

export interface PublicPlant {
  name: string
  species: string
  localName?: string | null
  plantedOn: string
  photoUrl?: string | null
  status: PlantStatus
  health: number
  areaSqm?: number | null
  city: string
  region: string
  country: string
  ownerFirstName: string
  careCount: number
  lastCaredAt?: string | null
  qrToken: string
}

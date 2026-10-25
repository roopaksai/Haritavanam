import type {
  CareLog,
  CareType,
  DemoAccount,
  DiseaseScan,
  Field,
  MonitoringRequest,
  Plant,
  PlantStatus,
  Priority,
  PublicPlant,
  Stats,
  Ticket,
  TicketStatus,
  User,
} from './types'
import { localApi } from './localApi'

const BASE_RAW = import.meta.env.VITE_API_URL as string | undefined
const BASE = BASE_RAW?.replace(/\/$/, '') ?? null
const USE_LOCAL = !BASE || BASE === ''

export class ApiError extends Error {
  status: number
  code: string
  details?: unknown

  constructor(message: string, status: number, code = 'error', details?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.details = details
  }

  get isOffline() {
    return this.code === 'offline'
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const isForm = init.body instanceof FormData
  let response: Response
  try {
    response = await fetch(`${BASE}${path}`, {
      credentials: 'include',
      ...init,
      headers: {
        ...(isForm ? {} : { 'Content-Type': 'application/json' }),
        ...(init.headers ?? {}),
      },
    })
  } catch {
    throw new ApiError(
      'Cannot reach the Haritavanam API. Set VITE_API_URL or run without it for local demo data.',
      0,
      'offline',
    )
  }

  if (!response.ok) {
    let payload: { error?: { message?: string; code?: string; details?: unknown } } | null = null
    try {
      payload = await response.json()
    } catch {
      payload = null
    }
    throw new ApiError(
      payload?.error?.message ?? `Request failed (${response.status})`,
      response.status,
      payload?.error?.code ?? 'error',
      payload?.error?.details,
    )
  }

  if (response.status === 204) return undefined as T
  return (await response.json()) as T
}

const json = (body: unknown) => JSON.stringify(body)

interface PeopleResponse {
  people: Array<{ id: string; name: string; role: string; headline?: string }>
}

export const api = {
  // auth
  me: () => (USE_LOCAL ? localApi.me() : request<{ user: User | null }>('/auth/me')),
  demoAccounts: () =>
    USE_LOCAL
      ? localApi.demoAccounts()
      : request<{ accounts: DemoAccount[]; password: string }>('/auth/demo-accounts'),
  login: (email: string, password: string) =>
    USE_LOCAL
      ? localApi.login(email, password)
      : request<{ user: User }>('/auth/login', { method: 'POST', body: json({ email, password }) }),
  logout: () =>
    USE_LOCAL ? localApi.logout() : request<{ ok: true }>('/auth/logout', { method: 'POST' }),
  updateProfile: (patch: Partial<Pick<User, 'name' | 'phone' | 'headline'>>) =>
    USE_LOCAL
      ? localApi.updateProfile(patch)
      : request<{ user: User }>('/auth/me', { method: 'PATCH', body: json(patch) }),

  // plants
  plants: (params: { scope?: string; q?: string; status?: string } = {}) => {
    const search = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value) search.set(key, value)
    })
    const suffix = search.toString() ? `?${search}` : ''
    if (USE_LOCAL) return localApi.plants(params)
    return request<{ plants: Plant[] }>(`/plants${suffix}`)
  },
  plant: (id: string) =>
    USE_LOCAL
      ? localApi.plant(id)
      : request<{
          plant: Plant
          careLogs: CareLog[]
          scans: DiseaseScan[]
          permissions: { canEdit: boolean; canLogCare: boolean; isMonitor: boolean }
        }>(`/plants/${id}`),
  createPlant: (body: Partial<Plant>) =>
    USE_LOCAL
      ? localApi.createPlant(body)
      : request<{ plant: Plant }>('/plants', { method: 'POST', body: json(body) }),
  updatePlant: (id: string, body: Partial<Plant>) =>
    USE_LOCAL
      ? localApi.updatePlant(id, body)
      : request<{ plant: Plant }>(`/plants/${id}`, { method: 'PATCH', body: json(body) }),
  deletePlant: (id: string) =>
    USE_LOCAL ? localApi.deletePlant(id) : request<{ ok: true }>(`/plants/${id}`, { method: 'DELETE' }),
  logCare: (plantId: string, body: { type: CareType; note?: string }) =>
    USE_LOCAL
      ? localApi.logCare(plantId, body)
      : request<{ careLog: CareLog }>(`/plants/${plantId}/care-logs`, {
          method: 'POST',
          body: json(body),
        }),

  // fields
  fields: () => (USE_LOCAL ? localApi.fields() : request<{ fields: Field[] }>('/fields')),
  createField: (body: { name: string; polygon: [number, number][]; crop?: string; notes?: string }) =>
    USE_LOCAL
      ? localApi.createField(body)
      : request<{ field: Field }>('/fields', { method: 'POST', body: json(body) }),

  // monitoring
  monitoringRequests: () =>
    USE_LOCAL
      ? localApi.monitoringRequests()
      : request<{ requests: MonitoringRequest[] }>('/monitoring-requests'),
  createMonitoringRequest: (body: {
    targetType: 'plant' | 'field'
    targetId: string
    requesterId?: string
    note?: string
  }) =>
    USE_LOCAL
      ? localApi.createMonitoringRequest(body)
      : request<{ request: MonitoringRequest }>('/monitoring-requests', {
          method: 'POST',
          body: json(body),
        }),
  decideMonitoringRequest: (id: string, status: 'approved' | 'rejected', note?: string) =>
    USE_LOCAL
      ? localApi.decideMonitoringRequest(id, status, note)
      : request<{ request: MonitoringRequest }>(`/monitoring-requests/${id}/decision`, {
          method: 'POST',
          body: json({ status, note }),
        }),

  // tickets
  tickets: () => (USE_LOCAL ? localApi.tickets() : request<{ tickets: Ticket[] }>('/tickets')),
  ticket: (id: string) =>
    USE_LOCAL ? localApi.ticket(id) : request<{ ticket: Ticket }>(`/tickets/${id}`),
  createTicket: (body: {
    subject: string
    description: string
    category: string
    priority: Priority
    plantId?: string | null
  }) =>
    USE_LOCAL
      ? localApi.createTicket({ ...body, priority: body.priority as TicketStatus })
      : request<{ ticket: Ticket }>('/tickets', { method: 'POST', body: json(body) }),
  replyTicket: (id: string, body: string) =>
    USE_LOCAL
      ? localApi.replyTicket(id, body)
      : request<{ ticket: Ticket }>(`/tickets/${id}/replies`, {
          method: 'POST',
          body: json({ body }),
        }),
  updateTicket: (id: string, body: { status?: TicketStatus; priority?: Priority }) =>
    USE_LOCAL
      ? localApi.updateTicket(id, body)
      : request<{ ticket: Ticket }>(`/tickets/${id}`, { method: 'PATCH', body: json(body) }),

  // insights
  stats: () => (USE_LOCAL ? localApi.stats() : request<{ stats: Stats }>('/stats')),
  people: () =>
    USE_LOCAL
      ? localApi.people()
      : request<PeopleResponse>('/people'),
  analyze: (body: { plantId: string; imageUrl?: string; symptomText?: string }) =>
    USE_LOCAL
      ? localApi.analyze(body)
      : request<{
          scan: DiseaseScan
          providerConfigured: boolean
          providerNote: string
          disclaimer: string
        }>('/disease/analyze', { method: 'POST', body: json(body) }),
  feedback: (body: { rating: number; message: string }) =>
    USE_LOCAL
      ? localApi.feedback(body)
      : request<{ ok: true }>('/feedback', { method: 'POST', body: json(body) }),
  upload: async (file: File) => {
    if (USE_LOCAL) return localApi.upload(file)
    const form = new FormData()
    form.append('file', file)
    return request<{ url: string; size: number }>('/uploads', { method: 'POST', body: form })
  },

  // public
  publicPlant: (token: string) =>
    USE_LOCAL ? localApi.publicPlant(token) : request<{ plant: PublicPlant }>(`/public/plants/${token}`),
}

export const statusLabel: Record<PlantStatus, string> = {
  healthy: 'Healthy',
  needs_attention: 'Needs attention',
  critical: 'Critical',
  new: 'Newly planted',
}

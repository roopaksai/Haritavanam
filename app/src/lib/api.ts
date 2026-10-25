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

const BASE = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') ?? '/api'

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
      'Cannot reach the Haritavanam API. Start both servers with `npm run dev` in the project root.',
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

export const api = {
  // auth
  me: () => request<{ user: User | null }>('/auth/me'),
  demoAccounts: () => request<{ accounts: DemoAccount[]; password: string }>('/auth/demo-accounts'),
  login: (email: string, password: string) =>
    request<{ user: User }>('/auth/login', { method: 'POST', body: json({ email, password }) }),
  logout: () => request<{ ok: true }>('/auth/logout', { method: 'POST' }),
  updateProfile: (patch: Partial<Pick<User, 'name' | 'phone' | 'headline'>>) =>
    request<{ user: User }>('/auth/me', { method: 'PATCH', body: json(patch) }),

  // plants
  plants: (params: { scope?: string; q?: string; status?: string } = {}) => {
    const search = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value) search.set(key, value)
    })
    const suffix = search.toString() ? `?${search}` : ''
    return request<{ plants: Plant[] }>(`/plants${suffix}`)
  },
  plant: (id: string) =>
    request<{
      plant: Plant
      careLogs: CareLog[]
      scans: DiseaseScan[]
      permissions: { canEdit: boolean; canLogCare: boolean; isMonitor: boolean }
    }>(`/plants/${id}`),
  createPlant: (body: Partial<Plant>) =>
    request<{ plant: Plant }>('/plants', { method: 'POST', body: json(body) }),
  updatePlant: (id: string, body: Partial<Plant>) =>
    request<{ plant: Plant }>(`/plants/${id}`, { method: 'PATCH', body: json(body) }),
  deletePlant: (id: string) => request<{ ok: true }>(`/plants/${id}`, { method: 'DELETE' }),
  logCare: (plantId: string, body: { type: CareType; note?: string }) =>
    request<{ careLog: CareLog }>(`/plants/${plantId}/care-logs`, {
      method: 'POST',
      body: json(body),
    }),

  // fields
  fields: () => request<{ fields: Field[] }>('/fields'),
  createField: (body: { name: string; polygon: [number, number][]; crop?: string; notes?: string }) =>
    request<{ field: Field }>('/fields', { method: 'POST', body: json(body) }),

  // monitoring
  monitoringRequests: () => request<{ requests: MonitoringRequest[] }>('/monitoring-requests'),
  createMonitoringRequest: (body: {
    targetType: 'plant' | 'field'
    targetId: string
    requesterId?: string
    note?: string
  }) => request<{ request: MonitoringRequest }>('/monitoring-requests', {
    method: 'POST',
    body: json(body),
  }),
  decideMonitoringRequest: (id: string, status: 'approved' | 'rejected', note?: string) =>
    request<{ request: MonitoringRequest }>(`/monitoring-requests/${id}/decision`, {
      method: 'POST',
      body: json({ status, note }),
    }),

  // tickets
  tickets: () => request<{ tickets: Ticket[] }>('/tickets'),
  ticket: (id: string) => request<{ ticket: Ticket }>(`/tickets/${id}`),
  createTicket: (body: {
    subject: string
    description: string
    category: string
    priority: Priority
    plantId?: string | null
  }) => request<{ ticket: Ticket }>('/tickets', { method: 'POST', body: json(body) }),
  replyTicket: (id: string, body: string) =>
    request<{ ticket: Ticket }>(`/tickets/${id}/replies`, { method: 'POST', body: json({ body }) }),
  updateTicket: (id: string, body: { status?: TicketStatus; priority?: Priority }) =>
    request<{ ticket: Ticket }>(`/tickets/${id}`, { method: 'PATCH', body: json(body) }),

  // insights
  stats: () => request<{ stats: Stats }>('/stats'),
  people: () =>
    request<{ people: Array<{ id: string; name: string; role: string; headline?: string }> }>(
      '/people',
    ),
  analyze: (body: { plantId: string; imageUrl?: string; symptomText?: string }) =>
    request<{
      scan: DiseaseScan
      providerConfigured: boolean
      providerNote: string
      disclaimer: string
    }>('/disease/analyze', { method: 'POST', body: json(body) }),
  feedback: (body: { rating: number; message: string }) =>
    request<{ ok: true }>('/feedback', { method: 'POST', body: json(body) }),
  upload: async (file: File) => {
    const form = new FormData()
    form.append('file', file)
    return request<{ url: string; size: number }>('/uploads', { method: 'POST', body: form })
  },

  // public
  publicPlant: (token: string) => request<{ plant: PublicPlant }>(`/public/plants/${token}`),
}

export const statusLabel: Record<PlantStatus, string> = {
  healthy: 'Healthy',
  needs_attention: 'Needs attention',
  critical: 'Critical',
  new: 'Newly planted',
}

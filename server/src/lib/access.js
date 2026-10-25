export const isAdmin = (user) => user?.role === 'admin'

export const canAccessPlant = (plant, user) =>
  Boolean(user) && (isAdmin(user) || plant.ownerId === user.id || plant.monitorId === user.id)

export const canAccessField = (field, user) =>
  Boolean(user) && (isAdmin(user) || field.ownerId === user.id || field.monitorId === user.id)

export const canManagePlant = (plant, user) =>
  Boolean(user) && (isAdmin(user) || plant.ownerId === user.id)

export async function userMap(store) {
  const users = await store.list('users')
  return new Map(users.map((user) => [user.id, user]))
}

export function decorateWithPeople(record, people) {
  const owner = people.get(record.ownerId)
  const monitor = people.get(record.monitorId)
  return {
    ...record,
    ownerName: owner?.name ?? 'Unassigned',
    ownerInitials: initials(owner?.name),
    monitorName: monitor?.name ?? null,
    monitorInitials: initials(monitor?.name),
  }
}

export function initials(name) {
  if (!name) return '—'
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

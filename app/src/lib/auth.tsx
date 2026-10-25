import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { api, ApiError } from './api'
import type { User } from './types'

interface AuthValue {
  user: User | null
  loading: boolean
  offline: boolean
  error: string | null
  signIn: (email: string, password: string) => Promise<User>
  signOut: () => Promise<void>
  refresh: () => Promise<void>
  updateUser: (user: User) => void
}

const AuthContext = createContext<AuthValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [offline, setOffline] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    try {
      const data = await api.me()
      setUser(data.user)
      setOffline(false)
      setError(null)
    } catch (cause) {
      const message = cause instanceof ApiError ? cause.message : 'Could not reach the server'
      setError(message)
      setOffline(cause instanceof ApiError && cause.isOffline)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const signIn = useCallback(async (email: string, password: string) => {
    const data = await api.login(email, password)
    setUser(data.user)
    setOffline(false)
    setError(null)
    return data.user
  }, [])

  const signOut = useCallback(async () => {
    try {
      await api.logout()
    } catch {
      // signing out locally is still the right behaviour if the API is away
    }
    setUser(null)
  }, [])

  const updateUser = useCallback((next: User) => setUser(next), [])

  const value = useMemo(
    () => ({ user, loading, offline, error, signIn, signOut, refresh, updateUser }),
    [user, loading, offline, error, signIn, signOut, refresh, updateUser],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>')
  return context
}

/**
 * Admins oversee every record; owners and monitors only see the plants they are
 * responsible for. Pass the result to `api.plants({ scope })`.
 */
export function usePlantScope(): 'all' | 'mine' {
  const { user } = useAuth()
  return user?.role === 'admin' ? 'all' : 'mine'
}

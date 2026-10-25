import { useCallback, useEffect, useRef, useState, type DependencyList } from 'react'
import { ApiError } from './api'

interface AsyncState<T> {
  data: T | null
  loading: boolean
  error: string | null
  reload: () => void
  setData: (value: T | null) => void
}

export function useAsync<T>(loader: () => Promise<T>, deps: DependencyList = []): AsyncState<T> {
  const loaderRef = useRef(loader)
  loaderRef.current = loader

  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [nonce, setNonce] = useState(0)

  const reload = useCallback(() => setNonce((value) => value + 1), [])

  useEffect(() => {
    let active = true
    setLoading(true)
    loaderRef
      .current()
      .then((result) => {
        if (!active) return
        setData(result)
        setError(null)
      })
      .catch((cause: unknown) => {
        if (!active) return
        setError(cause instanceof ApiError ? cause.message : 'Something went wrong')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, nonce])

  return { data, loading, error, reload, setData }
}

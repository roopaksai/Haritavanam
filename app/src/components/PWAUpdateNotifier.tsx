/**
 * PWAUpdateNotifier – shows a toast when a new version is available.
 *
 * Works with VitePWA registerType: 'autoUpdate'. Detects when the service
 * worker finds an updated version, installs it in the background, and shows
 * a prompt asking the user to reload to get the latest version.
 */

import { useCallback, useEffect, useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { useToast } from '../lib/toast'
import { Button } from './ui'

export function PWAUpdateNotifier() {
  const toast = useToast()
  const [hasUpdate, setHasUpdate] = useState(false)

  const reload = useCallback(() => {
    window.location.reload()
  }, [])

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return

    let swRegistration: ServiceWorkerRegistration | null = null

    navigator.serviceWorker.ready.then((reg) => {
      swRegistration = reg
    })

    const handleControllerChange = () => {
      setHasUpdate(true)
      toast.info('A new version of Haritavanam is available')
    }

    const handleUpdateFound = () => {
      if (!swRegistration) return
      const installingWorker = swRegistration.installing
      if (!installingWorker) return

      installingWorker.addEventListener('statechange', () => {
        if (
          installingWorker.state === 'installed' &&
          navigator.serviceWorker.controller
        ) {
          setHasUpdate(true)
          toast.info('A new version of Haritavanam is available')
        }
      })
    }

    navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange)
    navigator.serviceWorker.addEventListener('updatefound', handleUpdateFound)

    // Periodically check for updates (every 30 seconds)
    const updateCheckInterval = setInterval(() => {
      void navigator.serviceWorker.ready.then((reg) => {
        reg.update()
      })
    }, 30000)

    return () => {
      navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange)
      navigator.serviceWorker.removeEventListener('updatefound', handleUpdateFound)
      clearInterval(updateCheckInterval)
    }
  }, [toast])

  return (
    <>
      {hasUpdate ? (
        <div
          className="fixed bottom-[80px] left-1/2 -translate-x-1/2 z-[200] flex items-center gap-3 rounded-2xl border border-forest-700/10 bg-cream-50/95 px-4 py-3 shadow-lift backdrop-blur-lg animate-slide-up"
          role="dialog"
          aria-label="Update available"
        >
          <RefreshCw size={16} className="text-forest-700 animate-spin" aria-hidden />
          <div className="min-w-0 flex-1">
            <p className="text-[12px] font-semibold leading-tight text-ink-900">
              New version available
            </p>
            <p className="mt-0.5 text-[10px] text-ink-500">
              Refresh to get the latest update
            </p>
          </div>
          <Button size="sm" variant="primary" onClick={reload}>
            Reload
          </Button>
        </div>
      ) : null}
    </>
  )
}

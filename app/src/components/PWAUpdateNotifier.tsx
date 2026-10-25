/**
 * PWAUpdateNotifier – shows a toast when a new version is available.
 *
 * Works with VitePWA registerType: 'autoUpdate'. When the service worker
 * finds an updated version, it activates it in the background. This hook
 * detects the `controllerchange` event and shows a prompt asking the user
 * to reload the page to get the latest version.
 */

import { useCallback, useEffect, useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { Button } from './ui'
import { useToast } from '../lib/toast'

export function PWAUpdateNotifier() {
  const toast = useToast()
  const [hasUpdate, setHasUpdate] = useState(false)

  const reload = useCallback(() => {
    window.location.reload()
  }, [])

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return

    let registration: ServiceWorkerRegistration | null = null

    navigator.serviceWorker.ready.then((reg) => {
      registration = reg
    })

    const handleControllerChange = () => {
      // A new service worker has taken control – the page is running the old version
      setHasUpdate(true)
      toast.info('A new version of Haritavanam is available')
    }

    const handleUpdateFound = () => {
      if (!registration) return
      const installingWorker = registration.installing
      if (!installingWorker) return

      installingWorker.addEventListener('statechange', () => {
        if (
          installingWorker.state === 'installed' &&
          navigator.serviceWorker.controller
        ) {
          // New version is installed and waiting to activate
          setHasUpdate(true)
          toast.info('A new version of Haritavanam is available')
        }
      })
    }

    navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange)
    navigator.serviceWorker.addEventListener('updatefound', handleUpdateFound)

    return () => {
      navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange)
      navigator.serviceWorker.removeEventListener('updatefound', handleUpdateFound)
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

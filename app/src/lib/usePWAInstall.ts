/**
 * PWA install hook.
 *
 * Captures the `beforeinstallprompt` event and exposes a `prompt()` function
 * to show the browser's native install dialog. Also tracks dismissal state in
 * localStorage so the prompt isn't shown repeatedly.
 */

import { useCallback, useEffect, useMemo, useState } from 'react'

const PROMPT_DISMISSED_KEY = 'hv:pwa-install-dismissed'

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function usePWAInstall() {
  const [deferredEvent, setDeferredEvent] = useState<InstallPromptEvent | null>(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isSupported, setIsSupported] = useState(false)

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
      setIsSupported(false)
      return
    }

    setIsSupported('beforeinstallprompt' in window || 'onbeforeinstallprompt' in window)

    const onPrompt = (event: Event) => {
      event.preventDefault()
      setDeferredEvent(event as InstallPromptEvent)
    }

    const onInstalled = () => {
      setIsInstalled(true)
      setDeferredEvent(null)
    }

    window.addEventListener('beforeinstallprompt', onPrompt)
    window.addEventListener('appinstalled', onInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  const prompt = useCallback(async () => {
    if (!deferredEvent) return
    try {
      await deferredEvent.prompt()
      await deferredEvent.userChoice
      setIsInstalled(true)
      setDeferredEvent(null)
    } catch {
      /* install dismissed or failed */
    }
  }, [deferredEvent])

  const [hasDismissed, setHasDismissed] = useState(() => {
    try {
      return localStorage.getItem(PROMPT_DISMISSED_KEY) === '1'
    } catch {
      return false
    }
  })

  const shouldShow = useMemo(() => {
    if (isInstalled || !deferredEvent || hasDismissed) return false
    return true
  }, [isInstalled, deferredEvent, hasDismissed])

  const dismiss = useCallback(() => {
    setHasDismissed(true)
    try {
      localStorage.setItem(PROMPT_DISMISSED_KEY, '1')
    } catch {
      /* ignore */
    }
  }, [])

  return { prompt, isInstalled, isSupported, shouldShow, dismiss }
}

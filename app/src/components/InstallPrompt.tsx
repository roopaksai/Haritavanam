/**
 * InstallPrompt – auto-show PWA install banner.
 *
 * When `shouldShow` is true (first visit, not installed, not dismissed),
 * renders a non-blocking toast-style banner at the bottom of the screen with
 * an "Install app" button that triggers the native install dialog.
 *
 * Use on pages that should auto-suggest installation (e.g. Welcome, Dashboard).
 */

import { useEffect, useState } from 'react'
import { Download } from 'lucide-react'
import { usePWAInstall } from '../lib/usePWAInstall'
import { Button } from './ui'

interface InstallPromptProps {
  autoShow?: boolean
}

export function InstallPrompt({ autoShow = true }: InstallPromptProps = {}) {
  const { prompt, isSupported, shouldShow, dismiss } = usePWAInstall()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (autoShow && shouldShow && isSupported) {
      // Small delay so the page renders before the banner appears
      const timer = window.setTimeout(() => setVisible(true), 1500)
      return () => window.clearTimeout(timer)
    }
  }, [shouldShow, isSupported, autoShow])

  if (!visible || !shouldShow) return null

  return (
    <div
      className="fixed bottom-[14px] left-1/2 -translate-x-1/2 z-[200] flex items-center gap-3 rounded-2xl border border-forest-700/10 bg-cream-50/95 px-4 py-3 shadow-lift backdrop-blur-lg animate-slide-up"
      role="dialog"
      aria-label="Install Haritavanam"
    >
      <Download size={18} className="text-forest-700" aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="text-[12px] font-semibold leading-tight text-ink-900">
          Install Haritavanam
        </p>
        <p className="mt-0.5 text-[10px] text-ink-500">
          Add to home screen for offline use
        </p>
      </div>
      <Button size="sm" variant="primary" onClick={() => void prompt()}>
        Install
      </Button>
      <button
        type="button"
        onClick={dismiss}
        className="h-6 w-6 rounded-full text-ink-400 hover:bg-forest-700/10"
        aria-label="Dismiss"
      >
        <span className="sr-only">Dismiss</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  )
}

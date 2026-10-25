import { statusTheme } from '../lib/format'
import type { PlantStatus } from '../lib/types'

const CIRCUMFERENCE = 2 * Math.PI * 42

export function HealthRing({
  value,
  status = 'healthy',
  size = 64,
  stroke = 8,
  label,
}: {
  value: number
  status?: PlantStatus
  size?: number
  stroke?: number
  label?: string
}) {
  const clamped = Math.max(0, Math.min(100, value))
  const color = statusTheme[status].ring
  const dash = (clamped / 100) * CIRCUMFERENCE

  return (
    <div className="relative inline-grid place-items-center" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" width={size} height={size} className="-rotate-90" aria-hidden>
        <circle cx="50" cy="50" r="42" fill="none" stroke="#ECE6D7" strokeWidth={stroke} />
        <circle
          cx="50"
          cy="50"
          r="42"
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${CIRCUMFERENCE}`}
          style={{ transition: 'stroke-dasharray 700ms cubic-bezier(0.22,1,0.36,1)' }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center leading-none">
        <span
          className="font-display font-semibold tabular-nums text-ink-900"
          style={{ fontSize: size * 0.28 }}
        >
          {clamped}
        </span>
        {label ? (
          <span className="mt-0.5 text-[8px] font-semibold uppercase tracking-wider text-ink-400">
            {label}
          </span>
        ) : null}
      </div>
      <span className="sr-only">{clamped}% health</span>
    </div>
  )
}

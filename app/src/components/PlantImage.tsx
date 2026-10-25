import { useState } from 'react'
import { Leaf } from 'lucide-react'

export function PlantImage({
  src,
  alt,
  className = '',
  iconSize = 28,
}: {
  src?: string | null
  alt: string
  className?: string
  iconSize?: number
}) {
  const [failed, setFailed] = useState(false)

  if (!src || failed) {
    return (
      <div
        className={`grid place-items-center bg-[radial-gradient(120%_90%_at_20%_10%,#E2E8D6_0%,#ECE6D7_45%,#DCD5C4_100%)] ${className}`}
        role="img"
        aria-label={alt}
      >
        <Leaf size={iconSize} className="text-forest-600/35" aria-hidden />
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
      className={`object-cover ${className}`}
    />
  )
}

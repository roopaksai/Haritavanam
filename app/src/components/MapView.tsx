import { useEffect, useMemo, useRef } from 'react'
import L from 'leaflet'
import { statusTheme } from '../lib/format'
import type { Field, Plant } from '../lib/types'

export const CAMPUS_CENTER: [number, number] = [13.2886216, 77.5974282]

const PIN_SVG =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>'

interface MapViewProps {
  plants?: Plant[]
  fields?: Field[]
  selectedId?: string | null
  onSelect?: (id: string) => void
  center?: [number, number]
  zoom?: number
  className?: string
  interactive?: boolean
  showFields?: boolean
  onPick?: (lat: number, lng: number) => void
  pickedPoint?: [number, number] | null
  fitToData?: boolean
}

export function MapView({
  plants = [],
  fields = [],
  selectedId = null,
  onSelect,
  center = CAMPUS_CENTER,
  zoom = 16,
  className = 'h-full w-full',
  interactive = true,
  showFields = true,
  onPick,
  pickedPoint = null,
  fitToData = false,
}: MapViewProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<L.Map | null>(null)
  const plantLayer = useRef<L.LayerGroup | null>(null)
  const fieldLayer = useRef<L.LayerGroup | null>(null)
  const pickLayer = useRef<L.LayerGroup | null>(null)
  const onSelectRef = useRef(onSelect)
  const onPickRef = useRef(onPick)

  onSelectRef.current = onSelect
  onPickRef.current = onPick

  const mapKey = useMemo(() => `${center[0]},${center[1]}`, [center])

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const map = L.map(containerRef.current, {
      center,
      zoom,
      zoomControl: interactive,
      dragging: interactive,
      scrollWheelZoom: false,
      doubleClickZoom: interactive,
      attributionControl: true,
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map)

    map.attributionControl.setPrefix(false)
    plantLayer.current = L.layerGroup().addTo(map)
    fieldLayer.current = L.layerGroup().addTo(map)
    pickLayer.current = L.layerGroup().addTo(map)
    mapRef.current = map

    const observer = new ResizeObserver(() => map.invalidateSize())
    observer.observe(containerRef.current)

    return () => {
      observer.disconnect()
      map.remove()
      mapRef.current = null
      plantLayer.current = null
      fieldLayer.current = null
      pickLayer.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapKey])

  useEffect(() => {
    if (mapRef.current) mapRef.current.setView(center, zoom)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapKey, zoom])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    const handler = (event: L.LeafletMouseEvent) => {
      onPickRef.current?.(Number(event.latlng.lat.toFixed(6)), Number(event.latlng.lng.toFixed(6)))
    }
    if (onPick) {
      map.on('click', handler)
      map.getContainer().style.cursor = 'crosshair'
    }
    return () => {
      map.off('click', handler)
      map.getContainer().style.cursor = ''
    }
  }, [onPick])

  useEffect(() => {
    const layer = plantLayer.current
    if (!layer) return
    layer.clearLayers()

    for (const plant of plants) {
      const color = statusTheme[plant.status].ring
      const icon = L.divIcon({
        className: 'hv-pin',
        html: `<span style="--pin-color:${color}" data-active="${plant.id === selectedId}">${PIN_SVG}</span>`,
        iconSize: [30, 30],
        iconAnchor: [15, 28],
      })
      const marker = L.marker([plant.lat, plant.lng], {
        icon,
        title: plant.name,
        alt: `${plant.name}, ${plant.species}`,
        riseOnHover: true,
        zIndexOffset: plant.id === selectedId ? 500 : 0,
      })
      marker.on('click', () => onSelectRef.current?.(plant.id))
      marker.addTo(layer)
    }

    if (fitToData && plants.length > 1) {
      const bounds = L.latLngBounds(plants.map((plant) => [plant.lat, plant.lng] as [number, number]))
      mapRef.current?.fitBounds(bounds.pad(0.25), { animate: false })
    }
  }, [plants, selectedId, fitToData])

  useEffect(() => {
    const layer = fieldLayer.current
    if (!layer) return
    layer.clearLayers()
    if (!showFields) return

    for (const field of fields) {
      const polygon = L.polygon(field.polygon, {
        color: '#3A5A40',
        weight: 2,
        opacity: 0.75,
        fillColor: '#A3B18A',
        fillOpacity: 0.28,
        dashArray: '4 4',
      })
      polygon.bindTooltip(field.name, { direction: 'center', className: 'hv-tooltip' })
      polygon.on('click', () => onSelectRef.current?.(field.id))
      polygon.addTo(layer)

      L.marker([field.centerLat, field.centerLng], {
        icon: L.divIcon({
          className: 'hv-pin',
          html: `<span style="--pin-color:#2F4A33;width:22px;height:22px;border-radius:6px;transform:none">${PIN_SVG}</span>`,
          iconSize: [22, 22],
          iconAnchor: [11, 11],
        }),
        title: field.name,
      })
        .on('click', () => onSelectRef.current?.(field.id))
        .addTo(layer)
    }
  }, [fields, showFields])

  useEffect(() => {
    const layer = pickLayer.current
    if (!layer) return
    layer.clearLayers()
    if (!pickedPoint) return
    L.circleMarker(pickedPoint, {
      radius: 9,
      color: '#FDFCF7',
      weight: 3,
      fillColor: '#CD4B3F',
      fillOpacity: 1,
    }).addTo(layer)
  }, [pickedPoint])

  return (
    <div ref={containerRef} className={`${className} pb-safe`} aria-label="Map of plants and fields" />
  )
}

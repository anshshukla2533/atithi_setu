import { useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

// Replace with your actual Mapbox token
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || ''

interface MapProps {
  center?: [number, number]
  zoom?: number
  markers?: Array<{
    id: string
    coordinates: [number, number]
    type: 'current' | 'checkpoint' | 'alert'
    description?: string
  }>
  route?: {
    coordinates: [number, number][]
    type: 'planned' | 'actual'
  }
}

export function Map({ 
  center = [-74.5, 40], 
  zoom = 9, 
  markers = [],
  route
}: MapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const markersRef = useRef<{ [key: string]: mapboxgl.Marker }>({})

  useEffect(() => {
    if (!mapContainer.current) return

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center,
      zoom,
    })

    map.current.addControl(new mapboxgl.NavigationControl())
    map.current.addControl(new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true
      },
      trackUserLocation: true,
      showUserHeading: true
    }))

    return () => {
      map.current?.remove()
    }
  }, [])

  // Handle markers
  useEffect(() => {
    if (!map.current) return

    // Remove old markers
    Object.values(markersRef.current).forEach(marker => marker.remove())
    markersRef.current = {}

    // Add new markers
    markers.forEach(({ id, coordinates, type, description }) => {
      const el = document.createElement('div')
      el.className = `marker marker-${type}`
      
      const marker = new mapboxgl.Marker(el)
        .setLngLat(coordinates)
        .addTo(map.current!)

      if (description) {
        marker.setPopup(new mapboxgl.Popup().setHTML(description))
      }

      markersRef.current[id] = marker
    })
  }, [markers])

  // Handle route
  useEffect(() => {
    if (!map.current || !route) return

    const sourceId = `route-${route.type}`
    const layerId = `route-layer-${route.type}`

    if (map.current.getSource(sourceId)) {
      map.current.removeLayer(layerId)
      map.current.removeSource(sourceId)
    }

    map.current.addSource(sourceId, {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: route.coordinates
        }
      }
    })

    map.current.addLayer({
      id: layerId,
      type: 'line',
      source: sourceId,
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-color': route.type === 'planned' ? '#4444ff' : '#ff4444',
        'line-width': 3
      }
    })
  }, [route])

  return (
    <div className="w-full h-[600px] rounded-lg overflow-hidden">
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  )
}
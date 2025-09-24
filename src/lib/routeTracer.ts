// Utility functions for route generation and off-route detection
export type LatLng = { lat: number; lng: number }

// Haversine distance in meters between two points
export function haversine(a: LatLng, b: LatLng): number {
  const R = 6371000 // meters
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const dLat = toRad(b.lat - a.lat)
  const dLon = toRad(b.lng - a.lng)
  const la1 = toRad(a.lat)
  const la2 = toRad(b.lat)

  const sinDLat = Math.sin(dLat / 2)
  const sinDLon = Math.sin(dLon / 2)
  const x = sinDLat * sinDLat + Math.cos(la1) * Math.cos(la2) * sinDLon * sinDLon
  const c = 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x))
  return R * c
}

// Project point p onto segment ab and return the distance from p to the segment in meters
export function pointToSegmentDistance(p: LatLng, a: LatLng, b: LatLng): number {
  // Convert to Cartesian using simple equirectangular approximation local to a
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const latRad = toRad(a.lat)
  const k = Math.cos(latRad)

  const ax = a.lng * k
  const ay = a.lat
  const bx = b.lng * k
  const by = b.lat
  const px = p.lng * k
  const py = p.lat

  const dx = bx - ax
  const dy = by - ay
  const len2 = dx * dx + dy * dy
  if (len2 === 0) return haversine(p, a)

  let t = ((px - ax) * dx + (py - ay) * dy) / len2
  t = Math.max(0, Math.min(1, t))
  const proj = { lat: ay + t * dy, lng: (ax + t * dx) / k }
  return haversine(p, proj)
}

// Generate n evenly spaced intermediate points (including start and end)
export function generateLinearRoute(from: LatLng, to: LatLng, steps = 12): LatLng[] {
  if (steps < 2) return [from, to]
  const out: LatLng[] = []
  for (let i = 0; i < steps; i++) {
    const t = i / (steps - 1)
    out.push({ lat: from.lat + (to.lat - from.lat) * t, lng: from.lng + (to.lng - from.lng) * t })
  }
  return out
}

// Given a route array (ordered waypoints) and a current position, determine if off-route
// thresholdMeters defaults to 50m. Returns { offRoute: boolean, distance: number, closestSegment: number }
export function isOffRoute(route: LatLng[], position: LatLng, thresholdMeters = 50) {
  if (!route || route.length === 0) return { offRoute: true, distance: Infinity, closestSegment: -1 }
  let minDist = Infinity
  let minIdx = -1
  for (let i = 0; i < route.length - 1; i++) {
    const d = pointToSegmentDistance(position, route[i], route[i + 1])
    if (d < minDist) {
      minDist = d
      minIdx = i
    }
  }
  return { offRoute: minDist > thresholdMeters, distance: minDist, closestSegment: minIdx }
}

// Example helper to create a route from current position to checkpoint and return both route and a small metadata
export function createRouteToCheckpoint(current: LatLng, checkpoint: LatLng, steps = 12) {
  const route = generateLinearRoute(current, checkpoint, steps)
  return { route, meta: { start: current, end: checkpoint, steps } }
}

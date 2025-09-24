import { createRouteToCheckpoint, isOffRoute, LatLng } from './routeTracer'

// Example: assume we have current position and checkpoint
const current: LatLng = { lat: 12.9716, lng: 77.5946 }
const checkpoint: LatLng = { lat: 12.9750, lng: 77.5990 }

const { route } = createRouteToCheckpoint(current, checkpoint, 12)
console.log('Generated route points:', route)

// Simulate periodic position updates
const positions: LatLng[] = [
  { lat: 12.9720, lng: 77.5950 },
  { lat: 12.9730, lng: 77.5960 },
  { lat: 12.9740, lng: 77.5970 },
]

for (const pos of positions) {
  const res = isOffRoute(route, pos, 50)
  console.log('Position', pos, 'offRoute?', res.offRoute, 'distance meters', res.distance)
}

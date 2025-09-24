import 'dotenv/config'
import express from 'express'
import cors from 'cors'

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

// In-memory storage
const userRoutes = {}; // { userId: { plannedRoute: [...], lastLocation: {...}, locationHistory: [], sos: false, speed: number, distanceCovered: number, startTime: Date } }
const safeZones = [
  { name: 'Delhi Central', center: { lat: 28.7041, lng: 77.1025 }, radius: 5 }, // 5km radius
  { name: 'Noida Hub', center: { lat: 28.5355, lng: 77.3910 }, radius: 3 }
];

// Helper: Check if point is in safe zone
function isInSafeZone(location) {
  return safeZones.some(zone => {
    const distance = calculateDistance(location, zone.center);
    return distance <= zone.radius;
  });
}

// Helper: Calculate distance between two points in kilometers
function calculateDistance(point1, point2) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (point2.lat - point1.lat) * Math.PI / 180;
  const dLon = (point2.lng - point1.lng) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

// Helper: Calculate speed in km/h
function calculateSpeed(distance, timeDiff) {
  const hours = timeDiff / (1000 * 60 * 60);
  return distance / hours;
}

// Helper: Check if user is off route (simple distance check)
function isOffRoute(current, plannedRoute, threshold = 0.001) {
  if (!plannedRoute || plannedRoute.length === 0) return false;
  // Check if current location is within threshold of any planned point
  return !plannedRoute.some(point => {
    const dx = point.lat - current.lat;
    const dy = point.lng - current.lng;
    return Math.sqrt(dx*dx + dy*dy) < threshold;
  });
}

// POST /api/user/location
app.post('/api/user/location', (req, res) => {
  const { userId, location, plannedRoute } = req.body;
  if (!userId || !location) {
    return res.status(400).json({ error: 'userId and location required' });
  }
  
  const now = new Date();
  
  if (!userRoutes[userId]) {
    userRoutes[userId] = {
      plannedRoute: plannedRoute || [],
      lastLocation: location,
      locationHistory: [{ location, timestamp: now }],
      sos: false,
      speed: 0,
      distanceCovered: 0,
      startTime: now,
      lastUpdateTime: now,
      inSafeZone: isInSafeZone(location)
    };
  } else {
    if (plannedRoute) userRoutes[userId].plannedRoute = plannedRoute;
    
    // Calculate distance and speed
    const lastLoc = userRoutes[userId].lastLocation;
    const distance = calculateDistance(lastLoc, location);
    const timeDiff = now.getTime() - new Date(userRoutes[userId].lastUpdateTime).getTime();
    const speed = calculateSpeed(distance, timeDiff);
    
    userRoutes[userId].lastLocation = location;
    userRoutes[userId].locationHistory.push({ location, timestamp: now });
    userRoutes[userId].speed = speed;
    userRoutes[userId].distanceCovered += distance;
    userRoutes[userId].lastUpdateTime = now;
    userRoutes[userId].inSafeZone = isInSafeZone(location);
    
    // Keep only last hour of history
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    userRoutes[userId].locationHistory = userRoutes[userId].locationHistory.filter(
      entry => entry.timestamp > oneHourAgo
    );
  }
  
  // Check deviation and safe zone
  const offRoute = isOffRoute(location, userRoutes[userId].plannedRoute);
  userRoutes[userId].sos = offRoute;
  if (offRoute) {
    // Here you could trigger an actual SOS action (notify admin, etc)
    return res.json({ sos: true, message: 'User is off route! SOS triggered.' });
  }
  res.json({ sos: false, message: 'Location updated.' });
});

// GET /api/user/:userId/status
app.get('/api/user/:userId/status', (req, res) => {
  const { userId } = req.params;
  const data = userRoutes[userId];
  if (!data) return res.status(404).json({ error: 'User not found' });
  // Calculate trip duration
  const duration = new Date().getTime() - new Date(data.startTime).getTime();
  const durationMinutes = Math.floor(duration / (1000 * 60));
  
  res.json({
    lastLocation: data.lastLocation,
    sos: data.sos,
    plannedRoute: data.plannedRoute,
    speed: data.speed.toFixed(2),
    distanceCovered: data.distanceCovered.toFixed(2),
    duration: durationMinutes
  });
});

// GET /api/users/tracking
// GET /api/safe-zones
app.get('/api/safe-zones', (req, res) => {
  res.json(safeZones);
});

// GET /api/user/:userId/history
app.get('/api/user/:userId/history', (req, res) => {
  const { userId } = req.params;
  const data = userRoutes[userId];
  if (!data) return res.status(404).json({ error: 'User not found' });
  
  res.json({
    locationHistory: data.locationHistory,
    plannedRoute: data.plannedRoute
  });
});

app.get('/api/users/tracking', (req, res) => {
  const trackingUsers = Object.entries(userRoutes).map(([userId, data]) => ({
    userId,
    lastLocation: data.lastLocation,
    sos: data.sos,
    speed: data.speed.toFixed(2),
    distanceCovered: data.distanceCovered.toFixed(2),
    duration: Math.floor((new Date().getTime() - new Date(data.startTime).getTime()) / (1000 * 60)),
    inSafeZone: data.inSafeZone,
    recentLocations: data.locationHistory.slice(-5) // Last 5 locations for tracking
  }));
  res.json(trackingUsers);
});

app.listen(PORT, () => {
  console.log(`SafeTour backend running on port ${PORT}`);
});

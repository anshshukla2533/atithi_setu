import 'dotenv/config';
import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server as IOServer } from "socket.io";
import { pool, query, ensureUsersTable, testConnection } from './db.mysql.js';
import bcrypt from 'bcryptjs';
import fetch from 'node-fetch';

const app = express();
app.use(cors());
app.use(express.json());

const httpServer = createServer(app);
const io = new IOServer(httpServer, {
  cors: { origin: "*" }
});

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);
  socket.on("disconnect", () => console.log("Socket disconnected:", socket.id));
});

// In-memory stores (for demo/prototyping)
const routes = new Map(); // userId -> [{lat,lng}, ...]
const recentLocations = new Map(); // userId -> [{lat,lng,timestamp}, ...]
const alerts = [];

function toRad(deg) {
  return (deg * Math.PI) / 180;
}

function haversineDistance(a, b) {
  const R = 6371000; // meters
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const sinDLat = Math.sin(dLat / 2);
  const sinDLon = Math.sin(dLon / 2);
  const aa = sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLon * sinDLon;
  const c = 2 * Math.atan2(Math.sqrt(aa), Math.sqrt(1 - aa));
  return R * c;
}

// Distance from point p to segment ab (in meters)
function pointToSegmentDistance(p, a, b) {
  // Convert to Cartesian approximation using lat/lng degrees -> meters via haversine for small segments
  const A = { x: a.lng, y: a.lat };
  const B = { x: b.lng, y: b.lat };
  const P = { x: p.lng, y: p.lat };

  const AB = { x: B.x - A.x, y: B.y - A.y };
  const AP = { x: P.x - A.x, y: P.y - A.y };
  const ab2 = AB.x * AB.x + AB.y * AB.y;
  if (ab2 === 0) return haversineDistance(p, a);
  let t = (AP.x * AB.x + AP.y * AB.y) / ab2;
  t = Math.max(0, Math.min(1, t));
  const closest = { lat: A.y + AB.y * t, lng: A.x + AB.x * t };
  return haversineDistance(p, closest);
}

function distanceToPolyline(p, poly) {
  if (!poly || poly.length === 0) return Infinity;
  let min = Infinity;
  for (let i = 0; i < poly.length - 1; i++) {
    const d = pointToSegmentDistance(p, poly[i], poly[i + 1]);
    if (d < min) min = d;
  }
  if (poly.length === 1) return haversineDistance(p, poly[0]);
  return min;
}

// Save a planned route for a user
app.post("/api/user/route", (req, res) => {
  const { userId, route } = req.body;
  if (!userId || !Array.isArray(route)) return res.status(400).json({ error: "userId and route required" });
  routes.set(userId, route);
  return res.json({ ok: true });
});

// Receive live location updates
app.post("/api/user/location", (req, res) => {
  const { userId, lat, lng, timestamp } = req.body;
  if (!userId || typeof lat !== "number" || typeof lng !== "number") {
    return res.status(400).json({ error: "userId, lat, lng required" });
  }
  // Log incoming location payload for debugging/inspection
  console.log(`Received location POST from ${userId}: lat=${lat}, lng=${lng}, timestamp=${timestamp || Date.now()}`);

  const loc = { lat, lng, timestamp: timestamp || Date.now() };
  const existing = recentLocations.get(userId) || [];
  existing.push(loc);
  // Keep last 100 locations
  recentLocations.set(userId, existing.slice(-100));

  const planned = routes.get(userId);
  let offRoute = false;
  let distance = null;
  if (planned) {
    distance = distanceToPolyline(loc, planned);
    const thresholdMeters = 100; // configurable: mark off-route if >100m
    offRoute = distance > thresholdMeters;
    if (offRoute) {
      const alert = { userId, lat, lng, timestamp: loc.timestamp, type: "off_route", distance };
      alerts.push(alert);
      console.log("ALERT:", alert);
      // Log that we're emitting via Socket.IO as well
      console.log(`Emitting alert for ${userId} via Socket.IO`);
      // Emit real-time alert to connected clients
      io.emit("alert", alert);
    }
  }

  return res.json({ ok: true, offRoute, distance });
});

app.get("/api/user/:userId/alerts", (req, res) => {
  const userId = req.params.userId;
  const userAlerts = alerts.filter((a) => a.userId === userId);
  res.json(userAlerts);
});

app.get("/api/user/:userId/route", (req, res) => {
  const userId = req.params.userId;
  res.json(routes.get(userId) || []);
});

// Return recent locations for a user (last N)
app.get("/api/user/:userId/locations", (req, res) => {
  const userId = req.params.userId;
  const existing = recentLocations.get(userId) || [];
  res.json(existing);
});

// Clear recent locations for a user (debug)
app.delete("/api/user/:userId/locations", (req, res) => {
  const userId = req.params.userId;
  recentLocations.set(userId, []);
  res.json({ ok: true });
});

// Debug: emit an arbitrary alert via POST for testing WebSocket clients
app.post('/api/debug/emit-alert', (req, res) => {
  const alert = req.body;
  if (!alert || !alert.userId || typeof alert.lat !== 'number' || typeof alert.lng !== 'number') {
    return res.status(400).json({ error: 'alert with userId, lat, lng required' });
  }
  alerts.push(alert);
  console.log('Debug emit alert:', alert);
  io.emit('alert', alert);
  res.json({ ok: true, emitted: alert });
});

// Proxy for Google Directions API
app.get('/api/directions', async (req, res) => {
  const { origin, destination, mode = 'driving' } = req.query;
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!origin || !destination || !apiKey) {
    return res.status(400).json({ error: 'Missing origin, destination, or API key' });
  }
  const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&mode=${mode}&key=${apiKey}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch directions', details: err.message });
  }
});

// User registration (mobile + aadhaar + password) - MYSQL VERSION
app.post('/api/user/register', async (req, res) => {
  try {
    const { mobile, aadhaar, password, name } = req.body;
    if (!mobile || (!password && !aadhaar)) {
      return res.status(400).json({ error: 'mobile and (password or aadhaar) required' });
    }
    
    const password_hash = password ? await bcrypt.hash(password, 10) : null;
    
    // MySQL syntax with proper INSERT ... ON DUPLICATE KEY UPDATE
    const insertSQL = `
      INSERT INTO users (mobile, aadhaar, password_hash, name) 
      VALUES (?, ?, ?, ?) 
      ON DUPLICATE KEY UPDATE 
        aadhaar = VALUES(aadhaar), 
        password_hash = VALUES(password_hash), 
        name = VALUES(name)
    `;
    
    await query(insertSQL, [mobile, aadhaar || null, password_hash, name || null]);
    
    // Get the user data back
    const selectResult = await query('SELECT id, mobile, name, created_at FROM users WHERE mobile = ?', [mobile]);
    const user = selectResult.rows[0];
    
    res.json({ ok: true, user });
  } catch (err) {
    console.warn('Register error', err);
    res.status(500).json({ error: 'registration_failed' });
  }
});

// User login (mobile + password) - MYSQL VERSION
app.post('/api/user/login', async (req, res) => {
  try {
    const { mobile, password } = req.body;
    if (!mobile || !password) {
      return res.status(400).json({ error: 'mobile and password required' });
    }
    
    // MySQL syntax with ? placeholders
    const r = await query('SELECT id, mobile, password_hash, name FROM users WHERE mobile = ?', [mobile]);
    const user = r.rows[0];
    
    if (!user) {
      return res.status(401).json({ error: 'invalid_credentials' });
    }
    
    const ok = user.password_hash ? await bcrypt.compare(password, user.password_hash) : false;
    if (!ok) {
      return res.status(401).json({ error: 'invalid_credentials' });
    }
    
    res.json({ 
      ok: true, 
      user: { 
        id: user.id, 
        mobile: user.mobile, 
        name: user.name 
      } 
    });
  } catch (err) {
    console.warn('Login error', err);
    res.status(500).json({ error: 'login_failed' });
  }
});

// Initialize DB
const initializeDatabase = async () => {
  try {
    await ensureUsersTable();
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database:', error.message);
  }
};

const PORT = process.env.PORT || 4100;
httpServer.listen(PORT, async () => {
  console.log(`Safe-app backend listening on http://localhost:${PORT}`);
  
  // Test connection and initialize database
  const connected = await testConnection();
  if (connected) {
    await initializeDatabase();
  } else {
    console.error('Could not establish database connection');
  }
});
// ...existing code...
// (Move these endpoints after app is initialized below)

import 'dotenv/config';
import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server as IOServer } from "socket.io";
import { connectDB } from './db.mysql.js';
import twilio from 'twilio';
import bcrypt from 'bcryptjs';
import fetch from 'node-fetch';
// ...existing code...
// (All route definitions moved below app initialization)


const app = express();
app.use(cors());
app.use(express.json());

// Registration OTP: send OTP
app.post('/api/user/send-otp', async (req, res) => {
  try {
    const { mobile } = req.body;
    if (!mobile || mobile.length < 10) {
      return res.status(400).json({ error: 'Valid mobile number required' });
    }
    // Generate OTP (6 digit)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes
    otpStore.set(mobile, { otp, expiresAt });
    // Send OTP via SMS using Twilio
    try {
      await twilioClient.messages.create({
        body: `Your Safe App registration OTP is: ${otp}`,
        from: TWILIO_PHONE_NUMBER,
        to: mobile.startsWith('+') ? mobile : `+91${mobile}`
      });
    } catch (smsErr) {
      console.error('Failed to send OTP SMS:', smsErr);
      return res.status(500).json({ error: 'Failed to send OTP SMS' });
    }
    res.json({ ok: true, message: 'OTP sent' });
  } catch (err) {
    console.error('Send OTP error:', err);
    res.status(500).json({ error: 'Failed to send OTP', details: err.message });
  }
});

// Registration OTP: verify OTP
app.post('/api/user/verify-registration-otp', async (req, res) => {
  try {
    const { mobile, otp } = req.body;
    if (!mobile || !otp) {
      return res.status(400).json({ error: 'Mobile and OTP required' });
    }
    const otpEntry = otpStore.get(mobile);
    if (!otpEntry || otpEntry.otp !== otp) {
      return res.status(401).json({ error: 'Invalid OTP' });
    }
    if (Date.now() > otpEntry.expiresAt) {
      otpStore.delete(mobile);
      return res.status(401).json({ error: 'OTP expired' });
    }
    otpStore.delete(mobile);
    res.json({ ok: true, message: 'Mobile verified' });
  } catch (err) {
    console.error('Verify registration OTP error:', err);
    res.status(500).json({ error: 'OTP verification failed', details: err.message });
  }
});

const httpServer = createServer(app);
const io = new IOServer(httpServer, {
  cors: { origin: "*" }
});

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);
  socket.on("disconnect", () => console.log("Socket disconnected:", socket.id));
});

// --- In-memory stores ---
const routes = new Map();         // userId -> [{lat,lng}, ...]
const recentLocations = new Map(); // userId -> [{lat,lng,timestamp}, ...]
const alerts = [];
// OTP store: key is user id (mobile or name), value is { otp, expiresAt }
const otpStore = new Map();

// Twilio setup
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;

// --- Helper functions ---
function toRad(deg) { return (deg * Math.PI) / 180; }

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

function pointToSegmentDistance(p, a, b) {
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

// --- Routes ---
// Save a planned route
app.post("/api/user/route", (req, res) => {
  const { userId, route } = req.body;
  if (!userId || !Array.isArray(route)) return res.status(400).json({ error: "userId and route required" });
  routes.set(userId, route);
  res.json({ ok: true });
});

// Receive live location
app.post("/api/user/location", (req, res) => {
  const { userId, lat, lng, timestamp } = req.body;
  if (!userId || typeof lat !== "number" || typeof lng !== "number") {
    return res.status(400).json({ error: "userId, lat, lng required" });
  }

  const loc = { lat, lng, timestamp: timestamp || Date.now() };
  const existing = recentLocations.get(userId) || [];
  existing.push(loc);
  recentLocations.set(userId, existing.slice(-100));

  const planned = routes.get(userId);
  let offRoute = false;
  let distance = null;

  if (planned) {
    distance = distanceToPolyline(loc, planned);
    const thresholdMeters = 100;
    offRoute = distance > thresholdMeters;
    if (offRoute) {
      const alert = { userId, lat, lng, timestamp: loc.timestamp, type: "off_route", distance };
      alerts.push(alert);
      console.log("ALERT:", alert);
      io.emit("alert", alert);
    }
  }

  res.json({ ok: true, offRoute, distance });
});

// Get alerts
app.get("/api/user/:userId/alerts", (req, res) => {
  const userId = req.params.userId;
  res.json(alerts.filter(a => a.userId === userId));
});

// Get route
app.get("/api/user/:userId/route", (req, res) => {
  const userId = req.params.userId;
  res.json(routes.get(userId) || []);
});

// Get recent locations
app.get("/api/user/:userId/locations", (req, res) => {
  const userId = req.params.userId;
  res.json(recentLocations.get(userId) || []);
});

// Clear recent locations
app.delete("/api/user/:userId/locations", (req, res) => {
  const userId = req.params.userId;
  recentLocations.set(userId, []);
  res.json({ ok: true });
});

// Debug emit alert
app.post('/api/debug/emit-alert', (req, res) => {
  const alert = req.body;
  if (!alert || !alert.userId || typeof alert.lat !== 'number' || typeof alert.lng !== 'number') {
    return res.status(400).json({ error: 'alert with userId, lat, lng required' });
  }
  alerts.push(alert);
  io.emit('alert', alert);
  res.json({ ok: true, emitted: alert });
});

// Proxy for Google Directions API
app.get('/api/directions', async (req, res) => {
  const { origin, destination, mode = 'driving' } = req.query;
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!origin || !destination || !apiKey) return res.status(400).json({ error: 'Missing origin, destination, or API key' });

  try {
    const response = await fetch(`https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&mode=${mode}&key=${apiKey}`);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch directions', details: err.message });
  }
});

app.post('/api/user/register', async (req, res) => {
  try {
    const { mobile, aadhaar, password, name } = req.body;
    if (!mobile || mobile.length < 10) {
      return res.status(400).json({ error: 'Valid mobile number required' });
    }
    if (!password && !aadhaar) {
      return res.status(400).json({ error: 'Password or Aadhaar required' });
    }
    if (aadhaar && aadhaar.length !== 12) {
      return res.status(400).json({ error: 'Aadhaar must be 12 digits' });
    }
    const password_hash = password ? await bcrypt.hash(password, 12) : null;
    const users = db.collection('users');
    // Check if user already exists
    const existingUser = await users.findOne({ mobile });
    if (existingUser) {
      // Update existing user
      await users.updateOne(
        { mobile },
        { $set: { aadhaar: aadhaar || null, password_hash, name: name || null, updated_at: new Date() } }
      );
    } else {
      // Insert new user
      await users.insertOne({
        mobile,
        aadhaar: aadhaar || null,
        password_hash,
        name: name || null,
        created_at: new Date(),
        updated_at: new Date()
      });
    }
    // Fetch the user data
    const user = await users.findOne({ mobile }, { projection: { password_hash: 0 } });
    if (!user) {
      return res.status(500).json({ error: 'User creation failed' });
    }
    res.json({ ok: true, user });
  } catch (err) {
    console.error('Register error:', err);
    if (err.code === 11000) {
      return res.status(409).json({ error: 'Mobile number already exists' });
    }
    res.status(500).json({ error: 'Registration failed', details: err.message });
  }
});

// OTP-based login: Step 1 - verify password, generate OTP, require OTP verification
app.post('/api/user/login', async (req, res) => {
  try {
    const { mobile, name, password } = req.body;
    if ((!mobile && !name) || !password) {
      return res.status(400).json({ error: 'Mobile or username and password required' });
    }
    const users = db.collection('users');
    // Find user by mobile or name
    const user = await users.findOne({
      $or: [
        ...(mobile ? [{ mobile }] : []),
        ...(name ? [{ name }] : [])
      ]
    });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    if (!user.password_hash) {
      return res.status(401).json({ error: 'Password not set for this account' });
    }
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    // Generate OTP (6 digit)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes
    const userKey = mobile || name;
    otpStore.set(userKey, { otp, expiresAt, userId: user._id });
    // Send OTP via SMS using Twilio
    if (mobile) {
      try {
        await twilioClient.messages.create({
          body: `Your Safe App OTP is: ${otp}`,
          from: TWILIO_PHONE_NUMBER,
          to: mobile.startsWith('+') ? mobile : `+91${mobile}` // assumes Indian numbers if not international
        });
      } catch (smsErr) {
        console.error('Failed to send OTP SMS:', smsErr);
        return res.status(500).json({ error: 'Failed to send OTP SMS' });
      }
    }
    res.json({ ok: true, otpRequired: true, message: 'OTP sent' });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed', details: err.message });
  }
});

// OTP-based login: Step 2 - verify OTP
app.post('/api/user/verify-otp', async (req, res) => {
  try {
    const { mobile, name, otp } = req.body;
    if ((!mobile && !name) || !otp) {
      return res.status(400).json({ error: 'Mobile or username and OTP required' });
    }
    const userKey = mobile || name;
    const otpEntry = otpStore.get(userKey);
    if (!otpEntry || otpEntry.otp !== otp) {
      return res.status(401).json({ error: 'Invalid OTP' });
    }
    if (Date.now() > otpEntry.expiresAt) {
      otpStore.delete(userKey);
      return res.status(401).json({ error: 'OTP expired' });
    }
    // OTP valid, fetch user
    const users = db.collection('users');
    const user = await users.findOne({
      $or: [
        ...(mobile ? [{ mobile }] : []),
        ...(name ? [{ name }] : [])
      ]
    });
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    otpStore.delete(userKey);
    res.json({
      ok: true,
      user: {
        id: user._id,
        mobile: user.mobile,
        name: user.name
      }
    });
  } catch (err) {
    console.error('OTP verify error:', err);
    res.status(500).json({ error: 'OTP verification failed', details: err.message });
  }
});

// Add cleanup for in-memory stores to prevent memory leaks
setInterval(() => {
  // Clean old alerts (keep only last 1000)
  if (alerts.length > 1000) {
    alerts.splice(0, alerts.length - 1000);
  }
  
  // Clean old locations (older than 24 hours)
  const dayAgo = Date.now() - (24 * 60 * 60 * 1000);
  for (const [userId, locations] of recentLocations.entries()) {
    const filtered = locations.filter(loc => loc.timestamp > dayAgo);
    recentLocations.set(userId, filtered);
  }
}, 60000); // Run every minute

// --- Initialize MongoDB & start server ---
let db;
const PORT = process.env.PORT || 4100;
httpServer.listen(PORT, async () => {
  try {
    db = await connectDB();
    console.log('Database initialized successfully');
    console.log(`Safe-app backend listening on http://localhost:${PORT}`);
  } catch (err) {
    console.error('❌ Could not establish MongoDB connection:', err.message);
    process.exit(1);
  }
});

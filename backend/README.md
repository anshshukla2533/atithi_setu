# Safe App Backend (Prototype)

This is a minimal Node.js + Express prototype used by the SafeTour app to receive live locations and store planned routes in-memory. It's intended as a local development backend for testing live tracking and deviation detection.

Quick start (PowerShell on Windows):

1. Open a PowerShell terminal in this folder: `cd \path\to\guide-safe-now\backend`
2. Install dependencies: `npm install`
3. Start the server: `npm run dev` (requires `nodemon`) or `npm start`

Endpoints:
- `POST /api/user/route` { userId: string, route: [{lat:number,lng:number}, ...] } - store planned route for user
- `POST /api/user/location` { userId: string, lat: number, lng: number, timestamp?: number } - receive live location; returns `{ offRoute: boolean, distance: number|null }`
- `GET /api/user/:userId/alerts` - list alerts for user
- `GET /api/user/:userId/route` - get stored route

Notes:
- This implementation stores everything in memory. For production, replace with a persistent datastore (MongoDB, Postgres, etc.) and add authentication.
- Deviation detection uses a simple nearest-segment distance with a threshold of 100 meters. Adjust threshold and algorithm as needed.

WebSocket (real-time) support
--------------------------------
This server emits real-time `alert` events via Socket.IO when an off-route alert is generated. Example client (browser-side):

```html
<script src="https://cdn.socket.io/4.8.1/socket.io.min.js"></script>
<script>
	const socket = io('http://localhost:4000')
	socket.on('connect', () => console.log('connected', socket.id))
	socket.on('alert', (alert) => {
		console.log('Received alert', alert)
		// Update admin dashboard UI here
	})
</script>
```

Notes:
- For production, secure Socket.IO with authentication (JWT), CORS limits, and use HTTPS.

# SafeTour Backend

Node.js Express backend for SafeTour app.

## Features
- POST `/api/user/location`: Receive user location updates
- Store planned routes for users
- Check if user is deviating from route
- Trigger SOS if off-route
- In-memory storage for demo (MongoDB-ready)

## Setup
1. `npm install`
2. `npm run dev` (or `npm start` for production)

## Environment
- No environment variables required for demo mode
- For MongoDB integration, add `MONGODB_URI` to `.env`

## Endpoints
- `POST /api/user/location` — Send `{ userId, location, plannedRoute }`

## Notes
- This backend is for demo purposes. Data is not persisted after restart.
- Replace in-memory storage with MongoDB for production use.

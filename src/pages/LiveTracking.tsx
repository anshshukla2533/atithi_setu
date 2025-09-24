import { useState, useEffect } from "react"
import { Map } from "@/components/map/Map"
import { GoogleLiveMap, LiveUserMarker } from "@/components/map/GoogleLiveMap"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Shield 
} from "lucide-react"
import { useJsApiLoader } from '@react-google-maps/api';

interface Location {
  coordinates: [number, number]
  timestamp: Date
  accuracy: number
}

import { createRouteToCheckpoint, isOffRoute, LatLng } from "@/lib/routeTracer"

export default function LiveTrackingPage() {
  const { toast } = useToast()
  const [location, setLocation] = useState<Location | null>(null)
  const [isTracking, setIsTracking] = useState(false)
  const [watchId, setWatchId] = useState<number | null>(null)
  // plannedRoute: the generated route from current pos -> checkpoint
  const [plannedRoute, setPlannedRoute] = useState<Array<{ lat: number; lng: number }>>([])
  // trackPoints: collected live positions (for polyline fallback or display)
  const [trackPoints, setTrackPoints] = useState<Array<{ lat: number; lng: number }>>([])
  // Fetch real route from Google Directions API
  const [directionsPolyline, setDirectionsPolyline] = useState<Array<{ lat: number; lng: number }>>([]);

  // Example trip data - replace with actual data from your backend
  const trip = {
    title: "Live Tracking to Guntur, Andhra Pradesh",
    status: "active",
    nextCheckpoint: {
      name: "Guntur, Andhra Pradesh",
      expectedArrival: new Date(),
      coordinates: [80.4428, 16.3067] as [number, number] // Guntur: lng, lat
    },
    safetyStatus: "safe" as const
  }

  // Always generate route from present location to Guntur
  useEffect(() => {
    if (!location) return;
    const start = { lat: location.coordinates[1], lng: location.coordinates[0] };
    const end = { lat: 16.3067, lng: 80.4428 }; // Guntur
    const { route: autoRoute } = createRouteToCheckpoint(start, end, 12);
    setPlannedRoute(autoRoute);
  }, [location]);

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4100'

  const computeFitBounds = () => {
    if (!location) return undefined
    const cp = trip.nextCheckpoint.coordinates
    return [
      { lat: location.coordinates[1], lng: location.coordinates[0] },
      { lat: cp[1], lng: cp[0] }
    ]
  }

  const startTracking = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Error",
        description: "Geolocation is not supported by your browser",
        variant: "destructive"
      })
      return
    }
    // Start watching position
    const id = navigator.geolocation.watchPosition(
      (position) => {
        const newLoc = {
          coordinates: [position.coords.longitude, position.coords.latitude] as [number, number],
          timestamp: new Date(position.timestamp),
          accuracy: position.coords.accuracy,
        }
        setLocation(newLoc)
        setTrackPoints((r) => [...r, { lat: position.coords.latitude, lng: position.coords.longitude }])

        // Off-route check against real route polyline
        try {
          if (directionsPolyline && directionsPolyline.length > 0) {
            const check = isOffRoute(directionsPolyline, { lat: position.coords.latitude, lng: position.coords.longitude }, 50)
            if (check.offRoute) {
              toast({
                title: 'Off Route',
                description: `User appears to be off the planned route (~${Math.round(check.distance)} m).`,
                variant: 'destructive',
              })
            }
          }

          // Send live location to backend (best-effort)
          const payload = {
            userId: 'demo-user-1',
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            timestamp: position.timestamp,
          }
          fetch(`${BACKEND_URL}/api/user/location`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          }).catch((err) => console.warn('Failed to send location:', err))
        } catch (err) {
          console.warn('Error during location handling', err)
        }
      },
      (error) => {
        toast({ title: 'Location Error', description: error.message, variant: 'destructive' })
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    )
    setWatchId(id)
    setIsTracking(true)
  }

  const stopTracking = () => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId)
      setWatchId(null)
    }
    setIsTracking(false)
  }

  useEffect(() => {
    // Clean up on unmount
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId)
      }
    }
  }, [watchId])

  useEffect(() => {
    // When user starts tracking, fetch recent locations for demo-user-1
    if (isTracking) {
  fetch(`${BACKEND_URL}/api/user/demo-user-1/locations`)
        .then((r) => r.json())
        .then((locs: Array<any>) => {
          const pts = locs.map((l) => ({ lat: l.lat, lng: l.lng }))
          setTrackPoints(pts)
        })
        .catch((err) => console.warn('Failed to fetch recent locations', err))
    }
  }, [isTracking])

  // Fetch real route from backend proxy
  useEffect(() => {
    async function fetchRoute() {
      if (!location) return;
      const origin = `${location.coordinates[1]},${location.coordinates[0]}`;
      const destination = `16.3067,80.4428`;
      const url = `${BACKEND_URL}/api/directions?origin=${origin}&destination=${destination}&mode=driving`;
      try {
        const res = await fetch(url);
        const data = await res.json();
        if (data.routes && data.routes.length > 0) {
          const points = decodePolyline(data.routes[0].overview_polyline.points);
          setDirectionsPolyline(points);
        }
      } catch (err) {
        console.warn('Failed to fetch directions', err);
      }
    }
    fetchRoute();
  }, [location]);

  // Polyline decoder (Google encoded polyline algorithm)
  function decodePolyline(encoded: string) {
    let points = [];
    let index = 0, lat = 0, lng = 0;
    while (index < encoded.length) {
      let b, shift = 0, result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      let dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lat += dlat;
      shift = 0; result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      let dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lng += dlng;
      points.push({ lat: lat / 1e5, lng: lng / 1e5 });
    }
    return points;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid gap-6">
        {/* Status Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Trip Status</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{trip.title}</div>
              <Badge 
                variant={trip.safetyStatus === "safe" ? "default" : "destructive"}
                className="mt-2"
              >
                {trip.safetyStatus.toUpperCase()}
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Next Checkpoint</CardTitle>
              <MapPin className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{trip.nextCheckpoint.name}</div>
              <p className="text-xs text-muted-foreground mt-2">
                Expected Arrival: {trip.nextCheckpoint.expectedArrival.toLocaleString()}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Location Status</CardTitle>
              {location ? (
                <Clock className="h-4 w-4 text-green-500" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
              )}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {location ? "Tracking Active" : "Not Tracking"}
              </div>
              {location && (
                <p className="text-xs text-muted-foreground mt-2">
                  Last update: {location.timestamp.toLocaleTimeString()}
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Map */}
        <Card>
          <CardHeader>
            <CardTitle>Live Location</CardTitle>
            <CardDescription>
              Real-time location tracking and route monitoring
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-end mb-4">
              <Button
                variant="outline"
                onClick={async () => {
                  const cp = trip.nextCheckpoint.coordinates
                  // If we have a current location, build a straight-line multi-point route
                  let routePayload: Array<{ lat: number; lng: number }> = []
                  if (location) {
                    const startLat = location.coordinates[1]
                    const startLng = location.coordinates[0]
                    const endLat = cp[1]
                    const endLng = cp[0]
                    const steps = 12 // number of intermediate points
                    for (let i = 0; i <= steps; i++) {
                      const t = i / steps
                      const lat = startLat + (endLat - startLat) * t
                      const lng = startLng + (endLng - startLng) * t
                      routePayload.push({ lat, lng })
                    }
                  } else {
                    routePayload = [{ lat: cp[1], lng: cp[0] }]
                  }

                  try {
                    const res = await fetch(`${BACKEND_URL}/api/user/route`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ userId: 'demo-user-1', route: routePayload })
                    })
                    if (!res.ok) throw new Error('failed')
                    setPlannedRoute(routePayload)
                    toast({ title: 'Planned route set', description: `Planned route set to checkpoint.`, variant: 'default' })
                  } catch (err) {
                    console.warn('Failed to set route', err)
                    toast({ title: 'Error', description: 'Failed to set planned route', variant: 'destructive' })
                  }
                }}
              >
                Set checkpoint as route
              </Button>
            </div>
            <GoogleLiveMap
              center={location ? { lat: location.coordinates[1], lng: location.coordinates[0] } : { lat: 16.3067, lng: 80.4428 }}
              zoom={13}
              polyline={directionsPolyline.length > 0 ? directionsPolyline : plannedRoute}
              fitBounds={computeFitBounds()}
              markers={[
                ...(location ? [{
                  id: 'current',
                  lat: location.coordinates[1],
                  lng: location.coordinates[0],
                  name: 'Current Location',
                  status: 'You'
                }] : []),
                {
                  id: 'next-checkpoint',
                  lat: 16.3067,
                  lng: 80.4428,
                  name: 'Guntur, Andhra Pradesh',
                  status: 'Checkpoint'
                }
              ]}
            />
            <div className="flex justify-center mt-4">
              <Button
                onClick={isTracking ? stopTracking : startTracking}
                variant={isTracking ? "destructive" : "default"}
              >
                {isTracking ? "Stop Tracking" : "Start Tracking"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Emergency Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Emergency Actions</CardTitle>
            <CardDescription>
              Quick access to emergency features and contacts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Button 
                variant="destructive"
                className="w-full"
                onClick={() => {
                  toast({
                    title: "SOS Activated",
                    description: "Emergency contacts and authorities have been notified.",
                    variant: "destructive"
                  })
                }}
              >
                <Shield className="mr-2 h-4 w-4" />
                Activate SOS
              </Button>
              <Button 
                variant="outline"
                className="w-full"
                onClick={() => {
                  toast({
                    title: "Safety Check Initiated",
                    description: "Your emergency contacts will be notified if you don't respond.",
                  })
                }}
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Safety Check
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
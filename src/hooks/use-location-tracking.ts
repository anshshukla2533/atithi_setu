import { useState, useEffect } from 'react';
interface LatLngLiteral {
  lat: number;
  lng: number;
}

interface LocationTrackingState {
  currentLocation: LatLngLiteral | null;
  plannedRoute: LatLngLiteral[];
  isTracking: boolean;
  sos: boolean;
  error: string | null;
}

export function useLocationTracking(userId: string, initialRoute: LatLngLiteral[] = []) {
  const [state, setState] = useState<LocationTrackingState>({
    currentLocation: null,
    plannedRoute: initialRoute,
    isTracking: false,
    sos: false,
    error: null
  });

  // Start location tracking
  const startTracking = () => {
    setState(prev => ({ ...prev, isTracking: true, error: null }));
  };

  // Stop location tracking
  const stopTracking = () => {
    setState(prev => ({ ...prev, isTracking: false }));
  };

  // Update planned route
  const setPlannedRoute = (route: LatLngLiteral[]) => {
    setState(prev => ({ ...prev, plannedRoute: route }));
  };

  // Effect to handle location tracking and updates
  useEffect(() => {
    if (!state.isTracking) return;

    // Get user's location
    const watchId = navigator.geolocation.watchPosition(
      async (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };

        try {
          // Send location update to backend
          const response = await fetch('http://localhost:5000/api/user/location', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId,
              location,
              plannedRoute: state.plannedRoute
            })
          });

          const data = await response.json();

          setState(prev => ({
            ...prev,
            currentLocation: location,
            sos: data.sos,
            error: null
          }));
        } catch (err) {
          setState(prev => ({
            ...prev,
            error: 'Failed to update location'
          }));
        }
      },
      (error) => {
        setState(prev => ({
          ...prev,
          error: `Location error: ${error.message}`
        }));
      },
      { enableHighAccuracy: true }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [state.isTracking, userId, state.plannedRoute]);

  return {
    ...state,
    startTracking,
    stopTracking,
    setPlannedRoute
  };
}
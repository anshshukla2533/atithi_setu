import { useEffect, useCallback } from 'react'
import { useToast } from "@/components/ui/use-toast"
import type { Alert, DangerZone } from '@/types/alert'

interface AlertServiceProps {
  tripId: string;
  currentLocation?: {
    latitude: number;
    longitude: number;
  };
  plannedRoute?: {
    coordinates: [number, number][];
  };
  onAlert?: (alert: Alert) => void;
}

export function useAlertService({
  tripId,
  currentLocation,
  plannedRoute,
  onAlert
}: AlertServiceProps) {
  const { toast } = useToast()

  // Calculate distance between two points in kilometers
  const calculateDistance = useCallback((lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }, [])

  // Check if point is inside polygon
  const isPointInPolygon = useCallback((point: [number, number], polygon: number[][]) => {
    const [x, y] = point;
    let inside = false;
    
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const [xi, yi] = polygon[i];
      const [xj, yj] = polygon[j];
      
      const intersect = ((yi > y) !== (yj > y))
          && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }
    
    return inside;
  }, [])

  // Check if current location is near any danger zones
  const checkDangerZones = useCallback((location: typeof currentLocation, dangerZones: DangerZone[]) => {
    if (!location) return;

    dangerZones.forEach(zone => {
      if (zone.boundary.type === 'circle') {
        const distance = calculateDistance(
          location.latitude,
          location.longitude,
          zone.boundary.coordinates[0][0],
          zone.boundary.coordinates[0][1]
        );

        if (distance <= (zone.boundary.radius || 5)) {
          const alert: Alert = {
            id: crypto.randomUUID(),
            type: 'danger-area',
            severity: zone.riskLevel === 'extreme' ? 'critical' : 
                     zone.riskLevel === 'high' ? 'high' :
                     zone.riskLevel === 'medium' ? 'medium' : 'low',
            title: `Entering ${zone.name}`,
            description: zone.description,
            timestamp: new Date(),
            location: location,
            tripId: tripId,
            userId: 'current-user', // Replace with actual user ID
            status: 'active'
          };

          onAlert?.(alert);
          showAlertToast(alert);
        }
      } else if (zone.boundary.type === 'polygon') {
        if (isPointInPolygon([location.latitude, location.longitude], zone.boundary.coordinates)) {
          const alert: Alert = {
            id: crypto.randomUUID(),
            type: 'danger-area',
            severity: zone.riskLevel === 'extreme' ? 'critical' : 
                     zone.riskLevel === 'high' ? 'high' :
                     zone.riskLevel === 'medium' ? 'medium' : 'low',
            title: `Entering ${zone.name}`,
            description: zone.description,
            timestamp: new Date(),
            location: location,
            tripId: tripId,
            userId: 'current-user', // Replace with actual user ID
            status: 'active'
          };

          onAlert?.(alert);
          showAlertToast(alert);
        }
      }
    });
  }, [calculateDistance, isPointInPolygon, onAlert, tripId])

  // Check if current location deviates from planned route
  const checkRouteDeviation = useCallback((location: typeof currentLocation, route?: typeof plannedRoute) => {
    if (!location || !route) return;

    // Find the closest point on the route
    let minDistance = Infinity;
    route.coordinates.forEach(coord => {
      const distance = calculateDistance(
        location.latitude,
        location.longitude,
        coord[1],
        coord[0]
      );
      minDistance = Math.min(minDistance, distance);
    });

    // If deviation is more than 1km
    if (minDistance > 1) {
      const alert: Alert = {
        id: crypto.randomUUID(),
        type: 'deviation',
        severity: minDistance > 5 ? 'high' : 'medium',
        title: 'Route Deviation Detected',
        description: `You have deviated ${minDistance.toFixed(1)}km from your planned route`,
        timestamp: new Date(),
        location: location,
        tripId: tripId,
        userId: 'current-user', // Replace with actual user ID
        status: 'active'
      };

      onAlert?.(alert);
      showAlertToast(alert);
    }
  }, [calculateDistance, onAlert, tripId])

  const showAlertToast = (alert: Alert) => {
    toast({
      title: alert.title,
      description: alert.description,
      variant: alert.severity === 'critical' ? 'destructive' : 'default',
    })
  }

  // Monitor location changes
  useEffect(() => {
    if (!currentLocation) return;

    // Mock danger zones - replace with real data from your backend
    const mockDangerZones: DangerZone[] = [
      {
        id: '1',
        name: 'High Crime Area',
        type: 'crime',
        description: 'Recent reports of theft and assault in this area',
        riskLevel: 'high',
        boundary: {
          type: 'circle',
          coordinates: [[currentLocation.longitude + 0.01, currentLocation.latitude + 0.01]],
          radius: 5
        },
        source: 'Police Reports',
        lastUpdated: new Date(),
        recommendations: ['Avoid walking alone', 'Keep valuables hidden']
      }
    ];

    checkDangerZones(currentLocation, mockDangerZones);
    checkRouteDeviation(currentLocation, plannedRoute);

  }, [currentLocation, plannedRoute, checkDangerZones, checkRouteDeviation]);

  return null;
}
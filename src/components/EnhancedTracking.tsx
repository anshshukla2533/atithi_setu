import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { GoogleMap, Marker, Circle, Polyline } from '@react-google-maps/api';
import { Shield, AlertTriangle } from 'lucide-react';
import { locationService, type SafeZone, type TrackingUser } from '@/services/location-service';

const defaultCenter = { lat: 28.7041, lng: 77.1025 }; // New Delhi

export function EnhancedTracking() {
  const [users, setUsers] = useState<TrackingUser[]>([]);
  const [safeZones, setSafeZones] = useState<SafeZone[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  // Fetch safe zones once
  useEffect(() => {
    locationService.getSafeZones().then(setSafeZones);
  }, []);

  // Fetch users every 5 seconds
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/users/tracking');
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error('Failed to fetch tracking users:', error);
      }
    };

    fetchUsers();
    const interval = setInterval(fetchUsers, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-4">
      {/* User List */}
      <ScrollArea className="h-[600px] rounded-md border p-4">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold mb-4">Active Users</h2>
          {users.map((user) => (
            <Card
              key={user.userId}
              className={`p-4 cursor-pointer transition-all ${
                user.sos ? 'border-red-500 border-2' : ''
              } ${selectedUser === user.userId ? 'ring-2 ring-primary' : ''}`}
              onClick={() => setSelectedUser(user.userId)}
            >
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold">User {user.userId}</h3>
                  <div className="flex gap-2 items-center">
                    {user.inSafeZone && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Shield className="w-5 h-5 text-green-500" />
                          </TooltipTrigger>
                          <TooltipContent>In Safe Zone</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                    {user.sos && (
                      <AlertTriangle className="w-5 h-5 text-red-500 font-bold animate-pulse" />
                    )}
                  </div>
                </div>
                <div className="text-sm space-y-1">
                  <p>Speed: {user.speed} km/h</p>
                  <p>Distance: {user.distanceCovered} km</p>
                  <p>Duration: {user.duration} minutes</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </ScrollArea>

      {/* Map */}
      <div className="lg:col-span-2">
        <div className="h-[600px] rounded-lg overflow-hidden">
          <GoogleMap
            mapContainerStyle={{ width: '100%', height: '100%' }}
            zoom={11}
            center={
              selectedUser
                ? users.find(u => u.userId === selectedUser)?.lastLocation || defaultCenter
                : defaultCenter
            }
          >
            {/* Safe Zones */}
            {safeZones.map((zone) => (
              <Circle
                key={zone.name}
                center={zone.center}
                radius={zone.radius * 1000} // Convert km to meters
                options={{
                  fillColor: '#4ade80',
                  fillOpacity: 0.1,
                  strokeColor: '#4ade80',
                  strokeOpacity: 0.8,
                  strokeWeight: 2,
                }}
              />
            ))}

            {/* User Markers and Trails */}
            {users.map((user) => {
              const isSelected = user.userId === selectedUser;
              return (
                <React.Fragment key={user.userId}>
                  {/* Current location */}
                  <Marker
                    position={user.lastLocation}
                    icon={{
                      path: google.maps.SymbolPath.CIRCLE,
                      scale: isSelected ? 10 : 8,
                      fillColor: user.sos ? '#ef4444' : '#3b82f6',
                      fillOpacity: 1,
                      strokeWeight: 2,
                      strokeColor: 'white',
                    }}
                  />
                  
                  {/* Recent path */}
                  {user.recentLocations.length > 1 && (
                    <Polyline
                      path={user.recentLocations.map(h => h.location)}
                      options={{
                        strokeColor: user.sos ? '#ef4444' : '#3b82f6',
                        strokeOpacity: isSelected ? 0.8 : 0.4,
                        strokeWeight: isSelected ? 3 : 2,
                      }}
                    />
                  )}

                  {/* Planned route */}
                  {isSelected && user.plannedRoute.length > 0 && (
                    <Polyline
                      path={user.plannedRoute}
                      options={{
                        strokeColor: '#84cc16',
                        strokeOpacity: 0.8,
                        strokeWeight: 3,
                        strokePattern: [10, 5],
                      }}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </GoogleMap>
        </div>
      </div>
    </div>
  );
}
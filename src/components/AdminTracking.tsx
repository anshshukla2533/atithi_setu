import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { locationService } from '@/services/location-service';

interface TrackingUser {
  userId: string;
  lastLocation: { lat: number; lng: number };
  sos: boolean;
  speed: number;
  distanceCovered: number;
  duration: number;
}

export function AdminTracking() {
  const [users, setUsers] = useState<TrackingUser[]>([]);

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

    // Initial fetch
    fetchUsers();

    // Refresh every 5 seconds
    const interval = setInterval(fetchUsers, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <ScrollArea className="h-[600px] w-full rounded-md border p-4">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold mb-4">Live Tracking Dashboard</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {users.map((user) => (
            <Card key={user.userId} className={`p-4 ${user.sos ? 'border-red-500 border-2' : ''}`}>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold">User {user.userId}</h3>
                  {user.sos && (
                    <span className="text-red-500 font-bold animate-pulse">⚠️ SOS</span>
                  )}
                </div>
                <div className="text-sm space-y-1">
                  <p>Location: {user.lastLocation.lat.toFixed(6)}, {user.lastLocation.lng.toFixed(6)}</p>
                  <p>Speed: {user.speed} km/h</p>
                  <p>Distance: {user.distanceCovered} km</p>
                  <p>Duration: {user.duration} minutes</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </ScrollArea>
  );
}
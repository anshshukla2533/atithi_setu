// API service for location tracking
export interface Location {
  lat: number;
  lng: number;
}

export interface LocationUpdateResponse {
  sos: boolean;
  message: string;
}

export interface LocationHistory {
  location: Location;
  timestamp: Date;
}

export interface SafeZone {
  name: string;
  center: Location;
  radius: number;
}

export interface UserStatus {
  lastLocation: Location;
  sos: boolean;
  plannedRoute: Location[];
  locationHistory: LocationHistory[];
  speed: number;
  distanceCovered: number;
  duration: number;
  inSafeZone: boolean;
}

export interface TrackingUser extends UserStatus {
  userId: string;
  recentLocations: LocationHistory[];
}

class LocationService {
  private baseUrl = 'http://localhost:4100/api';

  async updateLocation(
    userId: string,
    location: Location,
    plannedRoute?: Location[]
  ): Promise<LocationUpdateResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/user/location`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, location, plannedRoute })
      });
      return await response.json();
    } catch (error) {
      console.error('Failed to update location:', error);
      throw new Error('Failed to update location');
    }
  }

  async getUserStatus(userId: string): Promise<UserStatus> {
    try {
      const response = await fetch(`${this.baseUrl}/user/${userId}/status`);
      return await response.json();
    } catch (error) {
      console.error('Failed to get user status:', error);
      throw new Error('Failed to get user status');
    }
  }
}

export const locationService = new LocationService();
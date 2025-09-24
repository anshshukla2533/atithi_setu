export interface Location {
  id: string;
  name: string;
  address: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  type: 'checkpoint' | 'destination' | 'accommodation';
  safetyRating?: number;
  notes?: string;
}

export interface Checkpoint extends Location {
  expectedArrivalTime: Date;
  expectedDepartureTime: Date;
  status: 'pending' | 'reached' | 'missed' | 'skipped';
  requiresCheck: boolean;
}

export interface Trip {
  id: string;
  userId: string;
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  status: 'planning' | 'active' | 'completed' | 'cancelled';
  checkpoints: Checkpoint[];
  emergencyContacts: string[]; // IDs of emergency contacts
  currentLocation?: Location;
  lastCheckin?: Date;
  safetyStatus: 'safe' | 'warning' | 'danger';
  privacyLevel: 'private' | 'friends' | 'authorities';
}
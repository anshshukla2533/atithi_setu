export type AlertType = 
  | 'deviation'      // Route deviation
  | 'danger-area'    // Entering dangerous area
  | 'checkpoint'     // Missed checkpoint
  | 'sos'           // SOS signal
  | 'safety-check'   // Missed safety check
  | 'offline'       // Device went offline
  | 'battery'       // Low battery
  | 'speed'         // Unusual speed
  | 'boundary';      // Geofence breach

export interface Alert {
  id: string;
  type: AlertType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  timestamp: Date;
  location?: {
    latitude: number;
    longitude: number;
  };
  tripId?: string;
  userId: string;
  status: 'active' | 'acknowledged' | 'resolved';
  acknowledgedBy?: {
    id: string;
    name: string;
    role: string;
    timestamp: Date;
  };
  resolvedBy?: {
    id: string;
    name: string;
    role: string;
    timestamp: Date;
  };
  metadata?: Record<string, any>;
}

export interface DangerZone {
  id: string;
  name: string;
  type: 'crime' | 'natural' | 'civil-unrest' | 'health' | 'other';
  description: string;
  riskLevel: 'low' | 'medium' | 'high' | 'extreme';
  boundary: {
    type: 'circle' | 'polygon';
    coordinates: number[][];
    radius?: number; // For circle type
  };
  activeFrom?: Date;
  activeTo?: Date;
  source: string;
  lastUpdated: Date;
  recommendations?: string[];
}
export interface AreaStatistics {
  id: string;
  area: {
    name: string;
    coordinates: [number, number];
    radius?: number;
    polygon?: [number, number][];
  };
  timeframe: 'daily' | 'weekly' | 'monthly';
  metrics: {
    activeUsers: number;
    incidents: number;
    alertsGenerated: number;
    averageResponseTime: number;
    riskScore: number;
  };
  trends: {
    incidentTrend: 'increasing' | 'decreasing' | 'stable';
    riskTrend: 'increasing' | 'decreasing' | 'stable';
    userTrend: 'increasing' | 'decreasing' | 'stable';
  };
}

export interface IncidentReport {
  id: string;
  type: 'crime' | 'medical' | 'natural' | 'civil-unrest' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'reported' | 'investigating' | 'resolved';
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  timestamp: Date;
  description: string;
  reportedBy: {
    id: string;
    name: string;
    role: string;
  };
  assignedTo?: {
    id: string;
    name: string;
    role: string;
  };
  actions: {
    timestamp: Date;
    action: string;
    by: string;
    notes?: string;
  }[];
}

export interface AlertStatistics {
  total: number;
  byType: Record<string, number>;
  bySeverity: Record<string, number>;
  responseTime: {
    average: number;
    min: number;
    max: number;
  };
  resolution: {
    resolved: number;
    pending: number;
    investigating: number;
  };
}
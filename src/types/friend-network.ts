export interface FriendCircle {
  id: string;
  name: string;
  description?: string;
  members: CircleMember[];
  createdBy: string;
  createdAt: Date;
  isEmergencyCircle: boolean;
}

export interface CircleMember {
  id: string;
  userId: string;
  name: string;
  role: 'admin' | 'member';
  status: 'active' | 'inactive';
  lastSeen?: Date;
  location?: {
    latitude: number;
    longitude: number;
    timestamp: Date;
  };
  notificationPreferences: {
    alerts: boolean;
    locationUpdates: boolean;
    checkIns: boolean;
    emergencyOnly: boolean;
  };
}

export interface Message {
  id: string;
  circleId: string;
  senderId: string;
  senderName: string;
  content: string;
  type: 'text' | 'location' | 'alert' | 'check-in';
  timestamp: Date;
  metadata?: {
    location?: {
      latitude: number;
      longitude: number;
    };
    alertType?: string;
    checkInType?: 'manual' | 'scheduled' | 'requested';
  };
  deliveryStatus: 'pending' | 'delivered' | 'failed';
  receivedBy: string[];
}
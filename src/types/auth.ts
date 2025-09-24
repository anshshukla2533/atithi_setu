export type UserRole = 'traveler' | 'admin' | 'authority';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  documentType: 'aadhaar' | 'passport';
  documentNumber: string;
  phoneNumber: string;
  emergencyContacts: EmergencyContact[];
}

export interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phoneNumber: string;
  email?: string;
  notificationPreference: 'sms' | 'email' | 'both';
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
import { create } from 'zustand';
import { Location } from '@/services/location-service';

interface TrackingStore {
  currentLocation: Location | null;
  plannedRoute: Location[];
  isTracking: boolean;
  sos: boolean;
  setLocation: (location: Location) => void;
  setPlannedRoute: (route: Location[]) => void;
  setTracking: (tracking: boolean) => void;
  setSos: (sos: boolean) => void;
}

export const useTrackingStore = create<TrackingStore>((set) => ({
  currentLocation: null,
  plannedRoute: [],
  isTracking: false,
  sos: false,
  setLocation: (location) => set({ currentLocation: location }),
  setPlannedRoute: (route) => set({ plannedRoute: route }),
  setTracking: (tracking) => set({ isTracking: tracking }),
  setSos: (sos) => set({ sos })
}));
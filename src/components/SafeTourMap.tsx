import React, { useEffect, useRef, useState } from 'react';
import mapboxgl, { Map, Marker } from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { MapPin, Shield, AlertTriangle, Users } from 'lucide-react';

interface Location {
  id: string;
  lng: number;
  lat: number;
  type: 'traveler' | 'friend' | 'alert' | 'safe-zone' | 'danger-zone';
  status?: 'safe' | 'caution' | 'danger';
  name?: string;
  description?: string;
}

interface SafeTourMapProps {
  locations?: Location[];
  showControls?: boolean;
  height?: string;
}

const SafeTourMap: React.FC<SafeTourMapProps> = ({ 
  locations = [], 
  showControls = true,
  height = "h-[600px]" 
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<Map | null>(null);
  const markers = useRef<Marker[]>([]);
  const [mapboxToken, setMapboxToken] = useState<string>('');
  const [showTokenInput, setShowTokenInput] = useState(true);

  // Demo locations for SafeTour
  const demoLocations: Location[] = [
    {
      id: '1',
      lng: -74.006,
      lat: 40.7128,
      type: 'traveler',
      status: 'safe',
      name: 'John Doe',
      description: 'Active traveler - JFK Airport'
    },
    {
      id: '2',
      lng: -73.9857,
      lat: 40.7484,
      type: 'alert',
      status: 'caution',
      name: 'Security Alert',
      description: 'Increased security measures in Times Square'
    },
    {
      id: '3',
      lng: -74.0445,
      lat: 40.6892,
      type: 'friend',
      status: 'safe',
      name: 'Sarah Wilson',
      description: 'Friend nearby - Statue of Liberty area'
    },
    {
      id: '4',
      lng: -73.9442,
      lat: 40.8082,
      type: 'danger-zone',
      status: 'danger',
      name: 'High Risk Area',
      description: 'Avoid this area - construction hazard'
    }
  ];

  const allLocations = [...locations, ...demoLocations];

  const initializeMap = (token: string) => {
    if (!mapContainer.current || map.current) return;

    mapboxgl.accessToken = token;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [-74.006, 40.7128], // NYC
      zoom: 11,
      pitch: 0,
    });

    // Add navigation controls
    map.current.addControl(
      new mapboxgl.NavigationControl({
        visualizePitch: true,
      }),
      'top-right'
    );

    // Add geolocate control
    map.current.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true
        },
        trackUserLocation: true,
        showUserHeading: true
      }),
      'top-right'
    );

    // Add scale control
    map.current.addControl(new mapboxgl.ScaleControl());

    addMarkers();
  };

  const addMarkers = () => {
    if (!map.current) return;

    // Clear existing markers
    markers.current.forEach(marker => marker.remove());
    markers.current = [];

    allLocations.forEach(location => {
      const el = document.createElement('div');
      el.className = 'marker-container';
      el.style.width = '32px';
      el.style.height = '32px';
      el.style.borderRadius = '50%';
      el.style.display = 'flex';
      el.style.alignItems = 'center';
      el.style.justifyContent = 'center';
      el.style.cursor = 'pointer';
      el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
      el.style.border = '2px solid white';

      // Set colors based on type and status
      switch (location.type) {
        case 'traveler':
          el.style.backgroundColor = location.status === 'safe' ? '#22c55e' : '#eab308';
          el.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" width="20" height="20"><path d="M12 2C10.9 2 10 2.9 10 4s.9 2 2 2 2-.9 2-2-.9-2-2-2m0 4c-2.7 0-5.8 1.3-6 5.2V22h2v-6h8v6h2v-10.8C17.8 7.3 14.7 6 12 6z"/></svg>`;
          break;
        case 'friend':
          el.style.backgroundColor = '#3b82f6';
          el.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" width="20" height="20"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3m0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>`;
          break;
        case 'alert':
          el.style.backgroundColor = '#eab308';
          el.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" width="20" height="20"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>`;
          break;
        case 'danger-zone':
          el.style.backgroundColor = '#ef4444';
          el.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" width="20" height="20"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>`;
          break;
        case 'safe-zone':
          el.style.backgroundColor = '#22c55e';
          el.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" width="20" height="20"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 11l-3-3 1.41-1.41L10 9.17l5.59-5.59L17 5l-7 7z"/></svg>`;
          break;
      }

      // Create popup
      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
        <div class="p-2">
          <h3 class="font-semibold text-sm">${location.name}</h3>
          <p class="text-xs text-gray-600">${location.description}</p>
          <div class="mt-1">
            <span class="inline-block px-2 py-1 text-xs rounded-full ${
              location.status === 'safe' ? 'bg-green-100 text-green-800' :
              location.status === 'caution' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }">
              ${location.status?.toUpperCase()}
            </span>
          </div>
        </div>
      `);

      const marker = new mapboxgl.Marker(el)
        .setLngLat([location.lng, location.lat])
        .setPopup(popup)
        .addTo(map.current!);

      markers.current.push(marker);
    });
  };

  useEffect(() => {
    if (mapboxToken && !map.current) {
      initializeMap(mapboxToken);
    }
  }, [mapboxToken]);

  useEffect(() => {
    if (map.current) {
      addMarkers();
    }
  }, [locations]);

  useEffect(() => {
    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, []);

  if (showTokenInput && !mapboxToken) {
    return (
      <Card className="p-6 bg-gradient-to-br from-primary/5 to-info/5">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center w-16 h-16 mx-auto bg-primary/10 rounded-full">
            <MapPin className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-xl font-semibold">SafeTour Map Integration</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Enter your Mapbox public token to enable real-time location tracking, 
            route monitoring, and safety alerts. Get your token at{' '}
            <a href="https://mapbox.com" target="_blank" rel="noopener noreferrer" 
               className="text-primary hover:underline">
              mapbox.com
            </a>
          </p>
          <div className="flex gap-2 max-w-md mx-auto">
            <Input
              type="password"
              placeholder="Enter Mapbox public token..."
              value={mapboxToken}
              onChange={(e) => setMapboxToken(e.target.value)}
              className="flex-1"
            />
            <Button 
              onClick={() => setShowTokenInput(false)}
              disabled={!mapboxToken}
              className="bg-gradient-to-r from-primary to-info hover:from-primary/90 hover:to-info/90"
            >
              Load Map
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className={`relative ${height} w-full rounded-lg overflow-hidden shadow-lg`}>
      <div ref={mapContainer} className="absolute inset-0" />
      
      {showControls && (
        <div className="absolute top-4 left-4 space-y-2 z-10">
          <Button
            size="sm"
            variant="secondary"
            className="shadow-lg bg-white/90 backdrop-blur-sm"
            onClick={() => {
              if (map.current) {
                map.current.flyTo({
                  center: [-74.006, 40.7128],
                  zoom: 11,
                  pitch: 0
                });
              }
            }}
          >
            <MapPin className="w-4 h-4 mr-2" />
            Reset View
          </Button>
        </div>
      )}

      {/* Map Legend */}
      <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg z-10">
        <h4 className="text-sm font-semibold mb-2">Legend</h4>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-safe rounded-full"></div>
            <span>Safe Traveler</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-info rounded-full"></div>
            <span>Friend</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-caution rounded-full"></div>
            <span>Alert</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-danger rounded-full"></div>
            <span>Danger Zone</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SafeTourMap;
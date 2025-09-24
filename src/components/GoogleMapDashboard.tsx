import React, { useEffect, useRef } from 'react';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

interface GoogleMapDashboardProps {
  userLocation: { lat: number; lng: number } | null;
}

const dummyDangerZones = [
  { latOffset: 0.01, lngOffset: 0.01, label: 'High risk area' },
  { latOffset: -0.01, lngOffset: -0.01, label: 'Medium risk area' },
  { latOffset: 0.015, lngOffset: -0.008, label: 'Low risk area' },
];

const GoogleMapDashboard: React.FC<GoogleMapDashboardProps> = ({ userLocation }) => {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!userLocation) return;
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}`;
    script.async = true;
    script.onload = () => {
      if (window.google && mapRef.current) {
        const map = new window.google.maps.Map(mapRef.current, {
          center: userLocation,
          zoom: 14,
        });
        // User marker
        new window.google.maps.Marker({
          position: userLocation,
          map,
          title: 'Your current location',
          icon: {
            url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
          },
        });
        // Danger zones
        dummyDangerZones.forEach(zone => {
          const dangerLoc = {
            lat: userLocation.lat + zone.latOffset,
            lng: userLocation.lng + zone.lngOffset,
          };
          new window.google.maps.Circle({
            strokeColor: '#FF0000',
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: '#FF0000',
            fillOpacity: 0.35,
            map,
            center: dangerLoc,
            radius: 400,
          });
          new window.google.maps.Marker({
            position: dangerLoc,
            map,
            title: zone.label,
            icon: {
              url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
            },
          });
        });
      }
    };
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, [userLocation]);

  return (
    <div className="w-full h-[400px] rounded-lg shadow-lg" ref={mapRef} />
  );
};

export default GoogleMapDashboard;

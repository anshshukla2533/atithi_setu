import React, { useEffect, useRef } from 'react';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

const dummyDangerZones = [
  { lat: 28.6139, lng: 77.2090, radius: 500 }, // Delhi center
  { lat: 28.6200, lng: 77.2200, radius: 300 },
  { lat: 28.6100, lng: 77.2000, radius: 400 },
];

const GoogleMapDanger: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}`;
    script.async = true;
    script.onload = () => {
      if (window.google && mapRef.current) {
        const center = { lat: 28.6139, lng: 77.2090 };
        const map = new window.google.maps.Map(mapRef.current, {
          center,
          zoom: 13,
        });
        // User marker
        new window.google.maps.Marker({
          position: center,
          map,
          title: 'You are here',
        });
        // Danger zones
        dummyDangerZones.forEach(zone => {
          new window.google.maps.Circle({
            strokeColor: '#FF0000',
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: '#FF0000',
            fillOpacity: 0.35,
            map,
            center: { lat: zone.lat, lng: zone.lng },
            radius: zone.radius,
          });
        });
      }
    };
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className="w-full h-[400px] rounded-lg shadow-lg" ref={mapRef} />
  );
};

export default GoogleMapDanger;

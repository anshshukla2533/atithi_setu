import React from "react";
import { GoogleMap, Marker, InfoWindow, useJsApiLoader, Polyline } from "@react-google-maps/api";
import { useCallback, useRef } from "react";

const containerStyle = {
  width: "100%",
  height: "400px"
};

// Example: center on India
const defaultCenter = {
  lat: 20.5937,
  lng: 78.9629
};

export interface LiveUserMarker {
  id: string;
  lat: number;
  lng: number;
  name?: string;
  status?: string;
}

interface GoogleLiveMapProps {
  markers?: LiveUserMarker[];
  center?: { lat: number; lng: number };
  zoom?: number;
  polyline?: { lat: number; lng: number }[];
  fitBounds?: { lat: number; lng: number }[];
}

export const GoogleLiveMap: React.FC<GoogleLiveMapProps> = ({ markers = [], center = defaultCenter, zoom = 5, polyline, fitBounds }) => {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string
  });
  const [selected, setSelected] = React.useState<LiveUserMarker | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null)

  const handleLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map
  }, [])

  // apply fitBounds when provided/changed
  React.useEffect(() => {
    if (!mapRef.current) return
    if (!fitBounds || !Array.isArray(fitBounds) || fitBounds.length === 0) return
    try {
      const bounds = new google.maps.LatLngBounds()
      fitBounds.forEach((pt) => bounds.extend(pt))
      mapRef.current.fitBounds(bounds)
    } catch (err) {
      console.warn('Failed to apply fitBounds', err)
    }
  }, [fitBounds])

  if (!isLoaded) return <div>Loading map...</div>;

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={zoom}
      onLoad={handleLoad}
    >
      {polyline && polyline.length > 0 && (
        <Polyline
          path={polyline}
          options={{ strokeColor: '#FF0000', strokeWeight: 3 }}
        />
      )}
      {markers.map(marker => (
        <Marker
          key={marker.id}
          position={{ lat: marker.lat, lng: marker.lng }}
          onClick={() => setSelected(marker)}
        />
      ))}
      {selected && (
        <InfoWindow
          position={{ lat: selected.lat, lng: selected.lng }}
          onCloseClick={() => setSelected(null)}
        >
          <div>
            <div><b>{selected.name || "User"}</b></div>
            {selected.status && <div>Status: {selected.status}</div>}
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
};

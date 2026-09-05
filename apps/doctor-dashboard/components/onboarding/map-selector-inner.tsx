'use client';

import { useState, useCallback, useRef, forwardRef, useImperativeHandle, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const icon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export interface MapSelectorHandle {
  flyTo: (lat: number, lng: number, zoom?: number) => void;
}

interface MapSelectorInnerProps {
  onLocationSelect: (lat: number, lng: number) => void;
  defaultPosition?: [number, number];
  markerPosition?: [number, number] | null;
}

function MapEventsHandler({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function FlyToHandler({ target }: { target: { lat: number; lng: number; zoom: number } | null }) {
  const map = useMap();
  useEffect(() => {
    if (target) {
      map.flyTo([target.lat, target.lng], target.zoom, { duration: 1.2 });
    }
  }, [target, map]);
  return null;
}

const MapSelectorInner = forwardRef<MapSelectorHandle, MapSelectorInnerProps>(
  function MapSelectorInner({ onLocationSelect, defaultPosition, markerPosition }, ref) {
    const center = defaultPosition ?? [-34.6037, -58.3816];
    const [flyTarget, setFlyTarget] = useState<{ lat: number; lng: number; zoom: number } | null>(null);

    const flyTo = useCallback((lat: number, lng: number, zoom = 15) => {
      setFlyTarget({ lat, lng, zoom });
    }, []);

    useImperativeHandle(ref, () => ({ flyTo }), [flyTo]);

    const handleLocationSelect = useCallback((lat: number, lng: number) => {
      setFlyTarget(null);
      onLocationSelect(lat, lng);
    }, [onLocationSelect]);

    return (
      <div className="h-[400px] w-full rounded-xl overflow-hidden border border-border">
        <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          <MapEventsHandler onLocationSelect={handleLocationSelect} />
          <FlyToHandler target={flyTarget} />
          {markerPosition && <Marker position={markerPosition} icon={icon} />}
        </MapContainer>
      </div>
    );
  }
);

export default MapSelectorInner;

'use client';

import { useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const icon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface MapSelectorInnerProps {
  onLocationSelect: (lat: number, lng: number) => void;
  defaultPosition?: [number, number];
}

function LocationMarker({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
  const [position, setPosition] = useState<[number, number] | null>(null);

  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      const pos: [number, number] = [lat, lng];
      setPosition(pos);
      onLocationSelect(lat, lng);
    },
  });

  useMapEvents({
    dragend(e) {
      const { lat, lng } = e.target.getLatLng();
      setPosition([lat, lng]);
      onLocationSelect(lat, lng);
    },
  });

  return position ? <Marker position={position} icon={icon} draggable /> : null;
}

export default function MapSelectorInner({ onLocationSelect, defaultPosition }: MapSelectorInnerProps) {
  const center = defaultPosition ?? [-34.6037, -58.3816];

  return (
    <div className="h-[400px] w-full rounded-xl overflow-hidden border border-border">
      <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        <LocationMarker onLocationSelect={onLocationSelect} />
      </MapContainer>
    </div>
  );
}

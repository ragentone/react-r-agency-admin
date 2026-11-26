import { Map, MapMarker, MapTileLayer } from '@ui/shad-cn/components/map';
import React from 'react';

/** The Leaflet map itself – loaded on demand (own chunk), see `MapBlock`. */
const MapLeaflet: React.FC<{ lat: number; lon: number; zoom: number; label: string }> = ({
  lat,
  lon,
  zoom,
  label,
}) => {
  // One finger must scroll the page on phones – the map moves with two fingers / the buttons.
  const touch = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;
  return (
    <Map
      center={[lat, lon]}
      zoom={zoom}
      scrollWheelZoom={false}
      dragging={!touch}
      aria-label={label}
      className="!z-0 min-h-0 rounded-none"
    >
      <MapTileLayer />
      <MapMarker position={[lat, lon]} />
    </Map>
  );
};

export default MapLeaflet;

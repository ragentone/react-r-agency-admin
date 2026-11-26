import {
  LeafletMap,
  type LeafletMapVariant,
  LeafletMapVariantSelector,
  LeafletMarker,
} from '@ui/shad-cn/components/leaflet-map';
import { MapPin } from 'lucide-react';
import React, { useState } from 'react';

/** Styles the visitor can switch between. */
const VARIANTS: LeafletMapVariant[] = ['default', 'streets', 'outdoors', 'satellite-streets'];

/**
 * The Leaflet map itself – loaded on demand (own chunk), see `MapBlock`. Read-only: no zoom
 * buttons, dragging or wheel – the only control is the map style selector.
 */
const MapLeaflet: React.FC<{ lat: number; lon: number; zoom: number; label: string }> = ({
  lat,
  lon,
  zoom,
  label,
}) => {
  const [variant, setVariant] = useState<LeafletMapVariant>('default');
  return (
    <div className="relative size-full">
      <LeafletMap
        variant={variant}
        center={[lon, lat]}
        zoom={zoom}
        navigation={false}
        scrollWheelZoom={false}
        aria-label={label}
        onCreated={map => {
          map.dragging.disable();
          map.touchZoom.disable();
          map.doubleClickZoom.disable();
          map.boxZoom.disable();
          map.keyboard.disable();
          map.scrollWheelZoom.disable();
        }}
      >
        <LeafletMarker lngLat={[lon, lat]} anchor="bottom" title={label}>
          <MapPin className="size-9 fill-foreground stroke-background" aria-hidden="true" />
        </LeafletMarker>
      </LeafletMap>
      <LeafletMapVariantSelector
        position="top-right"
        variants={VARIANTS}
        value={variant}
        onValueChange={setVariant}
      />
    </div>
  );
};

export default MapLeaflet;

import { useEffect, useMemo } from 'react';
import {
  MapContainer,
  TileLayer,
  GeoJSON,
  useMap,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

/**
 * Fit map bounds to supplied GeoJSON feature collection.
 */
function FitBounds({ features }) {
  const map = useMap();

  useEffect(() => {
    if (!features?.length) {
      // default extent (roughly QLD / NSW region)
      map.fitBounds([
        [-39, 137],
        [-9, 155],
      ]);
      return;
    }

    const coords = [];
    features.forEach((f) => {
      const g = f.geometry;
      if (!g) return;
      const addRing = (ring) => ring.forEach(([x, y]) => coords.push([y, x]));
      if (g.type === 'Polygon') {
        g.coordinates.forEach(addRing);
      } else if (g.type === 'MultiPolygon') {
        g.coordinates.forEach((poly) => poly.forEach(addRing));
      }
    });

    if (coords.length) {
      map.fitBounds(coords);
    }
  }, [features, map]);

  return null;
}

/**
 * Map with styled parcel overlay.
 */
export default function ParcelMap({ features, style }) {
  const collection = useMemo(
    () => ({ type: 'FeatureCollection', features }),
    [features],
  );

  const styleFn = () => ({
    weight: style.weight,
    color: style.outline,
    fillColor: style.fill,
    fillOpacity: style.opacity,
  });

  return (
    <div className="map">
      <MapContainer
        center={[-23.5, 143.0]}
        zoom={5}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <TileLayer
          attribution="&copy; CartoDB"
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        {/* Satellite option */}
        <TileLayer
          attribution="Google"
          url="https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
        />

        {features.length > 0 && (
          <GeoJSON key={features.length} data={collection} style={styleFn} />
        )}
        <FitBounds features={features} />
      </MapContainer>
    </div>
  );
}

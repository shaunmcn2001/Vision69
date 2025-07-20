import { useEffect, useMemo } from 'react';
import {
  MapContainer,
  TileLayer,
  GeoJSON,
  useMap,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

function FitBounds({ features }) {
  const map = useMap();
  useEffect(() => {
    if (!features.length) {
      map.fitBounds([
        [-39, 137],
        [-9, 155],
      ]);
      return;
    }
    const pts = [];
    features.forEach((f) => {
      const g = f.geometry;
      if (!g) return;
      const pushRing = (ring) => ring.forEach(([x, y]) => pts.push([y, x]));
      if (g.type === 'Polygon') g.coordinates.forEach(pushRing);
      if (g.type === 'MultiPolygon')
        g.coordinates.forEach((poly) => poly.forEach(pushRing));
    });
    if (pts.length) map.fitBounds(pts);
  }, [features, map]);
  return null;
}

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

  const onEach = (feature, layer) => {
    const p = feature.properties || {};
    const rows = Object.entries(p)
      .filter(([, v]) => v !== '' && v !== null)
      .map(
        ([k, v]) => `<tr><th>${k}</th><td>${v}</td></tr>`,
      )
      .join('');
    layer.bindPopup(`<table>${rows}</table>`, { maxHeight: 200 });
  };

  return (
    <div className="map">
      <MapContainer
        center={[-23.5, 143.0]}
        zoom={5}
        style={{ height: '100%', width: '100%' }}
      >
        {/* basemaps … */}
        {features.length > 0 && (
          <GeoJSON
            key={features.length}
            data={collection}
            style={styleFn}
            onEachFeature={onEach}
            pane="overlayPane"
          />
        )}
        <FitBounds features={features} />
      </MapContainer>
    </div>
  );
}

import { useEffect, useMemo } from 'react';
import {
  MapContainer,
  TileLayer,
  GeoJSON,
  LayersControl,
  useMap,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const { BaseLayer } = LayersControl;

/* ── fit map to parcel bounds ─────────────────────────────────── */
function FitBounds({ features }) {
  const map = useMap();

  useEffect(() => {
    if (!features.length) {
      map.fitBounds([[-39, 137], [-9, 155]]); // default AU east coast
      return;
    }

    const pts = [];
    const pushRing = (ring) => ring.forEach(([x, y]) => pts.push([y, x]));

    features.forEach((f) => {
      const g = f.geometry;
      if (!g) return;
      if (g.type === 'Polygon') g.coordinates.forEach(pushRing);
      if (g.type === 'MultiPolygon')
        g.coordinates.forEach((poly) => poly.forEach(pushRing));
    });

    if (pts.length) map.fitBounds(pts);
  }, [features, map]);

  return null;
}

/* ── full map component ───────────────────────────────────────── */
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

  /* simple popup table */
  const onEach = (feature, layer) => {
    const rows = Object.entries(feature.properties || {})
      .filter(([, v]) => v !== '' && v !== null)
      .map(([k, v]) => `<tr><th>${k}</th><td>${v}</td></tr>`)
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
        <LayersControl position="topleft" collapsed={false}>
          <BaseLayer checked name="CartoDB Positron">
            <TileLayer
              attribution="&copy; CartoDB"
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            />
          </BaseLayer>

          <BaseLayer name="OpenStreetMap">
            <TileLayer
              attribution="&copy; OpenStreetMap contributors"
              url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          </BaseLayer>

          <BaseLayer name="Google Satellite">
            <TileLayer
              attribution="Google"
              url="https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
            />
          </BaseLayer>
        </LayersControl>

        {features.length > 0 && (
          <GeoJSON
            key={features.length}
            data={collection}
            style={styleFn}
            onEachFeature={onEach}
            pane="overlayPane"      /* keep below marker pane, above tiles */
          />
        )}
        <FitBounds features={features} />
      </MapContainer>
    </div>
  );
}
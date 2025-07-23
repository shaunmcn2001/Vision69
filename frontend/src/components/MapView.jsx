import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { API_BASE } from '../api';

export default function MapView() {
  const mapRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: 'https://demotiles.maplibre.org/style.json',
      center: [153.0, -27.5],
      zoom: 10,
    });

    map.addControl(new maplibregl.NavigationControl(), 'top-right');

    map.on('load', () => {
      fetch(`${API_BASE}/api/parcels`)
        .then((r) => r.json())
        .then((data) => {
          if (!map.getSource('parcels')) {
            map.addSource('parcels', { type: 'geojson', data });
            map.addLayer({
              id: 'parcel-boundaries',
              type: 'line',
              source: 'parcels',
              paint: { 'line-color': '#ff0000', 'line-width': 2 },
            });
          }
        })
        .catch((err) => console.error('Failed to load parcels', err));
    });

    mapRef.current = map;
    return () => map.remove();
  }, []);

  return <div ref={containerRef} style={{ width: '100%', height: '100vh' }} />;
}

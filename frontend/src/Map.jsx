import { useRef, useEffect } from 'react';
import maplibregl from 'maplibre-gl';

export default function Map({ features = [], style = {}, onFeatureClick, sidebarOpen, searchOpen }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    mapRef.current = new maplibregl.Map({
      container: containerRef.current,
      style: {
        version: 8,
        sources: {
          osm: {
            type: 'raster',
            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '© OpenStreetMap contributors',
          },
        },
        layers: [{ id: 'osm', type: 'raster', source: 'osm' }],
      },
      center: [143.0, -23.5],
      zoom: 5,
    });
    mapRef.current.addControl(new maplibregl.NavigationControl(), 'top-right');
    return () => mapRef.current.remove();
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const collection = {
      type: 'FeatureCollection',
      features: features.map((f, i) => ({
        ...f,
        properties: { ...(f.properties || {}), _idx: i },
      })),
    };

    if (map.getSource('parcels')) {
      map.getSource('parcels').setData(collection);
    } else {
      map.addSource('parcels', { type: 'geojson', data: collection });
      map.addLayer({
        id: 'parcels-fill',
        type: 'fill',
        source: 'parcels',
        paint: {
          'fill-color': style.fill,
          'fill-opacity': style.opacity,
          'fill-outline-color': style.outline,
        },
      });
      map.addLayer({
        id: 'parcels-line',
        type: 'line',
        source: 'parcels',
        paint: {
          'line-color': style.outline,
          'line-width': style.weight,
        },
      });

      map.on('click', 'parcels-fill', (e) => {
        const idx = e.features?.[0]?.properties?._idx;
        if (onFeatureClick && typeof idx === 'number') onFeatureClick(idx);
      });

      map.on('mouseenter', 'parcels-fill', () => {
        map.getCanvas().style.cursor = 'pointer';
      });
      map.on('mouseleave', 'parcels-fill', () => {
        map.getCanvas().style.cursor = '';
      });
    }

    if (features.length) {
      const bbox = computeBbox(features);
      if (bbox) map.fitBounds(bbox, { padding: 20 });
    } else {
      map.fitBounds([
        [137, -39],
        [155, -9],
      ]);
    }
  }, [features]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.getLayer('parcels-fill')) return;
    map.setPaintProperty('parcels-fill', 'fill-color', style.fill);
    map.setPaintProperty('parcels-fill', 'fill-opacity', style.opacity);
    map.setPaintProperty('parcels-fill', 'fill-outline-color', style.outline);
    map.setPaintProperty('parcels-line', 'line-color', style.outline);
    map.setPaintProperty('parcels-line', 'line-width', style.weight);
  }, [style]);

  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.resize();
  }, [sidebarOpen, searchOpen]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full"
    />
  );
}

function computeBbox(features) {
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;

  const visit = (c) => {
    if (typeof c[0] === 'number') {
      const [x, y] = c;
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    } else {
      c.forEach(visit);
    }
  };

  features.forEach((f) => {
    const g = f.geometry;
    if (g && g.coordinates) visit(g.coordinates);
  });

  if (minX === Infinity) return null;
  return [
    [minX, minY],
    [maxX, maxY],
  ];
}

// frontend/src/MapboxMap.jsx
import {useEffect, useRef, useState, useMemo} from 'react';
import mapboxgl from 'mapbox-gl';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || '';

export default function MapboxMap({
  features = [],
  style = { fill: '#ff0000', outline: '#000', opacity: 0.5, weight: 2 },
  selected = {},
  onFeatureClick
}) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Ensure the FeatureCollection is stable & carries a _idx on each feature
  const collection = useMemo(() => ({
    type: 'FeatureCollection',
    features: (features || []).map((f, i) => ({
      ...f,
      properties: { ...(f.properties || {}), _idx: i }
    }))
  }), [features]);

  // 1) Create map ONCE, into an EMPTY container
  useEffect(() => {
    if (!containerRef.current) return;
    if (!mapboxgl.accessToken) {
      console.error('VITE_MAPBOX_TOKEN missing. Set it in Render and rebuild.');
      return;
    }
    if (mapRef.current) return; // guard against double init

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12', // any Mapbox style
      center: [153.0, -27.5],
      zoom: 8
    });

    map.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // When style is loaded, we can safely add sources/layers
    map.on('load', () => {
      setMapLoaded(true);

      // init sources/layers
      if (!map.getSource('parcels')) {
        map.addSource('parcels', { type: 'geojson', data: collection });
      }
      if (!map.getLayer('parcels-fill')) {
        map.addLayer({
          id: 'parcels-fill',
          type: 'fill',
          source: 'parcels',
          paint: {
            'fill-color': style.fill,
            'fill-opacity': style.opacity,
            'fill-outline-color': style.outline
          }
        });
      }
      if (!map.getLayer('parcels-line')) {
        map.addLayer({
          id: 'parcels-line',
          type: 'line',
          source: 'parcels',
          paint: {
            'line-color': style.outline,
            'line-width': style.weight
          }
        });
      }
      if (!map.getLayer('parcels-selected')) {
        map.addLayer({
          id: 'parcels-selected',
          type: 'line',
          source: 'parcels',
          filter: ['in', ['get', '_idx'], ['literal', []]],
          paint: { 'line-color': '#ffd60a', 'line-width': 3 }
        });
      }

      // Click → tell parent which feature index was clicked
      map.on('click', 'parcels-fill', (e) => {
        const idx = e.features?.[0]?.properties?._idx;
        if (typeof idx === 'number' && onFeatureClick) onFeatureClick(idx);
      });

      // Initial fit
      fitToFeatures(map, collection);
    });

    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
      setMapLoaded(false);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2) Update data AFTER map is loaded
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    const src = map.getSource('parcels');
    if (src) {
      src.setData(collection);
    } else {
      // Style may have been reloaded; re-add source & layers safely
      map.addSource('parcels', { type: 'geojson', data: collection });
      if (!map.getLayer('parcels-fill')) {
        map.addLayer({
          id: 'parcels-fill',
          type: 'fill',
          source: 'parcels',
          paint: {
            'fill-color': style.fill,
            'fill-opacity': style.opacity,
            'fill-outline-color': style.outline
          }
        });
      }
      if (!map.getLayer('parcels-line')) {
        map.addLayer({
          id: 'parcels-line',
          type: 'line',
          source: 'parcels',
          paint: { 'line-color': style.outline, 'line-width': style.weight }
        });
      }
      if (!map.getLayer('parcels-selected')) {
        map.addLayer({
          id: 'parcels-selected',
          type: 'line',
          source: 'parcels',
          filter: ['in', ['get', '_idx'], ['literal', []]],
          paint: { 'line-color': '#ffd60a', 'line-width': 3 }
        });
      }
    }

    // Fit when features change
    fitToFeatures(map, collection);
  }, [collection, mapLoaded]);

  // 3) Update styling AFTER map is loaded
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;
    if (map.getLayer('parcels-fill')) {
      map.setPaintProperty('parcels-fill', 'fill-color', style.fill);
      map.setPaintProperty('parcels-fill', 'fill-opacity', style.opacity);
      map.setPaintProperty('parcels-fill', 'fill-outline-color', style.outline);
    }
    if (map.getLayer('parcels-line')) {
      map.setPaintProperty('parcels-line', 'line-color', style.outline);
      map.setPaintProperty('parcels-line', 'line-width', style.weight);
    }
  }, [style, mapLoaded]);

  // 4) Reflect selection in a separate layer filter
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;
    const selectedIdx = Object.entries(selected)
      .filter(([, v]) => v)
      .map(([k]) => Number(k));
    if (map.getLayer('parcels-selected')) {
      map.setFilter('parcels-selected', [
        'in',
        ['get', '_idx'],
        ['literal', selectedIdx]
      ]);
    }
  }, [selected, mapLoaded]);

  return (
    <div className="relative w-full h-full">
      {/* IMPORTANT: this must be EMPTY when the map is created */}
      <div ref={containerRef} className="absolute inset-0" />
      {/* Any overlays (measurement readout, legends, buttons) should be siblings */}
      {/* <div className="absolute left-2 bottom-2 bg-white/90 p-2 rounded shadow pointer-events-none">
        {measurementText}
      </div> */}
    </div>
  );
}

// Helper: fit bounds if we have geometry
function fitToFeatures(map, fc) {
  if (!fc.features?.length) return;
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  const visit = (c) => {
    if (typeof c[0] === 'number') {
      if (c[0] < minX) minX = c[0];
      if (c[1] < minY) minY = c[1];
      if (c[0] > maxX) maxX = c[0];
      if (c[1] > maxY) maxY = c[1];
    } else {
      c.forEach(visit);
    }
  };
  fc.features.forEach(f => f?.geometry?.coordinates && visit(f.geometry.coordinates));
  if (minX !== Infinity) {
    map.fitBounds([[minX, minY], [maxX, maxY]], { padding: 20, duration: 0 });
  }
}

import { useEffect, useMemo, useRef, useState } from 'react';
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

  const collection = useMemo(() => ({
    type: 'FeatureCollection',
    features: (features || []).map((f, i) => ({
      ...f,
      properties: { ...(f.properties || {}), _idx: i }
    }))
  }), [features]);

  // Create map into an EMPTY container; add resize observer
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    if (!mapboxgl.accessToken) {
      console.error('VITE_MAPBOX_TOKEN missing at build time');
      return;
    }

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [153.0, -27.5],
      zoom: 8
    });

    map.addControl(new mapboxgl.NavigationControl(), 'top-right');

    map.on('load', () => {
      setMapLoaded(true);

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

      map.on('click', 'parcels-fill', (e) => {
        const idx = e.features?.[0]?.properties?._idx;
        if (typeof idx === 'number' && onFeatureClick) onFeatureClick(idx);
      });

      fitToFeatures(map, collection);
      map.resize();
    });

    const ro = new ResizeObserver(() => map.resize());
    ro.observe(containerRef.current);

    mapRef.current = map;
    return () => {
      ro.disconnect();
      map.remove();
      mapRef.current = null;
      setMapLoaded(false);
    };
  }, [collection, style.fill, style.opacity, style.outline, style.weight, onFeatureClick]);

  // Update data after load (handles style reloads)
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    const src = map.getSource('parcels');
    if (src) {
      src.setData(collection);
    } else {
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

    fitToFeatures(map, collection);
  }, [collection, mapLoaded]);

  // Update style after load
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

  // Update selection filter
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;
    const selectedIdx = Object.entries(selected).filter(([, v]) => v).map(([k]) => Number(k));
    if (map.getLayer('parcels-selected')) {
      map.setFilter('parcels-selected', ['in', ['get', '_idx'], ['literal', selectedIdx]]);
    }
  }, [selected, mapLoaded]);

  return (
    <div className="relative w-full h-full">
      {/* IMPORTANT: this must be empty when the map is created */}
      <div ref={containerRef} className="absolute inset-0" />
    </div>
  );
}

function fitToFeatures(map, fc) {
  if (!fc.features?.length) return;
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  const visit = (c) => {
    if (typeof c[0] === 'number') {
      if (c[0] < minX) minX = c[0];
      if (c[1] < minY) minY = c[1];
      if (c[0] > maxX) maxX = c[0];
      if (c[1] > maxY) maxY = c[1];
    } else { c.forEach(visit); }
  };
  fc.features.forEach(f => f?.geometry?.coordinates && visit(f.geometry.coordinates));
  if (minX !== Infinity) {
    map.fitBounds([[minX, minY], [maxX, maxY]], { padding: 20, duration: 0 });
  }
}

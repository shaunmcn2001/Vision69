import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import * as turf from '@turf/turf';

// Mapbox access token must be provided via environment variable. See
// `.env.example` and README for details. Without a valid token the
// map will not render.
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

/**
 * Render a Mapbox GL map with a base map, search, drawing and measurement tools.
 *
 * Props:
 *   features: array of GeoJSON features to show on the map.
 *   style: object controlling fill colour, outline colour, opacity and weight of
 *     the feature overlay. Should contain { fill, outline, opacity, weight }.
 *   onFeatureClick: callback invoked with the index of the clicked feature.
 */
export default function MapboxMap({ features, style, selected = {}, onFeatureClick }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const drawRef = useRef(null);

  // Initialise the map once when the component mounts.
  useEffect(() => {
    if (!containerRef.current) return;
    // Create map
    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [143.0, -23.5],
      zoom: 5,
    });
    // Add navigation controls (zoom & rotation)
    map.addControl(new mapboxgl.NavigationControl(), 'top-right');
    // Add geocoder (address search)
    const geocoder = new MapboxGeocoder({
      accessToken: mapboxgl.accessToken,
      mapboxgl,
      marker: false,
    });
    map.addControl(geocoder, 'top-left');
    // Add draw controls (points, lines and polygons) but hide default draw labels
    const draw = new MapboxDraw({
      displayControlsDefault: false,
      controls: {
        point: true,
        line_string: true,
        polygon: true,
        trash: true,
      },
    });
    map.addControl(draw, 'top-left');
    // Setup measurement updating when drawings change
    const updateMeasurements = () => {
      const data = draw.getAll();
      let totalDistance = 0;
      let totalArea = 0;
      for (const feature of data.features) {
        if (!feature.geometry) continue;
        if (feature.geometry.type === 'LineString') {
          totalDistance += turf.length(feature, { units: 'kilometers' });
        } else if (feature.geometry.type === 'Polygon') {
          totalArea += turf.area(feature);
        }
      }
      const measureEl = containerRef.current?.querySelector('.measure-output');
      if (measureEl) {
        const parts = [];
        if (totalDistance > 0) parts.push(`${totalDistance.toFixed(2)} km`);
        if (totalArea > 0) parts.push(`${(totalArea / 1e6).toFixed(2)} km²`);
        measureEl.textContent = parts.join(' | ');
      }
    };
    map.on('draw.create', updateMeasurements);
    map.on('draw.update', updateMeasurements);
    map.on('draw.delete', updateMeasurements);
    // Keep references for updates
    mapRef.current = map;
    drawRef.current = draw;
    return () => map.remove();
  }, []);

  // Update the parcel overlay whenever features, style or selection change
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    // Build a FeatureCollection with indices recorded in properties
    const collection = {
      type: 'FeatureCollection',
      features: (features || []).map((f, i) => ({
        ...f,
        properties: { ...(f.properties || {}), _idx: i },
      })),
    };
    // Build a FeatureCollection of only the selected features
    const selectedCollection = {
      type: 'FeatureCollection',
      features: (features || []).filter((_, i) => selected && selected[i]),
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
      // Set up click handler for features
      map.on('click', 'parcels-fill', (e) => {
        const idx = e.features?.[0]?.properties?._idx;
        if (typeof idx === 'number' && onFeatureClick) onFeatureClick(idx);
      });
      // Change cursor on hover
      map.on('mouseenter', 'parcels-fill', () => {
        map.getCanvas().style.cursor = 'pointer';
      });
      map.on('mouseleave', 'parcels-fill', () => {
        map.getCanvas().style.cursor = '';
      });
    }
    // Add or update the selected features source/layer
    if (map.getSource('parcels-selected')) {
      map.getSource('parcels-selected').setData(selectedCollection);
    } else {
      map.addSource('parcels-selected', { type: 'geojson', data: selectedCollection });
      map.addLayer({
        id: 'parcels-selected',
        type: 'fill',
        source: 'parcels-selected',
        paint: {
          'fill-color': '#ffd700',
          'fill-opacity': 0.6,
        },
        // Draw selected parcels above the default fill layer
        before: 'parcels-fill',
      });
    }
    // Update paint properties when style changes
    if (map.getLayer('parcels-fill')) {
      map.setPaintProperty('parcels-fill', 'fill-color', style.fill);
      map.setPaintProperty('parcels-fill', 'fill-opacity', style.opacity);
      map.setPaintProperty('parcels-fill', 'fill-outline-color', style.outline);
    }
    if (map.getLayer('parcels-line')) {
      map.setPaintProperty('parcels-line', 'line-color', style.outline);
      map.setPaintProperty('parcels-line', 'line-width', style.weight);
    }
    // Fit the map to show all features or to default bounds when none provided
    if (features && features.length) {
      const bbox = computeBbox(features);
      if (bbox) map.fitBounds(bbox, { padding: 20, duration: 500 });
    }
  }, [features, style, selected]);

  return (
    <div ref={containerRef} className="mapbox-container">
      {/* measurement output is positioned absolutely within container */}
      <div className="measure-output"></div>
    </div>
  );
}

// Compute bounding box for a list of features. Returns [[minX, minY],[maxX,maxY]] or null
function computeBbox(features) {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  const visit = (coords) => {
    if (Array.isArray(coords) && typeof coords[0] === 'number') {
      const [x, y] = coords;
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    } else if (Array.isArray(coords)) {
      coords.forEach(visit);
    }
  };
  for (const f of features) {
    const g = f.geometry;
    if (g && g.coordinates) visit(g.coordinates);
  }
  if (minX === Infinity) return null;
  return [ [minX, minY], [maxX, maxY] ];
}
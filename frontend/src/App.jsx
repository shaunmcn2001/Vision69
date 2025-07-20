import { useState, useMemo, useEffect } from 'react';   // ← add useEffect
import ParcelMap from './ParcelMap.jsx';
import SearchPanel from './SearchPanel.jsx';
import { API_BASE } from './api.js';
import './App.css';

/**
 * Root layout: sidebar (search + style + downloads) + map.
 */
export default function App() {
  const [features, setFeatures] = useState([]);       // GeoJSON Feature[]
  const [selected, setSelected] = useState({});       // {rowIndex:boolean}
  const defaultStyle = {
    fill: '#FF0000',
    outline: '#000000',
    opacity: 0.5,
    weight: 2,
  };
  const [style, setStyle] = useState(() => {
   try {
      return JSON.parse(localStorage.getItem('parcelStyle')) || defaultStyle;
    } catch {
      return defaultStyle;
    }
  });

  // persist every change
  useEffect(() => {
    localStorage.setItem('parcelStyle', JSON.stringify(style));
  }, [style]);

  // toggle row selection
  const toggle = (idx) =>
    setSelected((s) => ({ ...s, [idx]: !s[idx] }));

  // reset selection when new results arrive
  const handleResults = (list) => {
    setFeatures(list);
    setSelected({});
  };

  // derived array of selected features (fallback to all)
  const chosen = useMemo(() => {
    const picked = features.filter((_, i) => selected[i]);
    return picked.length ? picked : features;
  }, [features, selected]);

  // download helper
  const download = async (type) => {
    if (!features.length) return;
    const resp = await fetch(`${API_BASE}/api/download/${type}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ features: chosen }),
    });
    if (!resp.ok) return;
    const blob = await resp.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = type === 'kml' ? 'parcels.kml' : 'parcels.zip';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="app">
      <SearchPanel
        onResults={handleResults}
        features={features}
        selected={selected}
        toggle={toggle}
        download={download}
        style={style}
        setStyle={setStyle}
      />
      <ParcelMap
        features={features}
        style={style}
      />
    </div>
  );
}

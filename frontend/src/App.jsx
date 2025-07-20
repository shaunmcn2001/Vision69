import { useState } from 'react';
import { GeoJSON } from 'react-leaflet';

import ParcelMap from './ParcelMap.jsx';
import SearchPanel from './SearchPanel.jsx';
import { API_BASE } from './api.js';
import './App.css';

export default function App() {
  const [features, setFeatures] = useState([]);
  const [selected, setSelected] = useState({});

  /* Handle search results coming back from <SearchPanel> */
  const handleResults = (list) => {
    setFeatures(list);
    setSelected({});
  };

  /* Toggle a row in the sidebar list */
  const toggle = (idx) =>
    setSelected((s) => ({ ...s, [idx]: !s[idx] }));

  /* Download either KML or SHP */
  const download = async (type) => {
    const sel = features.filter((_, i) => selected[i]);
    const resp = await fetch(`${API_BASE}/api/download/${type}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ features: sel.length ? sel : features }),
    });
    if (resp.ok) {
      const blob = await resp.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = type === 'kml' ? 'parcels.kml' : 'parcels.zip';
      a.click();
      window.URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="app">
      {/* ───────── Sidebar ───────── */}
      <div className="sidebar">
        <SearchPanel
          onResults={handleResults}
          features={features}
          selected={selected}
          toggle={toggle}
          download={download}
        />
      </div>

      {/* ───────── Map ───────── */}
      <ParcelMap>
        {features.length > 0 && (
          <GeoJSON
            data={features}
            style={() => ({
              color: '#ff0000',
              weight: 2,
              fillOpacity: 0.5,
            })}
          />
        )}
      </ParcelMap>
    </div>
  );
}

import { useState } from 'react';
import { GeoJSON } from 'react-leaflet';
import ParcelMap from './ParcelMap.jsx';
import SearchPanel from './SearchPanel.jsx';
import { API_BASE } from './api.js';
import './App.css';

function App() {
  const [features, setFeatures] = useState([]);
  const [selected, setSelected] = useState({});

  const handleResults = (list) => {
    setFeatures(list);
    setSelected({});
  };

  const toggle = (idx) => {
    setSelected((s) => ({ ...s, [idx]: !s[idx] }));
  };

  const download = async (type) => {
    const sel = features.filter((_, i) => selected[i]);
    const resp = await fetch(`${API_BASE}/api/download/${type}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ features: sel.length ? sel : features })
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
      <SearchPanel
        onResults={handleResults}
        features={features}
        selected={selected}
        toggle={toggle}
        download={download}
      />
      <ParcelMap>
        {features.length > 0 && (
          <GeoJSON data={{ type: 'FeatureCollection', features }} />
        )}
      </ParcelMap>
    </div>
  );
}

export default App;

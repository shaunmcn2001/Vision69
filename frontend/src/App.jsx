import { useState } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './App.css';

function App() {
  const [bulk, setBulk] = useState('');
  const [features, setFeatures] = useState([]);
  const [selected, setSelected] = useState({});

  const handleSearch = async () => {
    const resp = await fetch('/api/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ inputs: bulk.split('\n') })
    });
    if (resp.ok) {
      const data = await resp.json();
      setFeatures(data.features || []);
      setSelected({});
    }
  };

  const toggle = (idx) => {
    setSelected((s) => ({ ...s, [idx]: !s[idx] }));
  };

  const download = async (type) => {
    const sel = features.filter((_, i) => selected[i]);
    const resp = await fetch(`/api/download/${type}`, {
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
      <div className="sidebar">
        <h2>Search Parcels</h2>
        <textarea value={bulk} onChange={(e) => setBulk(e.target.value)} placeholder="Lot/Plan each line" />
        <button onClick={handleSearch}>Search</button>
        <div className="results">
          {features.map((f, i) => (
            <label key={i}>
              <input type="checkbox" checked={!!selected[i]} onChange={() => toggle(i)} />
              {f.properties.lot || f.properties.lotnumber} {f.properties.plan || f.properties.planlabel}
            </label>
          ))}
        </div>
        {features.length > 0 && (
          <div className="downloads">
            <button onClick={() => download('kml')}>Download KML</button>
            <button onClick={() => download('shp')}>Download SHP</button>
          </div>
        )}
      </div>
      <MapContainer
        className="map"
        center={[-27.467, 153.028]}
        zoom={10}
        style={{ height: '100vh' }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {features.length > 0 && (
          <GeoJSON data={{ type: 'FeatureCollection', features }} />
        )}
      </MapContainer>
    </div>
  );
}

export default App;
